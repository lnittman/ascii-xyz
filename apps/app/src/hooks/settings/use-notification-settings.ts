import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import type { NotificationSettings } from '@repo/database/types';
import type { UpdateNotificationSettings } from '@repo/services/settings/notification';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useNotificationSettings(initialData?: NotificationSettings) {
  const { data, error, mutate } = useSWR<{
    success: boolean;
    data: NotificationSettings;
  }>('/api/users/me/settings/notifications', fetcher, {
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

export function useUpdateNotificationSettings() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/users/me/settings/notifications',
    async (_url, { arg }: { arg: UpdateNotificationSettings }) => {
      const { updateNotificationSettings } = await import('@repo/orpc/actions');
      return updateNotificationSettings(arg);
    }
  );

  return {
    updateNotificationSettings: trigger,
    isUpdating: isMutating,
    error,
  };
}
