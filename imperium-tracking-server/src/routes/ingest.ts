import type { FastifyInstance, FastifyRequest } from "fastify";
import { config } from "../config";
import { db } from "../db";
import { ingestPayloadSchema } from "../schemas";
import { checkIngestRateLimit } from "../utils/rateLimit";
import {
  getClientIp,
  getUserAgent,
  hashIp,
  sanitizePath,
  sanitizeText,
} from "../utils/security";

function readPublicKey(request: FastifyRequest): string {
  const headerValue = request.headers["x-public-key"];
  if (typeof headerValue === "string") {
    return headerValue.trim();
  }

  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return "";
}

export async function registerIngestRoutes(app: FastifyInstance) {
  app.post("/ingest", async (request, reply) => {
    const providedKey = readPublicKey(request);
    if (!providedKey || providedKey !== config.trackingPublicKey) {
      return reply.code(401).send({ ok: false, error: "Unauthorized" });
    }

    const ip = getClientIp(request);
    const limit = checkIngestRateLimit(ip);
    if (!limit.ok) {
      return reply
        .header("Retry-After", String(limit.retryAfterSeconds))
        .code(429)
        .send({
          ok: false,
          error: "Rate limit exceeded",
          retry_after_seconds: limit.retryAfterSeconds,
        });
    }

    const parsed = ingestPayloadSchema.safeParse(request.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Invalid payload";
      return reply.code(400).send({ ok: false, error: firstIssue });
    }

    const payload = parsed.data;
    const userAgent = getUserAgent(request);
    const ipHash = hashIp(ip);
    const eventTimestamp = payload.timestamp
      ? new Date(payload.timestamp)
      : new Date();
    const pagePath = sanitizePath(payload.page_path);
    const referrer = sanitizeText(payload.referrer, 500);

    await db.transaction(async (trx) => {
      const existingSession = await trx("sessions")
        .select("id")
        .where({ id: payload.session_id })
        .first();

      if (!existingSession) {
        await trx("sessions").insert({
          id: payload.session_id,
          first_seen_at: eventTimestamp,
          last_seen_at: eventTimestamp,
          landing_path: pagePath,
          utm_source: payload.utm_source,
          utm_medium: payload.utm_medium,
          utm_campaign: payload.utm_campaign,
          utm_content: payload.utm_content,
          utm_term: payload.utm_term,
          user_agent: userAgent,
          ip_hash: ipHash,
        });
      } else {
        const updates: Record<string, unknown> = {
          last_seen_at: eventTimestamp,
          ip_hash: ipHash,
        };

        if (userAgent) {
          updates.user_agent = userAgent;
        }

        if (payload.utm_source) {
          updates.utm_source = payload.utm_source;
        }
        if (payload.utm_medium) {
          updates.utm_medium = payload.utm_medium;
        }
        if (payload.utm_campaign) {
          updates.utm_campaign = payload.utm_campaign;
        }
        if (payload.utm_content) {
          updates.utm_content = payload.utm_content;
        }
        if (payload.utm_term) {
          updates.utm_term = payload.utm_term;
        }

        await trx("sessions").where({ id: payload.session_id }).update(updates);
      }

      await trx("events").insert({
        session_id: payload.session_id,
        timestamp: eventTimestamp,
        event_name: payload.event_name,
        page_path: pagePath,
        referrer,
        props: payload.props || {},
      });

      if (payload.event_name === "lead_created" && payload.lead) {
        await trx("leads").insert({
          session_id: payload.session_id,
          created_at: eventTimestamp,
          service_interest: payload.lead.service_interest,
          name: payload.lead.name,
          whatsapp: payload.lead.whatsapp,
          email: payload.lead.email,
          unit: payload.lead.unit,
          goal: payload.lead.goal || "",
          utm_source: payload.utm_source,
          utm_medium: payload.utm_medium,
          utm_campaign: payload.utm_campaign,
          utm_content: payload.utm_content,
          utm_term: payload.utm_term,
        });
      }
    });

    return reply.code(201).send({ ok: true });
  });
}
