import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
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
  '/',  // Home page is public
  '/test',  // Test page
]);

// Define API routes pattern
const isApiRoute = createRouteMatcher(['/api/(.*)']);

export default clerkMiddleware(
  async (auth, req: NextRequest) => {
    const url = req.nextUrl;
    const pathName = url.pathname;

    // Handle settings root redirect
    if (pathName === '/settings') {
      return Response.redirect(new URL('/settings/profile', req.url));
    }

    // If user is already signed in, redirect away from auth pages before paint
    if (pathName.startsWith('/signin') || pathName.startsWith('/signup')) {
      try {
        const { userId } = await auth();
        if (userId) {
          return Response.redirect(new URL('/', req.url));
        }
      } catch (_) {
        // ignore and continue to auth page
      }
    }

    // For API routes, we need to validate the token but handle errors differently
    if (isApiRoute(req)) {
      try {
        const authObject = await auth();

        // If no user is authenticated for API routes, return 401
        if (!authObject.userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }

        return;
      } catch (error) {
        console.error(`Auth error for ${pathName}:`, error);
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
