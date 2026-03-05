import crypto from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { config } from "../config";
import { db } from "../db";
import { paginationSchema } from "../schemas";
import { getClientIp } from "../utils/security";

type QueryParams = Record<string, unknown>;
type CountRow = { count: string };
type LoginBody = { username?: string; password?: string; next?: string };
type LoginAttempt = { count: number; resetAt: number };

const ADMIN_COOKIE = "imperium_admin_session";
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const loginAttempts = new Map<string, LoginAttempt>();

function firstHeaderValue(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] || "" : value;
}

function queryValue(request: FastifyRequest, key: string): string {
  const query = request.query as QueryParams | undefined;
  const value = query?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value: unknown): string {
  const date = new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().replace("T", " ").slice(0, 19);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function getPrefix(request: FastifyRequest): string {
  const rawForwarded = firstHeaderValue(request.headers["x-forwarded-prefix"]).trim();
  const rawProxy = firstHeaderValue(request.headers["x-proxy-prefix"]).trim();
  const raw = rawProxy || rawForwarded;
  if (raw && raw.startsWith("/")) return raw.replace(/\/+$/, "");

  const forwardedHost = firstHeaderValue(request.headers["x-forwarded-host"]).trim();
  if (forwardedHost) return "/tracking";

  return "";
}

function withPrefix(request: FastifyRequest, path: string): string {
  const prefix = getPrefix(request);
  return prefix ? `${prefix}${path}` : path;
}

function normalizeNextPath(nextPath: string): string {
  const value = nextPath.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return "/admin/dashboard";
  if (value.startsWith("/login") || value.startsWith("/logout")) return "/admin/dashboard";
  return value;
}

function readCookie(request: FastifyRequest, name: string): string {
  const cookieHeader = firstHeaderValue(request.headers.cookie);
  if (!cookieHeader) return "";

  for (const pair of cookieHeader.split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return "";
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac("sha256", config.adminSessionSecret)
    .update(encodedPayload)
    .digest("base64url");
}

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function createSessionToken(): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + config.adminSessionHours * 3600;
  const payload = Buffer.from(
    JSON.stringify({ u: config.adminUser, iat: issuedAt, exp: expiresAt }),
  ).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

function verifySessionToken(token: string): boolean {
  if (!token.includes(".")) return false;
  const [payload, signature] = token.split(".", 2);
  if (!payload || !signature) return false;
  if (!timingSafeEqual(signature, signPayload(payload))) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      u?: string;
      exp?: number;
    };
    return decoded.u === config.adminUser && typeof decoded.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function hasValidSession(request: FastifyRequest): boolean {
  return verifySessionToken(readCookie(request, ADMIN_COOKIE));
}

function setSessionCookie(request: FastifyRequest, reply: FastifyReply) {
  const path = getPrefix(request) || "/";
  const secure =
    config.nodeEnv === "production" ||
    firstHeaderValue(request.headers["x-forwarded-proto"]).includes("https");

  const cookie = [
    `${ADMIN_COOKIE}=${encodeURIComponent(createSessionToken())}`,
    "HttpOnly",
    "SameSite=Lax",
    `Path=${path}`,
    `Max-Age=${config.adminSessionHours * 3600}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  reply.header("Set-Cookie", cookie);
}
function clearSessionCookie(request: FastifyRequest, reply: FastifyReply) {
  const path = getPrefix(request) || "/";
  const secure =
    config.nodeEnv === "production" ||
    firstHeaderValue(request.headers["x-forwarded-proto"]).includes("https");

  const cookie = [
    `${ADMIN_COOKIE}=`,
    "HttpOnly",
    "SameSite=Lax",
    `Path=${path}`,
    "Max-Age=0",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  reply.header("Set-Cookie", cookie);
}

function readAdminKey(request: FastifyRequest): string {
  const header = request.headers["x-admin-key"];
  if (typeof header === "string") return header.trim();

  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return queryValue(request, "key");
}

function verifyAdminPassword(password: string): boolean {
  const candidate = password.trim();
  if (!candidate) return false;

  const stored = config.adminPasswordHash;
  if (stored.startsWith("scrypt$")) {
    const [, saltHex, hashHex] = stored.split("$");
    if (!saltHex || !hashHex) return false;
    const computed = crypto
      .scryptSync(candidate, Buffer.from(saltHex, "hex"), 64)
      .toString("hex");
    return timingSafeEqual(computed, hashHex);
  }

  if (stored) {
    return timingSafeEqual(candidate, stored);
  }

  return timingSafeEqual(candidate, config.adminPrivateKey);
}

function consumeLoginAttempt(ip: string): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const state = loginAttempts.get(ip);

  if (!state || state.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (state.count >= LOGIN_MAX_ATTEMPTS) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((state.resetAt - now) / 1000)),
    };
  }

  state.count += 1;
  loginAttempts.set(ip, state);
  return { ok: true, retryAfterSeconds: 0 };
}

function resetLoginAttempt(ip: string) {
  loginAttempts.delete(ip);
}

function assertApiAuth(request: FastifyRequest, reply: FastifyReply): boolean {
  if (hasValidSession(request)) return true;

  const provided = readAdminKey(request);
  if (provided && timingSafeEqual(provided, config.adminPrivateKey)) {
    return true;
  }

  void reply.code(401).send({ ok: false, error: "Unauthorized" });
  return false;
}

function assertPanelAuth(request: FastifyRequest, reply: FastifyReply): boolean {
  if (hasValidSession(request)) return true;

  const nextPath = encodeURIComponent(normalizeNextPath(request.raw.url || "/admin/dashboard"));
  void reply
    .code(302)
    .header("Location", `${withPrefix(request, "/login")}?next=${nextPath}`)
    .send();
  return false;
}

function replyHtml(reply: FastifyReply, html: string) {
  return reply
    .header("Content-Type", "text/html; charset=utf-8")
    .header("Cache-Control", "no-store, max-age=0")
    .header("X-Robots-Tag", "noindex, nofollow, noarchive")
    .send(html);
}

function toCsv(headers: string[], rows: Array<Record<string, unknown>>): string {
  const esc = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const headerLine = headers.map(esc).join(",");
  const lines = rows.map((row) => headers.map((header) => esc(row[header])).join(","));
  return [headerLine, ...lines].join("\n");
}

function loginPageHtml(request: FastifyRequest, nextPath: string): string {
  const action = withPrefix(request, "/login");
  const safeNext = escapeHtml(nextPath);

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow,noarchive" />
  <title>Login | Imperium Tracking</title>
  <style>
    body{margin:0;font-family:Arial,sans-serif;background:#101010;color:#fff;min-height:100vh;display:grid;place-items:center;padding:20px}
    .card{width:min(420px,100%);background:#191919;border:1px solid #3a3a3a;border-radius:14px;padding:24px}
    label{display:block;font-size:13px;margin:0 0 6px}.field{margin-bottom:12px}
    input{width:100%;height:44px;border-radius:10px;border:1px solid #3f3f46;background:#121212;color:#fff;padding:0 12px}
    input:focus{outline:none;border-color:#08294a;box-shadow:0 0 0 2px rgba(8,41,74,.35)}
    button{width:100%;height:44px;border:0;border-radius:10px;background:#08294a;color:#fff;font-weight:600;cursor:pointer}
    #msg{min-height:20px;margin-top:10px;color:#fca5a5;font-size:13px}
  </style>
</head>
<body>
  <main class="card">
    <h1 style="margin:0 0 8px">Painel de Tracking</h1>
    <p style="margin:0 0 14px;color:#c6c6c6">Acesso restrito ao administrador.</p>
    <form id="login-form">
      <div class="field"><label for="username">Usuário</label><input id="username" autocomplete="username" required /></div>
      <div class="field"><label for="password">Senha</label><input id="password" type="password" autocomplete="current-password" required /></div>
      <button id="submit" type="submit">Entrar</button>
      <div id="msg"></div>
    </form>
  </main>
  <script>
    const form = document.getElementById("login-form");
    const submit = document.getElementById("submit");
    const msg = document.getElementById("msg");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      submit.disabled = true;
      submit.textContent = "Entrando...";
      msg.textContent = "";
      const payload = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        next: "${safeNext}",
      };
      try {
        const response = await fetch("${action}", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
          msg.textContent = data.error || "Usuário ou senha inválidos.";
          submit.disabled = false;
          submit.textContent = "Entrar";
          return;
        }
        window.location.href = data.redirectTo || "${withPrefix(request, "/admin/dashboard")}";
      } catch {
        msg.textContent = "Falha de conexão.";
        submit.disabled = false;
        submit.textContent = "Entrar";
      }
    });
  </script>
</body>
</html>`;
}
function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function registerAdminRoutes(app: FastifyInstance) {
  app.get("/admin", async (request, reply) => {
    if (!hasValidSession(request)) {
      return reply.redirect(`${withPrefix(request, "/login")}?next=${encodeURIComponent("/admin/dashboard")}`);
    }
    return reply.redirect(withPrefix(request, "/admin/dashboard"));
  });

  app.get("/login", async (request, reply) => {
    if (hasValidSession(request)) {
      return reply.redirect(withPrefix(request, "/admin/dashboard"));
    }

    const nextPath = normalizeNextPath(queryValue(request, "next") || "/admin/dashboard");
    return replyHtml(reply, loginPageHtml(request, nextPath));
  });

  app.post("/login", async (request, reply) => {
    const ip = getClientIp(request);
    const rate = consumeLoginAttempt(ip);

    if (!rate.ok) {
      return reply.code(429).send({
        ok: false,
        error: "Muitas tentativas. Aguarde e tente novamente.",
        retry_after_seconds: rate.retryAfterSeconds,
      });
    }

    const body = (request.body || {}) as LoginBody;
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const nextPath = normalizeNextPath(String(body.next || "/admin/dashboard"));

    if (username !== config.adminUser || !verifyAdminPassword(password)) {
      return reply.code(401).send({ ok: false, error: "Usuário ou senha inválidos." });
    }

    resetLoginAttempt(ip);
    setSessionCookie(request, reply);

    return reply.send({
      ok: true,
      redirectTo: withPrefix(request, nextPath),
    });
  });

  app.get("/logout", async (request, reply) => {
    clearSessionCookie(request, reply);
    return reply.redirect(withPrefix(request, "/login"));
  });

  app.get("/admin/dashboard", async (request, reply) => {
    if (!assertPanelAuth(request, reply)) return;

    const limit = clamp(toInt(queryValue(request, "limit"), 50), 10, 200);
    const [sessionsCountRow, eventsCountRow, leadsCountRow, latestLeads, latestEvents] =
      (await Promise.all([
        db("sessions").count<CountRow>("* as count").first(),
        db("events").count<CountRow>("* as count").first(),
        db("leads").count<CountRow>("* as count").first(),
        db("leads as l")
          .leftJoin("sessions as s", "s.id", "l.session_id")
          .select([
            "l.created_at",
            "l.session_id",
            "l.service_interest",
            "l.name",
            "l.whatsapp",
            "l.email",
            "l.unit",
            "s.landing_path",
          ])
          .orderBy("l.created_at", "desc")
          .limit(limit),
        db("events")
          .select(["timestamp", "event_name", "session_id", "page_path", "referrer"])
          .orderBy("timestamp", "desc")
          .limit(limit),
      ])) as [
      CountRow | undefined,
      CountRow | undefined,
      CountRow | undefined,
      Array<Record<string, unknown>>,
      Array<Record<string, unknown>>,
    ];

    const leadsRows = (latestLeads || [])
      .map((row) => {
        const sessionId = String(row.session_id || "");
        const sessionLink = withPrefix(request, `/admin/session/${encodeURIComponent(sessionId)}`);
        return `<tr>
          <td>${formatDate(row.created_at)}</td>
          <td>${escapeHtml(row.service_interest || "-")}</td>
          <td>${escapeHtml(row.name || "-")}</td>
          <td>${escapeHtml(row.whatsapp || "-")}</td>
          <td>${escapeHtml(row.email || "-")}</td>
          <td>${escapeHtml(row.unit || "-")}</td>
          <td>${escapeHtml(row.landing_path || "-")}</td>
          <td><a href="${sessionLink}">${escapeHtml(sessionId.slice(0, 8))}...</a></td>
        </tr>`;
      })
      .join("");

    const eventsRows = (latestEvents || [])
      .map((row) => {
        const sessionId = String(row.session_id || "");
        const sessionLink = withPrefix(request, `/admin/session/${encodeURIComponent(sessionId)}`);
        return `<tr>
          <td>${formatDate(row.timestamp)}</td>
          <td>${escapeHtml(row.event_name || "-")}</td>
          <td>${escapeHtml(row.page_path || "-")}</td>
          <td>${escapeHtml(row.referrer || "-")}</td>
          <td><a href="${sessionLink}">${escapeHtml(sessionId.slice(0, 8))}...</a></td>
        </tr>`;
      })
      .join("");

    const html = `<!doctype html><html lang="pt-BR"><head>
      <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta name="robots" content="noindex,nofollow,noarchive" />
      <title>Imperium Tracking Dashboard</title>
      <style>
        body{margin:0;font-family:Arial,sans-serif;background:#101010;color:#f5f5f5}
        .container{max-width:1200px;margin:0 auto;padding:20px}
        .head{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap}
        .btn{display:inline-block;background:#08294a;color:#fff;padding:8px 12px;border-radius:8px;text-decoration:none}
        .kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0}
        .card{background:#191919;border:1px solid #3a3a3a;border-radius:12px;padding:12px}
        table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:8px;border-bottom:1px solid #2a2a2a;text-align:left}
        a{color:#60a5fa;text-decoration:none}a:hover{text-decoration:underline}
        @media(max-width:900px){.kpis{grid-template-columns:1fr}}
      </style>
    </head><body><div class="container">
      <div class="head">
        <div><h1 style="margin:0">Imperium Tracking Dashboard</h1><div style="color:#c6c6c6">Atualizado em ${escapeHtml(formatDate(new Date().toISOString()))} UTC</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <a class="btn" href="${withPrefix(request, "/admin/export.csv")}">Exportar CSV</a>
          <a class="btn" href="${withPrefix(request, `/admin/dashboard?limit=${limit}`)}">Atualizar</a>
          <a class="btn" href="${withPrefix(request, "/logout")}">Sair</a>
        </div>
      </div>

      <section class="kpis">
        <article class="card"><strong>Sessões</strong><div style="font-size:24px">${Number(sessionsCountRow?.count || 0)}</div></article>
        <article class="card"><strong>Eventos</strong><div style="font-size:24px">${Number(eventsCountRow?.count || 0)}</div></article>
        <article class="card"><strong>Leads</strong><div style="font-size:24px">${Number(leadsCountRow?.count || 0)}</div></article>
      </section>

      <section class="card" style="margin-bottom:12px">
        <h3 style="margin-top:0">Últimos leads</h3>
        <table><thead><tr><th>Data</th><th>Serviço</th><th>Nome</th><th>WhatsApp</th><th>Email</th><th>Unidade</th><th>Landing</th><th>Sessão</th></tr></thead>
        <tbody>${leadsRows || '<tr><td colspan="8">Sem leads</td></tr>'}</tbody></table>
      </section>

      <section class="card">
        <h3 style="margin-top:0">Últimos eventos</h3>
        <table><thead><tr><th>Data</th><th>Evento</th><th>Página</th><th>Referrer</th><th>Sessão</th></tr></thead>
        <tbody>${eventsRows || '<tr><td colspan="5">Sem eventos</td></tr>'}</tbody></table>
      </section>
    </div></body></html>`;

    return replyHtml(reply, html);
  });

  app.get("/admin/session/:sessionId", async (request, reply) => {
    if (!assertPanelAuth(request, reply)) return;

    const params = request.params as { sessionId?: string };
    const sessionId = String(params.sessionId || "").trim();

    if (!isUuid(sessionId)) {
      return reply.code(400).header("Content-Type", "text/plain").send("Invalid session id");
    }

    const [session, leads, events] = await Promise.all([
      db("sessions").select("*").where({ id: sessionId }).first(),
      db("leads").select("*").where({ session_id: sessionId }).orderBy("created_at", "desc"),
      db("events").select("*").where({ session_id: sessionId }).orderBy("timestamp", "asc").limit(3000),
    ]);

    if (!session) {
      return reply.code(404).header("Content-Type", "text/plain").send("Session not found");
    }

    const leadRows = (leads as Array<Record<string, unknown>>)
      .map((lead) => `<tr><td>${formatDate(lead.created_at)}</td><td>${escapeHtml(lead.service_interest || "-")}</td><td>${escapeHtml(lead.name || "-")}</td><td>${escapeHtml(lead.whatsapp || "-")}</td><td>${escapeHtml(lead.email || "-")}</td></tr>`)
      .join("");

    const eventRows = (events as Array<Record<string, unknown>>)
      .map((event) => `<tr><td>${formatDate(event.timestamp)}</td><td>${escapeHtml(event.event_name || "-")}</td><td>${escapeHtml(event.page_path || "-")}</td><td>${escapeHtml(event.referrer || "-")}</td></tr>`)
      .join("");

    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="robots" content="noindex,nofollow,noarchive"/><title>Sessão</title>
      <style>body{margin:0;font-family:Arial,sans-serif;background:#101010;color:#f5f5f5}.container{max-width:1100px;margin:0 auto;padding:20px}.card{background:#191919;border:1px solid #3a3a3a;border-radius:12px;padding:12px;margin-bottom:12px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:8px;border-bottom:1px solid #2a2a2a;text-align:left}a{color:#60a5fa;text-decoration:none}</style>
    </head><body><div class="container">
      <div class="card"><a href="${withPrefix(request, "/admin/dashboard")}"><- Voltar</a><h2>Jornada da sessão</h2><p><strong>ID:</strong> ${escapeHtml(sessionId)}</p><p><strong>Landing:</strong> ${escapeHtml((session as Record<string, unknown>).landing_path || "-")}</p></div>
      <div class="card"><h3>Leads</h3><table><thead><tr><th>Data</th><th>Serviço</th><th>Nome</th><th>WhatsApp</th><th>Email</th></tr></thead><tbody>${leadRows || '<tr><td colspan="5">Sem leads</td></tr>'}</tbody></table></div>
      <div class="card"><h3>Eventos</h3><table><thead><tr><th>Data</th><th>Evento</th><th>Página</th><th>Referrer</th></tr></thead><tbody>${eventRows || '<tr><td colspan="4">Sem eventos</td></tr>'}</tbody></table></div>
    </div></body></html>`;

    return replyHtml(reply, html);
  });
  app.get("/admin/sessions", async (request, reply) => {
    if (!assertApiAuth(request, reply)) return;

    const query = paginationSchema.safeParse(request.query);
    if (!query.success) {
      return reply.code(400).send({ ok: false, error: "Invalid query params" });
    }

    const rows = await db("sessions")
      .select("*")
      .orderBy("last_seen_at", "desc")
      .limit(query.data.limit)
      .offset(query.data.offset);

    return reply.header("X-Robots-Tag", "noindex, nofollow, noarchive").send({ ok: true, data: rows });
  });

  app.get("/admin/events", async (request, reply) => {
    if (!assertApiAuth(request, reply)) return;

    const query = paginationSchema.safeParse(request.query);
    if (!query.success) {
      return reply.code(400).send({ ok: false, error: "Invalid query params" });
    }

    const rows = await db("events")
      .select("*")
      .orderBy("timestamp", "desc")
      .limit(query.data.limit)
      .offset(query.data.offset);

    return reply.header("X-Robots-Tag", "noindex, nofollow, noarchive").send({ ok: true, data: rows });
  });

  app.get("/admin/leads", async (request, reply) => {
    if (!assertApiAuth(request, reply)) return;

    const query = paginationSchema.safeParse(request.query);
    if (!query.success) {
      return reply.code(400).send({ ok: false, error: "Invalid query params" });
    }

    const rows = await db("leads")
      .select("*")
      .orderBy("created_at", "desc")
      .limit(query.data.limit)
      .offset(query.data.offset);

    return reply.header("X-Robots-Tag", "noindex, nofollow, noarchive").send({ ok: true, data: rows });
  });

  app.get("/admin/export.csv", async (request, reply) => {
    if (!assertPanelAuth(request, reply)) return;

    const rows = await db("leads as l")
      .leftJoin("sessions as s", "s.id", "l.session_id")
      .select([
        "l.created_at",
        "l.session_id",
        "l.service_interest",
        "l.name",
        "l.whatsapp",
        "l.email",
        "l.unit",
        "l.goal",
        "l.utm_source",
        "l.utm_medium",
        "l.utm_campaign",
        "l.utm_content",
        "l.utm_term",
        "s.landing_path",
        "s.first_seen_at",
        "s.last_seen_at",
      ])
      .orderBy("l.created_at", "desc");

    const headers = [
      "created_at",
      "session_id",
      "service_interest",
      "name",
      "whatsapp",
      "email",
      "unit",
      "goal",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "landing_path",
      "first_seen_at",
      "last_seen_at",
    ];

    const csv = toCsv(headers, rows as Array<Record<string, unknown>>);

    return reply
      .header("Content-Type", "text/csv; charset=utf-8")
      .header("Content-Disposition", 'attachment; filename="imperium-tracker-export.csv"')
      .header("X-Robots-Tag", "noindex, nofollow, noarchive")
      .send(csv);
  });
}

