import { config } from "./config";
import { closeDb, ensureTrackingSchema } from "./db";
import { buildApp } from "./app";

const app = buildApp();

async function start() {
  try {
    await ensureTrackingSchema();
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
