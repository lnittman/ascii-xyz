import { useORPC } from '@/providers/orpc-provider';
import { useSWRConfig } from 'swr';

type ProcedureKey<TProcedure> = TProcedure extends (...args: infer P) => any
  ? string
  : TProcedure extends object
    ? {
        [K in keyof TProcedure]: TProcedure[K] extends (...args: infer P) => any
          ? K extends string
            ? `${K}` | `${K}.${ProcedureKey<TProcedure[K]>}`
            : never
          : ProcedureKey<TProcedure[K]>;
      }[keyof TProcedure]
    : never;

export function useORPCProcedure<
  TProcedure extends (...args: any) => any,
  _TResult = ReturnType<TProcedure>,
>(procedure: TProcedure, key: string) {
  const { mutate } = useSWRConfig();
  const { swr } = useORPC();

  return {
    data: undefined,
    isLoading: false,
    error: null,
    mutate: async (input: Parameters<TProcedure>[0]) => {
      const result = await procedure(input);
      // Invalidate related queries
      mutate(key);
      return result;
    },
  };
}

export function useORPCQuery<TInput, TOutput>(
  key: string,
  input: TInput,
  options?: {
    enabled?: boolean;
    revalidateOnFocus?: boolean;
    refreshInterval?: number;
  }
) {
  const { swr } = useORPC();

  const { data, error, isLoading, mutate } = swr.useQuery<TOutput>(key, input, {
    revalidateOnFocus: options?.revalidateOnFocus ?? false,
    revalidateOnReconnect: false,
    refreshInterval: options?.refreshInterval ?? 0,
    enabled: options?.enabled ?? true,
  });

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

export function useORPCMutation<TInput, TOutput>(key: string) {
  const { swr } = useORPC();

  const { mutateAsync } = swr.useMutation<TOutput>(key);

  return {
    mutate: async (input: TInput) => {
      const result = await mutateAsync(input);
      return result;
    },
  };
}
