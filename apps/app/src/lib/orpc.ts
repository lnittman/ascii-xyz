import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';

declare global {
  var $client: ReturnType<typeof createORPCClient> | undefined;
}

const link = new RPCLink({
  url: () => {
    if (typeof window === 'undefined') {
      throw new Error('RPCLink is not allowed on the server side.');
    }

    return `${window.location.origin}/rpc`;
  },
});

/**
 * Fallback to client-side client if server-side client is not available.
 */
export const client = globalThis.$client ?? createORPCClient(link);
