'use client';

import useSWR from 'swr';

import type { SharedLinkResponse } from '@repo/services/share';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSharedLinks(initialData?: SharedLinkResponse[]) {
  const { data, error, mutate } = useSWR<{
    success: boolean;
    data: SharedLinkResponse[];
  }>('/api/share', fetcher, {
    revalidateOnFocus: false,
    fallbackData: initialData
      ? { success: true, data: initialData }
      : undefined,
  });

  return {
    sharedLinks: data?.data ?? [],
    isLoading: !error && !data,
    error,
    refresh: mutate,
  };
}
