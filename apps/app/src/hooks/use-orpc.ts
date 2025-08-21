import { useAuthenticatedORPC, useORPC } from '@/providers/orpc-provider';
import useSWR, { type SWRConfiguration } from 'swr';
import { useSWRConfig } from 'swr';

// Type helpers for oRPC procedures
type ProcedureInput<T> = T extends (input: infer I) => any ? I : never;
type ProcedureOutput<T> = T extends (input: any) => infer O ? O : never;

// Hook for queries (reading data)
export function useORPCQuery<TProcedure extends (input: any) => Promise<any>>(
  procedure: TProcedure,
  input: ProcedureInput<TProcedure>,
  options?: {
    enabled?: boolean;
    revalidateOnFocus?: boolean;
    refreshInterval?: number;
    requireAuth?: boolean;
    swrConfig?: SWRConfiguration<ProcedureOutput<TProcedure>>;
  }
) {
  const _client = options?.requireAuth ? useAuthenticatedORPC() : useORPC();

  const key =
    options?.enabled === false
      ? null
      : options?.requireAuth
        ? ['orpc-query-auth', procedure.name, input]
        : ['orpc-query', procedure.name, input];

  const { data, error, isLoading, mutate } = useSWR<
    ProcedureOutput<TProcedure>
  >(key, async () => procedure(input), {
    revalidateOnFocus: options?.revalidateOnFocus ?? false,
    revalidateOnReconnect: false,
    refreshInterval: options?.refreshInterval ?? 0,
    ...options?.swrConfig,
  });

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Hook for mutations (changing data)
export function useORPCMutation() {
  const { mutate: globalMutate } = useSWRConfig();
  const _authenticatedClient = useAuthenticatedORPC();

  const mutate = async <TProcedure extends (input: any) => Promise<any>>(
    procedure: TProcedure,
    input: ProcedureInput<TProcedure>,
    options?: {
      invalidateKeys?: string[];
      optimisticData?: any;
    }
  ) => {
    try {
      // Optimistic update if provided
      if (options?.optimisticData !== undefined && options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          globalMutate(key, options.optimisticData, false);
        });
      }

      const result = await procedure(input);

      // Invalidate specified keys after mutation
      if (options?.invalidateKeys) {
        await Promise.all(
          options.invalidateKeys.map((key) => globalMutate(key))
        );
      }

      return result as ProcedureOutput<TProcedure>;
    } catch (error) {
      // Rollback optimistic update on error
      if (options?.optimisticData !== undefined && options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          globalMutate(key); // Revalidate to get fresh data
        });
      }
      throw error;
    }
  };

  return { mutate };
}

// Higher-order hook for working with specific procedures
export function createORPCHooks<TProcedures extends Record<string, any>>(
  procedures: TProcedures & { __brand?: 'oRPCProcedures' }
) {
  return {
    useQuery: <TKey extends keyof TProcedures>(
      key: TKey,
      input: ProcedureInput<TProcedures[TKey]>,
      options?: {
        enabled?: boolean;
        revalidateOnFocus?: boolean;
        refreshInterval?: number;
        requireAuth?: boolean;
        swrConfig?: any;
      }
    ) => {
      return useORPCQuery(procedures[key], input, options as any);
    },

    useMutation: () => {
      const { mutate } = useORPCMutation();

      return {
        mutate: async <TKey extends keyof TProcedures>(
          key: TKey,
          input: ProcedureInput<TProcedures[TKey]>,
          options?: {
            invalidateKeys?: string[];
            optimisticData?: any;
          }
        ) => {
          return mutate(procedures[key], input, options);
        },
      };
    },
  };
}
