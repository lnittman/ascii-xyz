import { createRouterClient } from '@orpc/server';
import type { Context } from './context';
import { router } from './router';

// Create a server-side client for use in React Server Components
export function createServerClient(context?: Context) {
  // Use ORPC's built-in createRouterClient
  return createRouterClient(router, {
    context: context || {},
  });
}

// Type-safe server client
export type ServerClient = ReturnType<typeof createServerClient>;
