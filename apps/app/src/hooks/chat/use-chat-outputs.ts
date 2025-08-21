import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import useSWR from 'swr';

import { chatOutputsAtom } from '@/atoms/layout/output';
import { type ApiResponse, fetcher } from '@/lib/fetcher';

// TODO: Define Output type in @repo/schemas/output
type Output = any;

export function useChatOutputs(chatId: string | null) {
  const setChatOutputs = useSetAtom(chatOutputsAtom);

  const { data, error, mutate, isLoading } = useSWR<ApiResponse<Output[]>>(
    chatId ? `/api/chats/${chatId}/outputs` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // Cache for 30 seconds
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  // Update the atom when outputs are fetched
  useEffect(() => {
    if (data?.data && chatId) {
      // Replace all outputs for this chat - don't append
      setChatOutputs(
        data.data.map((output: any) => ({
          ...output,
          createdAt: new Date(output.createdAt),
          updatedAt: output.updatedAt ? new Date(output.updatedAt) : undefined,
          chatId,
        }))
      );
    } else if (!chatId) {
      // Clear outputs when no chat ID
      setChatOutputs([]);
    }
  }, [data, chatId, setChatOutputs]);

  return {
    outputs: data?.data || [],
    isLoading: !error && !data && !!chatId,
    isError: !!error,
    error,
    mutateOutputs: mutate,
    // Helper function to refresh outputs
    refreshOutputs: () => mutate(),
  };
}
