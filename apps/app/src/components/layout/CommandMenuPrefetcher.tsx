'use client';

import { useChats } from '@/hooks/chat/queries';
import { fetcher } from '@/lib/fetcher';
import type { Chat } from '@repo/database/types';
import { useEffect } from 'react';
import { preload } from 'swr';

/**
 * Pre-fetches data for the command menu to ensure instant loading
 * This component runs at the app level and pre-loads the first few chats' messages
 */
export function CommandMenuPrefetcher() {
  const { chats } = useChats();

  useEffect(() => {
    if (!chats || chats.length === 0) {
      return;
    }

    // Pre-fetch messages for the first 3 chats
    const chatsToPreload = chats.slice(0, 3);

    chatsToPreload.forEach((chat: Chat) => {
      // Pre-load chat messages into SWR cache
      preload(`/api/chats/${chat.id}/messages`, fetcher);

      // Also pre-load the chat data itself
      preload(`/api/chats/${chat.id}`, fetcher);
    });
  }, [chats]);

  return null; // This component doesn't render anything
}
