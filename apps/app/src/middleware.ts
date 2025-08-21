import { log } from '@/lib/logger';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { getRateLimitIdentifier, rateLimiters } from '@repo/rate-limit';
import type { NextRequest } from 'next/server';

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/signin(.*)',
  '/signup(.*)',
  '/api/webhook(.*)',
  '/_next(.*)',
  '/favicon.ico',
  '/images(.*)',
  '/share/(.*)',
]);

// Define API routes pattern
const isApiRoute = createRouteMatcher(['/api/(.*)']);

// Define auth routes that need rate limiting
const isAuthRoute = createRouteMatcher([
  '/signin(.*)',
  '/signup(.*)',
  '/api/auth/(.*)',
]);

export default clerkMiddleware(
  async (auth, req: NextRequest) => {
    const url = req.nextUrl;
    const pathName = url.pathname;

    // Apply rate limiting to auth routes
    if (isAuthRoute(req)) {
      const identifier = await getRateLimitIdentifier(req);
      const limiter = rateLimiters.api; // Use stricter limits for auth

      const { success, limit, reset, remaining } =
        await limiter.limit(identifier);

      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);

        return new Response(
          JSON.stringify({
            error: 'Too many authentication attempts',
            message: `Please try again in ${retryAfter} seconds.`,
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
    }

    // Handle settings root redirect
    if (pathName === '/settings') {
      return Response.redirect(new URL('/settings/profile', req.url));
    }

    // Handle code settings root redirect
    if (pathName === '/code/settings') {
      return Response.redirect(new URL('/code/settings/general', req.url));
    }

    // For API routes, we need to validate the token but handle errors differently
    if (isApiRoute(req)) {
      try {
        const authObject = await auth();

        // If no user is authenticated for API routes, return 401
        if (!authObject.userId) {
          log.warn(`Auth failed for ${pathName} - no userId in token`);
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }

        // Continue with the request if authenticated
        // Only log failed auth or if DEBUG=true
        if (process.env.DEBUG === 'true') {
          log.info(
            `Auth successful for ${pathName} - userId: ${authObject.userId}`
          );
        }

        return;
      } catch (error) {
        log.error(`Auth error for ${pathName}:`, error);
        return new Response(
          JSON.stringify({ error: 'Authentication failed' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // For non-API routes, protect if not public
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  },
  { debug: false } // Disable Clerk debug mode
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
