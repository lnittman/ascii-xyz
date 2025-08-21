import { clerkMiddleware as baseClerkMiddleware } from '@clerk/nextjs/server';
import { getRateLimitIdentifier, rateLimiters } from '@repo/rate-limit';
import type { NextRequest } from 'next/server';

export function authMiddlewareWithRateLimit(
  rateLimiterName: keyof typeof rateLimiters = 'api'
) {
  return baseClerkMiddleware(async (_auth, req: NextRequest) => {
    // Apply rate limiting first
    const identifier = await getRateLimitIdentifier(req);
    const limiter = rateLimiters[rateLimiterName];

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

    // Continue with authentication
    // The auth parameter from clerkMiddleware is actually the middleware function
    // We need to return undefined to continue processing
    return;
  });
}

// Export the standard middleware without rate limiting for backward compatibility
export { clerkMiddleware as authMiddleware } from '@clerk/nextjs/server';
