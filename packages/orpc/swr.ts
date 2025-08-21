import useSWR, { mutate } from 'swr';
import type { SWRConfiguration } from 'swr';
import type { ORPCClient } from './client';

// SWR fetcher for oRPC procedures
export function createSWRFetcher(client: ORPCClient) {
  return async (key: string | [string, any]) => {
    if (typeof key === 'string') {
      // Simple key like 'settings.data.get'
      const segments = key.split('.');
      let procedure: any = client;
      for (const segment of segments) {
        procedure = procedure[segment];
      }
      return procedure();
    }
    // Key with input like ['chats.get', { id: '123' }]
    const [path, input] = key;
    const segments = path.split('.');
    let procedure: any = client;
    for (const segment of segments) {
      procedure = procedure[segment];
    }
    return procedure(input);
  };
}

// Type-safe SWR hook for oRPC
export function useORPC<TData = any, TError = any>(
  key: string | [string, any] | null,
  client: ORPCClient,
  config?: SWRConfiguration<TData, TError>
) {
  const fetcher = createSWRFetcher(client);
  return useSWR<TData, TError>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 30000,
    refreshInterval: 0,
    ...config,
  });
}

// Type-safe mutation helper
export function useORPCMutation<TInput = any, TData = any>(
  procedurePath: string,
  client: ORPCClient
) {
  const execute = async (input?: TInput): Promise<TData> => {
    const segments = procedurePath.split('.');
    let procedure: any = client;
    for (const segment of segments) {
      procedure = procedure[segment];
    }
    return procedure(input);
  };

  return {
    trigger: execute,
    mutate: (key: string | [string, any]) => mutate(key),
  };
}

// Invalidate oRPC cache
export function invalidateORPCCache(pattern?: string | RegExp) {
  if (!pattern) {
    // Invalidate all
    return mutate(() => true);
  }

  if (typeof pattern === 'string') {
    // Invalidate keys that start with pattern
    return mutate((key) => {
      if (typeof key === 'string') {
        return key.startsWith(pattern);
      }
      if (Array.isArray(key) && typeof key[0] === 'string') {
        return key[0].startsWith(pattern);
      }
      return false;
    });
  }

  // Regex pattern
  return mutate((key) => {
    if (typeof key === 'string') {
      return pattern.test(key);
    }
    if (Array.isArray(key) && typeof key[0] === 'string') {
      return pattern.test(key[0]);
    }
    return false;
  });
}

// Optimistic update helper
export async function optimisticUpdate<TData = any>(
  key: string | [string, any],
  updateFn: (current?: TData) => TData,
  revalidate = true
): Promise<TData | undefined> {
  return mutate(
    key,
    async (current) => {
      return updateFn(current);
    },
    {
      revalidate,
      populateCache: true,
    }
  );
}
