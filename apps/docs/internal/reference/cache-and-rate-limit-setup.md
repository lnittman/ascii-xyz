# cache and rate limiting setup guide

*"performance and protection for arbor"*

this guide documents the cache and rate limiting implementation using upstash redis.

## overview

arbor uses upstash redis for:
- **caching**: improves performance by storing frequently accessed data
- **rate limiting**: protects against abuse and ensures fair usage

## environment setup

add these variables to your `.env.local`:

```env
# redis/upstash configuration
KV_URL="your-redis-url"
KV_REST_API_URL="your-upstash-rest-url"
KV_REST_API_TOKEN="your-upstash-token"
KV_REST_API_READ_ONLY_TOKEN="your-read-only-token"
REDIS_URL="your-redis-url"
```

## cache implementation

### package structure

```
packages/cache/
├── src/
│   ├── index.ts    # cache manager and utilities
│   └── keys.ts     # environment validation
├── package.json
└── tsconfig.json
```

### usage in services

```typescript
// import cache utilities
import { cache, cacheKeys } from '@repo/cache';

// read from cache
const cached = await cache.get<Chat>(cacheKeys.chat(chatId));
if (cached) return cached;

// write to cache
await cache.set(cacheKeys.chat(chatId), chat, 3600); // 1 hour TTL

// invalidate cache
await cache.delete(cacheKeys.userChats(userId));
```

### cache keys pattern

```typescript
export const cacheKeys = {
  chat: (chatId: string) => `chat:${chatId}`,
  userChats: (userId: string) => `user:${userId}:chats`,
  projectChats: (projectId: string) => `project:${projectId}:chats`,
  userProjects: (userId: string) => `user:${userId}:projects`,
  project: (projectId: string) => `project:${projectId}`,
  userSettings: (userId: string, type: string) => `user:${userId}:settings:${type}`,
};
```

### cache ttl guidelines

- **user lists** (chats, projects): 5 minutes
- **individual entities**: 1 hour
- **settings**: 30 minutes
- **hot data**: local lru cache for 10 minutes

## rate limiting implementation

### package structure

```
packages/rate-limit/
├── index.ts        # rate limiters and middleware
├── keys.ts         # environment validation
├── package.json
└── tsconfig.json
```

### predefined limiters

```typescript
export const rateLimiters = {
  api: Ratelimit.slidingWindow(100, '1 m'),      // 100 requests per minute
  chat: Ratelimit.slidingWindow(20, '1 m'),      // 20 messages per minute
  analysis: Ratelimit.slidingWindow(10, '1 h'),  // 10 analyses per hour
  upload: Ratelimit.slidingWindow(50, '1 d'),    // 50 uploads per day
  workflow: Ratelimit.slidingWindow(30, '1 h'),  // 30 workflow runs per hour
};
```

### middleware integration

rate limiting is applied at two levels:

#### 1. global middleware (apps/app/src/middleware.ts)

```typescript
// automatically rate limits auth routes
if (isAuthRoute(req)) {
  const { success } = await rateLimiters.api.limit(identifier);
  if (!success) {
    return new Response(...); // 429 response
  }
}
```

#### 2. api route level

```typescript
// in api routes like chat
const { success, limit, reset, remaining } = await rateLimiters.chat.limit(identifier);

if (!success) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter,
    }),
    { status: 429 }
  );
}
```

### rate limit headers

all rate-limited responses include:
- `X-RateLimit-Limit`: total requests allowed
- `X-RateLimit-Remaining`: requests remaining
- `X-RateLimit-Reset`: when limit resets
- `Retry-After`: seconds until retry

## performance considerations

### local caching

the cache implementation uses a two-tier approach:
1. **local lru cache**: ultra-fast in-memory cache
2. **redis**: distributed cache for all instances

### cache warming

consider warming caches on startup for critical data:

```typescript
// example: warm user settings cache
async function warmUserCache(userId: string) {
  const projects = await projectService.getProjects(userId);
  const chats = await chatService.getChats(userId);
  // caches are automatically populated
}
```

### cache invalidation

follow these patterns:
- **on create**: invalidate list caches
- **on update**: invalidate entity and list caches
- **on delete**: invalidate all related caches

## monitoring

### cache hit rate

monitor cache effectiveness:

```typescript
// add to your monitoring
const cacheHitRate = (hits / (hits + misses)) * 100;
```

### rate limit metrics

track rate limit violations:

```typescript
// in rate limit response
log.warn('Rate limit exceeded', {
  identifier,
  limiter: 'chat',
  retryAfter,
});
```

## troubleshooting

### "redis connection failed"
- verify environment variables are set
- check upstash dashboard for connection limits
- ensure redis url includes protocol (`rediss://`)

### "cache miss for hot data"
- increase local cache size in cachemanager
- adjust ttl values based on usage patterns
- check for cache invalidation loops

### "rate limit too restrictive"
- adjust limits in rateLimiters configuration
- consider user tiers with different limits
- implement token bucket for burst traffic

## best practices

1. **always cache read operations** - but be selective
2. **invalidate on writes** - keep data consistent
3. **use appropriate ttls** - balance freshness vs performance
4. **monitor metrics** - track hit rates and violations
5. **graceful degradation** - handle redis failures

the cache and rate limiting layer ensures arbor remains fast and protected, embodying our engineering-first approach to building reliable systems.