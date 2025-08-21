import { Ratelimit, type RatelimitConfig } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';
import { keys } from './keys';

// Only create Redis if credentials are available
const createRedis = () => {
  const env = keys();
  // Use standard Upstash names with fallback to legacy
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  
  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
};

export const redis = createRedis();

// Create a no-op rate limiter for when Redis is not configured
class NoOpRateLimiter {
  async limit(_identifier: string) {
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }
}

export const createRateLimiter = (props: Omit<RatelimitConfig, 'redis'>) => {
  if (!redis) {
    return new NoOpRateLimiter();
  }
  return new Ratelimit({
    redis,
    limiter: props.limiter ?? Ratelimit.slidingWindow(10, '10 s'),
    prefix: props.prefix ?? 'arbor',
    analytics: true,
  });
};

// Different rate limit tiers
export const rateLimiters = redis
  ? {
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
        prefix: 'arbor:api',
        analytics: true,
      }),

      chat: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 messages per minute
        prefix: 'arbor:chat',
        analytics: true,
      }),

      analysis: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 analyses per hour
        prefix: 'arbor:analysis',
        analytics: true,
      }),

      upload: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(50, '1 d'), // 50 uploads per day
        prefix: 'arbor:upload',
        analytics: true,
      }),

      workflow: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, '1 h'), // 30 workflow runs per hour
        prefix: 'arbor:workflow',
        analytics: true,
      }),
    }
  : {
      api: new NoOpRateLimiter(),
      chat: new NoOpRateLimiter(),
      analysis: new NoOpRateLimiter(),
      upload: new NoOpRateLimiter(),
      workflow: new NoOpRateLimiter(),
    };

// Helper to get user ID or IP for rate limiting
export async function getRateLimitIdentifier(
  req: Request | NextRequest
): Promise<string> {
  // Try to get user ID from various sources
  const authHeader = req.headers.get('authorization');
  const userId = req.headers.get('x-user-id');

  if (userId) {
    return `user:${userId}`;
  }

  if (authHeader) {
    // Extract user ID from JWT or session if needed
    return `auth:${authHeader.slice(0, 20)}`;
  }

  // Fallback to IP address
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

  return `ip:${ip}`;
}

// Middleware factory
export function createRateLimitMiddleware(
  limiterName: keyof typeof rateLimiters
) {
  return async function rateLimitMiddleware(req: Request | NextRequest) {
    const identifier = await getRateLimitIdentifier(req);
    const limiter = rateLimiters[limiterName];

    const { success, limit, reset, remaining } =
      await limiter.limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);

      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    return {
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      },
    };
  };
}

// Export individual functions for use in API routes
export async function checkRateLimit(
  limiterName: keyof typeof rateLimiters,
  identifier: string
) {
  const limiter = rateLimiters[limiterName];
  return limiter.limit(identifier);
}

export const { slidingWindow, fixedWindow, tokenBucket } = Ratelimit;
