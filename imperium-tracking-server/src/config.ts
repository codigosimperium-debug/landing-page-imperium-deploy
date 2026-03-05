import "dotenv/config";

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function readEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return stripWrappingQuotes(value);
}

function readIntEnv(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw) {
    return defaultValue;
  }

  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value) || value <= 0) {
    return defaultValue;
  }

  return value;
}

function parseAllowedOrigins(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const config = {
  port: readIntEnv("PORT", 4000),
  nodeEnv: stripWrappingQuotes(process.env.NODE_ENV || "development"),
  databaseUrl: readEnv("DATABASE_URL"),
  trackingPublicKey: readEnv("TRACKING_PUBLIC_KEY"),
  adminPrivateKey: readEnv("ADMIN_PRIVATE_KEY"),
  adminUser: stripWrappingQuotes(process.env.ADMIN_USERNAME || "admin"),
  adminPasswordHash: stripWrappingQuotes(process.env.ADMIN_PASSWORD_HASH || ""),
  adminSessionSecret: stripWrappingQuotes(
    process.env.ADMIN_SESSION_SECRET || readEnv("ADMIN_PRIVATE_KEY"),
  ),
  adminSessionHours: readIntEnv("ADMIN_SESSION_HOURS", 12),
  ipHashSalt: readEnv("IP_HASH_SALT"),
  allowedOrigins: parseAllowedOrigins(
    stripWrappingQuotes(process.env.ALLOWED_ORIGINS || ""),
  ),
  ingestRateWindowMs: readIntEnv("INGEST_RATE_WINDOW_MS", 60_000),
  ingestRateMax: readIntEnv("INGEST_RATE_MAX", 120),
};
