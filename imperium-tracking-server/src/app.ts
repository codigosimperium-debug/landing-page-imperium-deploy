import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import { db } from "./db";
import { config } from "./config";
import { registerAdminRoutes } from "./routes/admin";
import { registerIngestRoutes } from "./routes/ingest";

export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: true,
    trustProxy: true,
    ...options,
  });

  app.register(cors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (config.allowedOrigins.length === 0 || config.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed"), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["content-type", "x-public-key", "x-admin-key", "authorization"],
  });

  app.get("/health", async () => {
    await db.raw("select 1");
    return { ok: true };
  });

  void registerIngestRoutes(app);
  void registerAdminRoutes(app);

  return app;
}

