/**
 * Simple in-memory rate limiter for Vercel serverless functions.
 *
 * Limits are per warm function instance. A cold start resets the window.
 * For production-grade rate limiting, upgrade to Upstash Redis (@upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Check rate limit for a given key (e.g. IP or phone number).
 * @param key   Unique identifier (IP, phone, etc.)
 * @param limit Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  entry.count++;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  return { allowed: true, remaining: limit - entry.count, retryAfterMs: 0 };
}

/**
 * Extract client IP from Vercel request headers.
 */
export function getClientIp(headers: Record<string, string | string[] | undefined>): string {
  const xff = headers['x-forwarded-for'];
  if (typeof xff === 'string') return xff.split(',')[0].trim();
  if (Array.isArray(xff) && xff.length) return xff[0].split(',')[0].trim();
  const real = headers['x-real-ip'];
  if (typeof real === 'string') return real.trim();
  return 'unknown';
}
