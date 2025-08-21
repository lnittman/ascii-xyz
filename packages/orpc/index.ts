// Client-side exports only
export type { Context } from './context';
export { createORPCClient } from './client';
export type { ORPCClient } from './client';
export {
  useORPC,
  useORPCMutation,
  invalidateORPCCache,
  optimisticUpdate,
  createSWRFetcher,
} from './swr';

// Type exports (safe for both client and server)
export type { AppRouter } from './types';
export type { Router } from './router';

// Server handler export
export { handleORPCRequest } from './handler';
