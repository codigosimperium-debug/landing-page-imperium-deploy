type RateLimitResult = {
  ok: boolean;
  retryAfterSeconds: number;
};

type Entry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;
const store = new Map<string, Entry>();

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const current = store.get(key);

  if (!current || now > current.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return { ok: true, retryAfterSeconds: 0 };
  }

  if (current.count >= MAX_REQUESTS) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  store.set(key, current);
  return { ok: true, retryAfterSeconds: 0 };
}
