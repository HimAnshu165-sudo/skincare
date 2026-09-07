import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
}

// Bounded in-memory store for local development, testing, and serverless fallback
const MAX_MEMORY_KEYS = 10000;
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 300000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000);
  if (timer && typeof timer === 'object' && 'unref' in timer) {
    (timer as any).unref();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Reset in-memory rate limit store. Primarily used in automated testing.
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}

/**
 * Synchronous in-memory sliding window rate limiter.
 * @param key Unique identifier (e.g. `login:ip:1.2.3.4` or `login:acc:user@test.com`)
 * @param maxRequests Maximum requests allowed within windowMs
 * @param windowMs Time window in milliseconds (default 60000 = 1 minute)
 */
export function checkRateLimitSync(
  key: string,
  maxRequests: number,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  let record = rateLimitStore.get(key);

  if (!record) {
    // Evict oldest entries if capacity exceeded to prevent unbounded memory growth
    if (rateLimitStore.size >= MAX_MEMORY_KEYS) {
      const firstKey = rateLimitStore.keys().next().value;
      if (firstKey) rateLimitStore.delete(firstKey);
    }
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Remove timestamps outside sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - record.timestamps.length),
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

let loggedNotice = false;

/**
 * Distributed Upstash Redis REST check.
 * Uses atomic HTTPS REST pipeline: [INCR, EXPIRE NX, TTL] over single HTTP request.
 */
async function checkDistributedRateLimit(
  url: string,
  token: string,
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const redisKey = `ratelimit:${key}`;

  const response = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', redisKey],
      ['EXPIRE', redisKey, ttlSeconds, 'NX'],
      ['TTL', redisKey],
    ]),
    signal: AbortSignal.timeout(500), // 500ms max timeout to prevent blocking requests
  });

  if (!response.ok) {
    throw new Error(`Upstash REST returned status ${response.status}`);
  }

  const results = await response.json();
  const count = typeof results?.[0]?.result === 'number' ? results[0].result : 1;
  const ttl = typeof results?.[2]?.result === 'number' && results[2].result > 0 ? results[2].result : ttlSeconds;

  if (count > maxRequests) {
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds: Math.max(1, ttl),
    };
  }

  return {
    allowed: true,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetSeconds: Math.max(1, ttl),
  };
}

/**
 * Primary rate limiter function.
 * Automatically delegates to Upstash Redis REST API when configured;
 * otherwise gracefully uses bounded sliding-window memory with fail-safe fallback.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number = 60000,
  options?: { failOpen?: boolean }
): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      return await checkDistributedRateLimit(upstashUrl, upstashToken, key, maxRequests, windowMs);
    } catch (error) {
      if (options?.failOpen) {
        // High-volume public catalog APIs fail-open on transient Redis glitches
        return {
          allowed: true,
          limit: maxRequests,
          remaining: 1,
          resetSeconds: Math.ceil(windowMs / 1000),
        };
      }
      // Security-sensitive APIs fall back gracefully to local in-memory sliding window
      return checkRateLimitSync(key, maxRequests, windowMs);
    }
  }

  if (process.env.NODE_ENV === 'production' && !loggedNotice) {
    loggedNotice = true;
    console.info('[RateLimit] Notice: Distributed Redis (UPSTASH_REDIS_REST_URL) not configured. Operating in high-performance per-instance sliding window mode.');
  }

  return checkRateLimitSync(key, maxRequests, windowMs);
}

/**
 * Dual-Key Rate Limiting.
 * Evaluates two distinct keys simultaneously (e.g. Client IP and User/Account ID).
 * If either threshold is exceeded, the request is denied with the stricter reset window.
 */
export async function checkDualRateLimit(
  key1: string,
  max1: number,
  window1: number,
  key2: string,
  max2: number,
  window2: number,
  options?: { failOpen?: boolean }
): Promise<RateLimitResult> {
  const [res1, res2] = await Promise.all([
    checkRateLimit(key1, max1, window1, options),
    checkRateLimit(key2, max2, window2, options),
  ]);

  if (!res1.allowed || !res2.allowed) {
    const activeReset = Math.max(
      !res1.allowed ? res1.resetSeconds : 0,
      !res2.allowed ? res2.resetSeconds : 0
    );
    return {
      allowed: false,
      limit: Math.min(res1.limit, res2.limit),
      remaining: 0,
      resetSeconds: Math.max(1, activeReset),
    };
  }

  return {
    allowed: true,
    limit: Math.min(res1.limit, res2.limit),
    remaining: Math.min(res1.remaining, res2.remaining),
    resetSeconds: Math.min(res1.resetSeconds, res2.resetSeconds),
  };
}

/**
 * Extract client IP address securely for rate limiting behind Vercel infrastructure.
 * Priority:
 * 1. Next.js request.ip (assigned by Vercel Edge runtime)
 * 2. x-vercel-ip (overwritten by Vercel edge proxy)
 * 3. x-real-ip (overwritten by Vercel edge proxy)
 * 4. x-vercel-forwarded-for
 * 5. x-forwarded-for (untrusted client fallback)
 */
export function getClientIp(request: Request | NextRequest): string {
  // 1. Next.js / Vercel runtime request.ip
  if ('ip' in request && typeof (request as any).ip === 'string' && (request as any).ip) {
    const ip = (request as any).ip.trim();
    if (ip) return ip;
  }

  // 2. Vercel edge proxy headers (immune to client-side spoofing on Vercel)
  const vercelIp = request.headers.get('x-vercel-ip');
  if (vercelIp && vercelIp.trim()) {
    return vercelIp.trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for');
  if (vercelForwardedFor && vercelForwardedFor.trim()) {
    return vercelForwardedFor.split(',')[0].trim();
  }

  // 3. Fallback: x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  return '127.0.0.1';
}

/**
 * Standardized HTTP 429 Rate Limit Response Builder.
 * Returns standard Retry-After header and clean non-revealing error payload.
 */
export function rateLimitResponse(
  resetSeconds: number = 60,
  message: string = 'Too many requests. Please try again later.'
): NextResponse {
  const safeResetSeconds = Math.max(1, Math.ceil(resetSeconds));
  return NextResponse.json(
    {
      success: false,
      error: message,
      message,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(safeResetSeconds),
        'X-RateLimit-Reset': String(safeResetSeconds),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}
