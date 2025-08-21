import { fetcher } from '@/lib/fetcher';
import type { User } from '@repo/database/types';
import useSWR from 'swr';

export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: User;
  }>('/api/users/me', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    user: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}
