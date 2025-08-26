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

// Temporarily disable Clerk middleware for testing
export default clerkMiddleware(
  async (auth, req: NextRequest) => {
    // Bypass all auth for now
    return;
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