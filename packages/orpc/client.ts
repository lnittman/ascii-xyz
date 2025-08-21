import { createORPCClient as createClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { Router } from './router';

export function createORPCClient(options?: {
  baseURL?: string;
  headers?: Record<string, string>;
}) {
  const link = new RPCLink({
    url: options?.baseURL ?? '/api/orpc',
    headers: options?.headers,
  });

  // @ts-expect-error - Complex nested types from oRPC router
  return createClient<Router>(link);
}

export type ORPCClient = ReturnType<typeof createORPCClient>;
