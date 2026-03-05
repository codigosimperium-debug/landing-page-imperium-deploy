import { knex, type Knex } from "knex";
import { config } from "./config";

export const db: Knex = knex({
  client: "pg",
  connection: config.databaseUrl,
  pool: {
    min: 0,
    max: 10,
  },
});

export async function closeDb() {
  await db.destroy();
}
