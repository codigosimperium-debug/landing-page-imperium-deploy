import { config } from "../config";

type Entry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Entry>();

function cleanupExpired(now: number) {
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function checkIngestRateLimit(key: string): {
  ok: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();

  if (buckets.size > 50_000) {
    cleanupExpired(now);
  }

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + config.ingestRateWindowMs,
    });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (current.count >= config.ingestRateMax) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return { ok: false, retryAfterSeconds };
  }

  current.count += 1;
  buckets.set(key, current);
  return { ok: true, retryAfterSeconds: 0 };
}
