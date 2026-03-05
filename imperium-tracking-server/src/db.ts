import path from "node:path";
import { knex, type Knex } from "knex";
import { config } from "./config";

function shouldUseSsl(connectionString: string): boolean {
  const url = connectionString.toLowerCase();
  if (url.includes("sslmode=disable")) {
    return false;
  }

  return url.includes("sslmode=require");
}

function buildConnectionConfig() {
  if (shouldUseSsl(config.databaseUrl)) {
    return {
      connectionString: config.databaseUrl,
      ssl: { rejectUnauthorized: false },
    };
  }

  return config.databaseUrl;
}

export const db: Knex = knex({
  client: "pg",
  connection: buildConnectionConfig(),
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
