import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// Define public routes - ASCII app is mostly public
const isPublicRoute = createRouteMatcher([
  '/',
  '/gallery(.*)',
  '/generate(.*)',  // Temporarily make generate public for testing
  '/share/(.*)',
  '/signin(.*)',
  '/signup(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/ascii/generate',  // Allow public ASCII generation with API key
  '/_next(.*)',
  '/favicon.ico',
  '/images(.*)',
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

    // For API routes, we need to validate the token but handle errors differently
    if (isApiRoute(req)) {
      try {
        const authObject = await auth();

        // If no user is authenticated for protected API routes, return 401
        if (!authObject.userId && !pathName.startsWith('/api/public')) {
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
      await auth.protect({
        unauthenticatedUrl: '/signin',
        unauthorizedUrl: '/signin',
      });
    }
  },
  { 
    debug: false,
    signInUrl: '/signin',
    signUpUrl: '/signup',
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};