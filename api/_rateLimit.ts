/**
 * Rate limiter for Vercel serverless functions.
 *
 * Strategy: Uses Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * are set (production). Falls back to in-memory Map (dev / no Redis).
 *
 * Upstash setup: https://upstash.com → Create Redis DB → copy REST URL + token
 * → set as Vercel env vars.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

// ── Upstash Redis path ──────────────────────────────────────────

const UPSTASH_URL = (process.env.UPSTASH_REDIS_REST_URL ?? '').trim();
const UPSTASH_TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN ?? '').trim();
const useRedis = !!(UPSTASH_URL && UPSTASH_TOKEN);

async function redisRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const windowSec = Math.ceil(windowMs / 1000);
  const redisKey = `rl:${key}`;
  try {
    const incrRes = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', redisKey], ['PTTL', redisKey]]),
    });
    const results = await incrRes.json() as Array<{ result: number }>;
    const count = results[0]?.result ?? 1;
    const ttl = results[1]?.result ?? -1;

    if (ttl < 0) {
      await fetch(`${UPSTASH_URL}/EXPIRE/${encodeURIComponent(redisKey)}/${windowSec}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      });
    }

    if (count > limit) {
      return { allowed: false, remaining: 0, retryAfterMs: ttl > 0 ? ttl : windowMs };
    }
    return { allowed: true, remaining: Math.max(0, limit - count), retryAfterMs: 0 };
  } catch (e) {
    console.warn('[rateLimit] Redis error, allowing request:', e instanceof Error ? e.message : e);
    return { allowed: true, remaining: limit, retryAfterMs: 0 };
  }
}

// ── In-memory fallback ──────────────────────────────────────────

interface RateLimitEntry { count: number; resetAt: number; }
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

function memoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
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

// ── Public API (same signature, auto-selects backend) ───────────

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (useRedis) return redisRateLimit(key, limit, windowMs);
  return memoryRateLimit(key, limit, windowMs);
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
