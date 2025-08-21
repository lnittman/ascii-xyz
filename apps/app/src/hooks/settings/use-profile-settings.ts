import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { type ApiResponse, fetcher } from '@/lib/fetcher';
import type { ProfileSettings } from '@repo/database/types';
import type { UpdateProfileSettings } from '@repo/services/settings/profile';

export function useProfileSettings(initialData?: ProfileSettings) {
  const { data, error, mutate } = useSWR<ApiResponse<ProfileSettings>>(
    '/api/users/me/settings/profile',
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

export function useUpdateProfileSettings() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/users/me/settings/profile',
    async (_url, { arg }: { arg: UpdateProfileSettings }) => {
      const { updateProfileSettings } = await import('@repo/orpc/actions');
      return updateProfileSettings(arg);
    }
  );

  return {
    updateProfileSettings: trigger,
    isUpdating: isMutating,
    error,
  };
}
