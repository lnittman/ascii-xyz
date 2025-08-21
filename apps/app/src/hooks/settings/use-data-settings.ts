'use client';

import type { DataSettings } from '@repo/database/types';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

/**
 * Hook to fetch data settings
 */
export function useDataSettings(initialData?: DataSettings) {
  const { data, error, isLoading, mutate } = useSWR<DataSettings | undefined>(
    'data-settings',
    async () => {
      const response = await fetch('/api/users/me/settings/data');
      if (!response.ok) {
        throw new Error('Failed to fetch data settings');
      }
      const result = await response.json();
      return result.data;
    },
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
    }
  );

  return {
    settings: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Hook to update data settings
 */
export function useUpdateDataSettings() {
  const { trigger, isMutating, error } = useSWRMutation(
    'data-settings',
    async (_url, { arg }: { arg: any }) => {
      const { updateDataSettings } = await import('@repo/orpc/actions');
      return updateDataSettings(arg);
    }
  );

  return {
    updateDataSettings: trigger,
    isUpdating: isMutating,
    error,
  };
}
