'use client';

import { createContext, useContext } from 'react';
import type { Chat } from '@repo/database/types';
import type React from 'react';

interface InitialChatContextValue {
  initialChat?: Chat;
}

const InitialChatContext = createContext<InitialChatContextValue>({});

export function InitialChatProvider({
  children,
  initialChat,
}: {
  children: React.ReactNode;
  initialChat?: Chat;
}) {
  return (
    <InitialChatContext.Provider value={{ initialChat }}>
      {children}
    </InitialChatContext.Provider>
  );
}

export function useInitialChat() {
  return useContext(InitialChatContext);
}
