import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../src/app";
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
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: message }));
  }
}
