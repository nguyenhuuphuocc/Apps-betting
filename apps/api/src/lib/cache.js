import Redis from "ioredis";

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    const row = this.store.get(key);
    if (!row) return null;
    if (row.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return row.value;
  }

  async set(key, value, ttlSeconds) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }
}

export function createCache(redisUrl) {
  if (!redisUrl) return new MemoryCache();
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: true
  });
  const fallback = new MemoryCache();

  return {
    async get(key) {
      try {
        if (redis.status === "wait") await redis.connect();
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
      } catch {
        return fallback.get(key);
      }
    },
    async set(key, value, ttlSeconds) {
      try {
        if (redis.status === "wait") await redis.connect();
        await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
      } catch {
        await fallback.set(key, value, ttlSeconds);
      }
    }
  };
}

export async function cacheWrap(cache, key, ttlSeconds, fetcher) {
  const cached = await cache.get(key);
  if (cached) return { data: cached, fromCache: true };
  const data = await fetcher();
  await cache.set(key, data, ttlSeconds);
  return { data, fromCache: false };
}
