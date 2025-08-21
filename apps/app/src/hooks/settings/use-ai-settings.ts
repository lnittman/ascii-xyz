import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { type ApiResponse, fetcher } from '@/lib/fetcher';
import type { AISettings } from '@repo/database/types';
import type { UpdateAISettings } from '@repo/services/settings/ai';

export function useAISettings(initialData?: AISettings) {
  const { data, error, mutate } = useSWR<ApiResponse<AISettings>>(
    '/api/users/me/settings/ai',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryCount: 3,
      fallbackData: initialData
        ? { success: true, data: initialData }
        : undefined,
    }
  );

  const settings = data?.success ? data.data : undefined;

  return {
    settings,
    isLoading: !error && !data,
    error,
    refresh: mutate,
  };
}

export function useUpdateAISettings() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/users/me/settings/ai',
    async (_url, { arg }: { arg: UpdateAISettings }) => {
      const { updateAISettings } = await import('@repo/orpc/actions');
      const result = await updateAISettings(arg);
      return result;
    }
  );

  return {
    updateAISettings: trigger,
    isUpdating: isMutating,
    error,
  };
}
