// Redis client singleton with lazy connection.
// Falls back gracefully when REDIS_URL is not configured.

import Redis from "ioredis";
import { getEnv } from "../config/env";
import { createLogger } from "../logging/logger";

const log = createLogger({ component: "redis" });

let client: Redis | null = null;
let fallbackEnabled = false;

// In-memory fallback when Redis is unavailable
const memStore = new Map<string, { value: string; expiresAt: number }>();

function cleanupMemStore() {
  const now = Date.now();
  for (const [k, v] of memStore) {
    if (v.expiresAt < now) memStore.delete(k);
  }
}

export function getRedis(): Redis | null {
  if (client) return client;
  const env = getEnv();
  if (!env.REDIS_URL) {
    if (!fallbackEnabled) {
      log.warn("REDIS_URL not configured, using in-memory fallback");
      fallbackEnabled = true;
    }
    return null;
  }
  client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 10) {
        log.error("Redis connection failed after 10 retries");
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
    connectTimeout: 5000,
  });
  client.on("error", (err) => {
    log.error("Redis error", { error: String(err) });
  });
  client.on("connect", () => {
    log.info("Redis connected");
  });
  return client;
}

// --- Cache abstraction ---

export interface CacheGetResult<T> {
  value: T | null;
  hit: boolean;
}

export async function cacheGet<T>(key: string): Promise<CacheGetResult<T>> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get(key);
      if (raw === null) return { value: null, hit: false };
      return { value: JSON.parse(raw) as T, hit: true };
    } catch {
      return { value: null, hit: false };
    }
  }
  // In-memory fallback
  cleanupMemStore();
  const entry = memStore.get(key);
  if (!entry || entry.expiresAt < Date.now()) {
    memStore.delete(key);
    return { value: null, hit: false };
  }
  return { value: JSON.parse(entry.value) as T, hit: true };
}

export async function cacheSet(key: string, value: unknown, ttlSec: number): Promise<void> {
  const redis = getRedis();
  const serialized = JSON.stringify(value);
  if (redis) {
    try {
      await redis.setex(key, ttlSec, serialized);
    } catch {
      // Silent failure for cache writes
    }
    return;
  }
  memStore.set(key, { value: serialized, expiresAt: Date.now() + ttlSec * 1000 });
}

export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(key);
    } catch {
      // Silent failure
    }
    return;
  }
  memStore.delete(key);
}

// --- Distributed rate limiting via Redis ---

export type RateLimitResult = { ok: true; remaining: number } | { ok: false; retryAfter: number; remaining: 0 };

export async function distributedRateLimit(
  key: string,
  opts: { limit: number; windowSec: number },
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) {
    // Fallback to in-memory
    return inMemoryRateLimit(key, opts.limit, opts.windowSec * 1000);
  }
  try {
    const now = Date.now();
    const windowStart = now - opts.windowSec * 1000;

    // Sliding window using sorted sets
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, now.toString(), `${now}:${Math.random()}`);
    pipeline.zcard(key);
    pipeline.expire(key, opts.windowSec);
    const results = await pipeline.exec();

    const count = (results?.[2]?.[1] as number) ?? 0;
    const remaining = Math.max(0, opts.limit - count);

    if (count > opts.limit) {
      const retryAfter = Math.ceil(opts.windowSec / 2);
      return { ok: false, retryAfter, remaining: 0 };
    }
    return { ok: true, remaining };
  } catch {
    // Fall back to in-memory on Redis failure
    return inMemoryRateLimit(key, opts.limit, opts.windowSec * 1000);
  }
}

// --- In-memory rate limiting fallback ---

const windows = new Map<string, number[]>();

function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  const arr = windows.get(key) ?? [];
  const cutoff = now - windowMs;
  const recent = arr.filter((t) => t > cutoff);
  if (recent.length >= limit) {
    windows.set(key, recent);
    const oldest = recent[0] ?? now;
    return { ok: false, retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)), remaining: 0 };
  }
  recent.push(now);
  windows.set(key, recent);
  return { ok: true, remaining: limit - recent.length };
}

export function sweepRateLimits(now = Date.now()) {
  for (const [k, arr] of windows) {
    if (arr.length === 0 || arr[arr.length - 1] < now - 3_600_000) windows.delete(k);
  }
}

// --- Health check ---

export async function redisHealthCheck(): Promise<{ connected: boolean; latencyMs: number }> {
  const redis = getRedis();
  if (!redis) return { connected: false, latencyMs: 0 };
  try {
    const start = Date.now();
    await redis.ping();
    return { connected: true, latencyMs: Date.now() - start };
  } catch {
    return { connected: false, latencyMs: 0 };
  }
}
