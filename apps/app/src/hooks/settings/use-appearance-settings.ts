import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import type { AppearanceSettings } from '@repo/database/types';
import type { UpdateAppearanceSettings } from '@repo/services/settings/appearance';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAppearanceSettings(initialData?: AppearanceSettings) {
  const { data, error, mutate } = useSWR<{
    success: boolean;
    data: AppearanceSettings;
  }>('/api/users/me/settings/appearance', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
    errorRetryCount: 3,
    fallbackData: initialData
      ? { success: true, data: initialData }
      : undefined,
  });

  const settings = data?.success ? data.data : undefined;

  return {
    settings,
    isLoading: !error && !data,
    error,
    refresh: mutate,
  };
}

export function useUpdateAppearanceSettings() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/users/me/settings/appearance',
    async (_url, { arg }: { arg: UpdateAppearanceSettings }) => {
      const { updateAppearanceSettings } = await import('@repo/orpc/actions');
      return updateAppearanceSettings(arg);
    }
  );

  return {
    updateAppearanceSettings: trigger,
    isUpdating: isMutating,
    error,
  };
}
