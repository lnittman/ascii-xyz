import { createORPCClient as createClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';

// Create oRPC client with RPCLink
export function createORPCClient(options?: {
  baseURL?: string;
  headers?: Record<string, string>;
}) {
  const link = new RPCLink({
    url: options?.baseURL ?? '/api/orpc',
  });

  // Return client without importing router
  return createClient(link);
}

// Export the type-safe client type
export type ORPCClient = ReturnType<typeof createORPCClient>;
