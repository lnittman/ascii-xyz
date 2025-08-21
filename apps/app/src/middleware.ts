import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/signin(.*)',
  '/signup(.*)',
  '/api/webhook(.*)',
  '/_next(.*)',
  '/favicon.ico',
  '/images(.*)',
  '/share/(.*)',
]);

export default clerkMiddleware(
  async (auth, req) => {
    // For non-API routes, protect if not public
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  },
  { debug: false }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};