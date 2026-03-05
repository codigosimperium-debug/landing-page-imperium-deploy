import path from "node:path";
import { knex, type Knex } from "knex";
import { config } from "./config";

const mustUseSsl =
  config.databaseUrl.includes("sslmode=require") ||
  config.databaseUrl.includes(".render.com");

const connectionConfig = mustUseSsl
  ? {
      connectionString: config.databaseUrl,
      ssl: { rejectUnauthorized: false },
    }
  : config.databaseUrl;

export const db: Knex = knex({
  client: "pg",
  connection: connectionConfig,
  pool: {
    min: 0,
    max: 10,
  },
});

let schemaReadyPromise: Promise<void> | null = null;

export async function ensureTrackingSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await db.migrate.latest({
        directory: path.join(process.cwd(), "migrations"),
        tableName: "knex_migrations",
      });
    })();
  }

  return schemaReadyPromise;
}

export async function closeDb() {
  await db.destroy();
}
