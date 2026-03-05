import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../src/app";
import { config } from "../src/config";
import { ensureTrackingSchema } from "../src/db";

let appPromise: ReturnType<typeof initializeApp> | null = null;

async function initializeApp() {
  await ensureTrackingSchema();
  const app = buildApp({ logger: false });
  await app.ready();
  return app;
}

async function getApp() {
  if (!appPromise) {
    appPromise = initializeApp();
  }

  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await getApp();
    app.server.emit("request", req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : "init_failed";
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : "unknown";

    let dbHost = "unknown";
    let dbPort = "unknown";
    let sslMode = "unknown";
    try {
      const dbUrl = new URL(config.databaseUrl);
      dbHost = dbUrl.hostname || "unknown";
      dbPort = dbUrl.port || "5432";
      sslMode = dbUrl.searchParams.get("sslmode") || "none";
    } catch {
      // Ignore URL parse diagnostics failures.
    }

    console.error(
      `[tracker-init] failed code=${code} host=${dbHost} port=${dbPort} sslmode=${sslMode} message=${message}`,
    );

    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: message }));
  }
}
