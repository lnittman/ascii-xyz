'use client';

import useSWR, { type SWRConfiguration } from 'swr';
import useSWRMutation from 'swr/mutation';
import { createORPCClient } from './client';

// Default SWR config to prevent server overload
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 30000, // 30 seconds
  refreshInterval: 0, // No automatic polling
};

// Create a singleton client instance
let client: ReturnType<typeof createORPCClient> | null = null;

function getClient() {
  if (!client) {
    // This will be configured by the app layer
    client = createORPCClient();
  }
  return client;
}

// Type-safe query hook for oRPC procedures
export function useQuery<TData = any>(
  path: string | null,
  input?: any,
  config?: SWRConfiguration
) {
  return useSWR<TData>(
    path && input !== undefined ? [path, input] : path,
    async () => {
      if (!path) {
        return null;
      }

      const client = getClient();
      const pathSegments = path.split('.');
      let procedure: any = client;

      // Navigate to the procedure
      for (const segment of pathSegments) {
        procedure = procedure[segment];
      }

      // Call the procedure
      return await procedure(input);
    },
    { ...defaultConfig, ...config }
  );
}

// Type-safe mutation hook for oRPC procedures
export function useMutation<TData = any, TInput = any>(path: string) {
  return useSWRMutation<TData, Error, string, TInput>(
    path,
    async (_, { arg }) => {
      const client = getClient();
      const pathSegments = path.split('.');
      let procedure: any = client;

      // Navigate to the procedure
      for (const segment of pathSegments) {
        procedure = procedure[segment];
      }

      // Call the procedure
      return await procedure(arg);
    }
  );
}

// Optimistic update helper (just alias to regular mutation for now)
export const useOptimisticMutation = useMutation;

// Invalidation helper
export async function invalidateQueries(keys: string[]) {
  const { mutate } = await import('swr');
  await Promise.all(keys.map((key) => mutate(key)));
}

// Export typed client for direct usage if needed
export { getClient as getORPCClient };
