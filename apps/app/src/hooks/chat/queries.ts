'use client';

import type { Chat } from '@repo/database/types';
import { useQuery } from '@repo/orpc/hooks';
import type { UIMessage } from 'ai';
import type { SWRConfiguration } from 'swr';

// Default SWR config for chat-related queries
const defaultChatConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 30000,
};

/**
 * Hook to fetch all chat metadata (for sidebar)
 * @param initialData - Server-fetched data for hydration (uses fallbackData internally)
 */
export function useChats(initialData?: Chat[]) {
  const { data, error, mutate, isValidating } = useQuery(
    'chats.list',
    undefined,
    {
      ...defaultChatConfig,
      // Use fallbackData for RSC hydration - data is immediately available but can still revalidate
      fallbackData: initialData,
    }
  );

  return {
    chats: data,
    isLoading: !error && !data,
    isValidating,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single chat's full data (excluding messages)
 * @param id - Chat ID to fetch
 * @param initialData - Server-fetched data for hydration
 */
export function useChatData(id: string | null, initialData?: Chat) {
  const { data, error, mutate, isValidating } = useQuery(
    id ? 'chats.get' : null,
    id ? { id } : undefined,
    {
      ...defaultChatConfig,
      fallbackData: initialData,
    }
  );

  return {
    chat: data,
    isLoading: !error && !data && !!id,
    isValidating,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook to fetch chat messages
 * Note: For AI chat, the AI SDK's useChat hook manages messages in real-time
 * This hook is primarily for fetching historical messages
 * @param id - Chat ID to fetch messages for
 * @param initialData - Server-fetched messages for hydration
 */
export function useChatMessages(id: string | null, initialData?: UIMessage[]) {
  const { data, error, mutate, isValidating } = useQuery(
    id ? 'chats.messages' : null,
    id ? { chatId: id } : undefined,
    {
      ...defaultChatConfig,
      fallbackData: initialData,
      // Prevent excessive fetching that was causing server overload
      dedupingInterval: 30000, // Increased from 2s to 30s
      // Don't revalidate on mount since we have initial data
      revalidateOnMount: false,
      // Remove automatic polling - messages update via useChat hook
      refreshInterval: 0,
      // Reduce error retry attempts
      onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
        // Only retry up to 2 times
        if (retryCount >= 2) {
          return;
        }
        // Retry after 2 seconds with exponential backoff
        setTimeout(() => revalidate({ retryCount }), 2000 * (retryCount + 1));
      },
    }
  );

  return {
    messages: data,
    isLoading: !error && !data && !!id,
    isValidating,
    isError: !!error,
    error,
    mutate,
  };
}
