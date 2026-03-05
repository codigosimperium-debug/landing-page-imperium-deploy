import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config";
import { closeDb, db } from "./db";
import { registerAdminRoutes } from "./routes/admin";
import { registerIngestRoutes } from "./routes/ingest";

const app = Fastify({
  logger: true,
  trustProxy: true,
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

async function start() {
  try {
    await app.listen({ port: config.port, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();

const gracefulShutdown = async () => {
  await app.close();
  await closeDb();
  process.exit(0);
};

process.on("SIGINT", () => {
  void gracefulShutdown();
});
process.on("SIGTERM", () => {
  void gracefulShutdown();
});
