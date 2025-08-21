import { LRUCache } from 'lru-cache';

export interface CacheOptions {
  ttl?: number;
  localCacheSize?: number;
  localCacheTTL?: number;
}

export interface KVBinding {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{
    keys: Array<{ name: string }>;
  }>;
}

declare global {
  var CACHE_KV: KVBinding | undefined;
}

export class CacheManager {
  private kv: KVBinding | null = null;
  private localCache: LRUCache<string, any>;

  constructor(options?: CacheOptions) {
    // Local LRU cache for hot data
    this.localCache = new LRUCache<string, any>({
      max: options?.localCacheSize || 5000,
      ttl: options?.localCacheTTL || 1000 * 60 * 10, // 10 minutes default
    });
  }

  private getKV(): KVBinding | null {
    if (!this.kv) {
      // Check if running in Cloudflare Workers environment
      if (typeof globalThis !== 'undefined' && globalThis.CACHE_KV) {
        this.kv = globalThis.CACHE_KV;
      } else {
        return null;
      }
    }
    return this.kv;
  }

  async get<T>(key: string): Promise<T | null> {
    // Check local cache first
    const local = this.localCache.get(key);
    if (local !== undefined) {
      return local;
    }

    // Check KV store
    const kv = this.getKV();
    if (kv) {
      try {
        const cached = await kv.get(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          // Store in local cache for future requests
          this.localCache.set(key, parsed);
          return parsed as T;
        }
      } catch (_error) {}
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Set in local cache
    this.localCache.set(key, value);

    // Set in KV store
    const kv = this.getKV();
    if (kv) {
      try {
        const serialized = JSON.stringify(value);
        const options = ttl ? { expirationTtl: ttl } : undefined;
        await kv.put(key, serialized, options);
      } catch (_error) {}
    }
  }

  async delete(key: string): Promise<void> {
    // Delete from local cache
    this.localCache.delete(key);

    // Delete from KV store
    const kv = this.getKV();
    if (kv) {
      try {
        await kv.delete(key);
      } catch (_error) {}
    }
  }

  async invalidate(pattern: string): Promise<void> {
    // Clear local cache entries matching pattern
    for (const key of this.localCache.keys()) {
      if (key.includes(pattern)) {
        this.localCache.delete(key);
      }
    }

    // Clear KV keys matching pattern
    const kv = this.getKV();
    if (kv) {
      try {
        const result = await kv.list({ prefix: pattern });
        for (const key of result.keys) {
          await kv.delete(key.name);
        }
      } catch (_error) {}
    }
  }

  async flush(): Promise<void> {
    // Clear local cache
    this.localCache.clear();
  }

  // Cache decorators
  static cacheable(ttl = 300) {
    return (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const cache = new CacheManager();
        const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

        // Try to get from cache
        const cached = await cache.get(cacheKey);
        if (cached !== null) {
          return cached;
        }

        // Execute original method
        const result = await originalMethod.apply(this, args);

        // Cache the result
        if (result !== null && result !== undefined) {
          await cache.set(cacheKey, result, ttl);
        }

        return result;
      };

      return descriptor;
    };
  }

  static invalidateOn(patterns: string[]) {
    return (
      _target: any,
      _propertyKey: string,
      descriptor: PropertyDescriptor
    ) => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const result = await originalMethod.apply(this, args);

        // Invalidate cache patterns after successful execution
        const cache = new CacheManager();
        for (const pattern of patterns) {
          await cache.invalidate(pattern);
        }

        return result;
      };

      return descriptor;
    };
  }
}

// Export singleton instance for convenience
let cacheInstance: CacheManager | null = null;

export const cache = {
  get<T>(key: string): Promise<T | null> {
    if (!cacheInstance) {
      cacheInstance = new CacheManager();
    }
    return cacheInstance.get(key);
  },

  set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!cacheInstance) {
      cacheInstance = new CacheManager();
    }
    return cacheInstance.set(key, value, ttl);
  },

  delete(key: string): Promise<void> {
    if (!cacheInstance) {
      cacheInstance = new CacheManager();
    }
    return cacheInstance.delete(key);
  },

  invalidate(pattern: string): Promise<void> {
    if (!cacheInstance) {
      cacheInstance = new CacheManager();
    }
    return cacheInstance.invalidate(pattern);
  },

  flush(): Promise<void> {
    if (!cacheInstance) {
      cacheInstance = new CacheManager();
    }
    return cacheInstance.flush();
  },
};

// Export cache key helpers
export const cacheKeys = {
  chat: (chatId: string) => `chat:${chatId}`,
  userChats: (userId: string) => `user:${userId}:chats`,
  projectChats: (projectId: string) => `project:${projectId}:chats`,
  chatMessages: (chatId: string) => `chat:${chatId}:messages`,
  userProjects: (userId: string) => `user:${userId}:projects`,
  project: (projectId: string) => `project:${projectId}`,
  userSettings: (userId: string, type: string) =>
    `user:${userId}:settings:${type}`,
  model: (modelId: string) => `model:${modelId}`,
  workspace: (workspaceId: string) => `workspace:${workspaceId}`,
  userWorkspaces: (userId: string) => `user:${userId}:workspaces`,
} as const;
