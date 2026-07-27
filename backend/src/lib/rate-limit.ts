import { createMiddleware } from "hono/factory";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Not distributed — if you ever run multiple backend instances behind
// nginx, swap this for a Redis-backed limiter. Fine for a single box.
export function rateLimit({
  windowMs,
  max,
  keyPrefix,
}: {
  windowMs: number;
  max: number;
  keyPrefix: string;
}) {
  return createMiddleware(async (c, next) => {
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      c.req.header("x-real-ip") ??
      "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const existing = buckets.get(key);

    if (!existing || existing.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (existing.count >= max) {
      const retryAfterSec = Math.ceil((existing.resetAt - now) / 1000);
      c.header("Retry-After", String(retryAfterSec));
      return c.json({ error: "Too many requests" }, 429);
    }

    existing.count += 1;
    return next();
  });
}
