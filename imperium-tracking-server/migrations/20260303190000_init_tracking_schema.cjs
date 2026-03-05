/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

  await knex.schema.createTable("sessions", (table) => {
    table.uuid("id").primary();
    table.timestamp("first_seen_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("last_seen_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.text("landing_path").notNullable().defaultTo("/");
    table.text("utm_source").notNullable().defaultTo("");
    table.text("utm_medium").notNullable().defaultTo("");
    table.text("utm_campaign").notNullable().defaultTo("");
    table.text("utm_content").notNullable().defaultTo("");
    table.text("utm_term").notNullable().defaultTo("");
    table.text("user_agent").notNullable().defaultTo("");
    table.text("ip_hash").notNullable();

    table.index(["last_seen_at"], "idx_sessions_last_seen_at");
    table.index(["utm_source", "utm_medium", "utm_campaign"], "idx_sessions_utm");
  });

  await knex.schema.createTable("events", (table) => {
    table
      .uuid("id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("session_id").notNullable().references("id").inTable("sessions").onDelete("CASCADE");
    table.timestamp("timestamp", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.text("event_name").notNullable();
    table.text("page_path").notNullable().defaultTo("");
    table.text("referrer").notNullable().defaultTo("");
    table.jsonb("props").notNullable().defaultTo(knex.raw(`'{}'::jsonb`));

    table.index(["session_id", "timestamp"], "idx_events_session_timestamp");
    table.index(["event_name", "timestamp"], "idx_events_event_name_timestamp");
  });

  await knex.schema.createTable("leads", (table) => {
    table
      .uuid("id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.uuid("session_id").notNullable().references("id").inTable("sessions").onDelete("CASCADE");
    table.text("service_interest").notNullable().defaultTo("");
    table.text("name").notNullable().defaultTo("");
    table.text("whatsapp").notNullable().defaultTo("");
    table.text("email").notNullable().defaultTo("");
    table.text("unit").notNullable().defaultTo("");
    table.text("goal").notNullable().defaultTo("");
    table.text("utm_source").notNullable().defaultTo("");
    table.text("utm_medium").notNullable().defaultTo("");
    table.text("utm_campaign").notNullable().defaultTo("");
    table.text("utm_content").notNullable().defaultTo("");
    table.text("utm_term").notNullable().defaultTo("");

    table.index(["created_at"], "idx_leads_created_at");
    table.index(["service_interest"], "idx_leads_service_interest");
    table.index(["utm_source", "utm_medium", "utm_campaign"], "idx_leads_utm");
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("leads");
  await knex.schema.dropTableIfExists("events");
  await knex.schema.dropTableIfExists("sessions");
};
