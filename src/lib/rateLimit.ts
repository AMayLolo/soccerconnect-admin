// Simple in-memory rate limiter (best-effort; per server instance)
// Token bucket keyed by identifier (IP + action)
// For production horizontal scaling, replace with Redis.

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  capacity: number; // max tokens
  refillRate: number; // tokens per ms
}

const DEFAULTS: Record<string, RateLimitOptions> = {
  report: { capacity: 10, refillRate: 1 / (60_000 * 5) }, // 1 token every 5 min (~12/hour) capacity 10
  adminReview: { capacity: 30, refillRate: 1 / (60_000) }, // 1/min, burst 30
};

export function rateLimit(action: keyof typeof DEFAULTS, key: string) {
  const opts = DEFAULTS[action];
  const now = Date.now();
  const mapKey = `${action}:${key}`;
  let bucket = buckets.get(mapKey);
  if (!bucket) {
    bucket = { tokens: opts.capacity, lastRefill: now };
    buckets.set(mapKey, bucket);
  }
  // Refill
  const elapsed = now - bucket.lastRefill;
  const refill = elapsed * opts.refillRate;
  if (refill > 0) {
    bucket.tokens = Math.min(opts.capacity, bucket.tokens + refill);
    bucket.lastRefill = now;
  }
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true };
  }
  return { allowed: false, retryInMs: Math.ceil((1 - bucket.tokens) / opts.refillRate) };
}

export function getClientIp(headers: Headers): string {
  const xf = headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  return headers.get('cf-connecting-ip') || 'unknown';
}
