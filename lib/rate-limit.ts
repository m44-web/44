// Simple in-memory sliding window rate limiter.
// Keyed by (bucket, identifier). Not suitable for multi-instance deployments,
// but fine for a single Node.js server.

interface Window {
  // Each entry is a timestamp (ms) when a hit occurred
  hits: number[];
}

declare const globalThis: {
  __rateStore?: Map<string, Window>;
};

const store: Map<string, Window> =
  globalThis.__rateStore ?? new Map<string, Window>();

if (process.env.NODE_ENV !== "production") {
  globalThis.__rateStore = store;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

export function checkRateLimit(
  bucket: string,
  identifier: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const key = `${bucket}:${identifier}`;
  const now = Date.now();
  const cutoff = now - windowMs;

  const existing = store.get(key);
  const hits = existing?.hits.filter((t) => t > cutoff) ?? [];

  if (hits.length >= max) {
    const resetAt = (hits[0] ?? now) + windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, resetAt - now),
    };
  }

  hits.push(now);
  store.set(key, { hits });

  return {
    allowed: true,
    remaining: max - hits.length,
    resetInMs: windowMs,
  };
}

export function getClientIdentifier(request: Request): string {
  const h = request.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
