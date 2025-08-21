'use client';

import React from 'react';

import { CaretRight, ChatDots, Empty } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useTransitionRouter } from 'next-view-transitions';

import { Button } from '@repo/design/components/ui/button';
import { cn } from '@repo/design/lib/utils';

import { useModals } from '@/hooks/use-modals';

interface ChatGroupListProps {
  filteredChatGroups: Record<string, any[]>;
  search: string;
  chats: any[] | undefined;
  activeItemId: string | null;
  pathname: string;
  handleSelectChat: (chatId: string) => void;
  closeCommandModal: () => void;
  isKeyboardNav?: boolean;
}

export const ChatGroupList = React.memo(function ChatGroupList({
  filteredChatGroups,
  search,
  chats,
  activeItemId,
  pathname,
  handleSelectChat,
  closeCommandModal,
  isKeyboardNav = false,
}: ChatGroupListProps) {
  const router = useTransitionRouter();
  const { setCommandHoveredItem } = useModals();

  // Function to handle mouse enter on chat items
  const handleMouseEnter = React.useCallback(
    (chatId: string) => {
      if (!isKeyboardNav && activeItemId !== chatId) {
        setCommandHoveredItem(chatId, 'mouse');
      }
    },
    [setCommandHoveredItem, isKeyboardNav, activeItemId]
  );

  // Empty state - no chats at all
  if (!chats || chats.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.div
          className="flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ opacity: { duration: 0.3 } }}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-muted/40">
            <Empty weight="duotone" className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mb-3 text-muted-foreground text-sm">
            you have no chats yet
          </p>
          <Button
            onClick={() => {
              router.push('/');
              closeCommandModal();
            }}
            variant="outline"
            className="rounded-none text-muted-foreground text-xs"
          >
            start a new chat
          </Button>
        </motion.div>
      </div>
    );
  }

  // No search results
  if (
    search.length > 0 &&
    !Object.entries(filteredChatGroups).some(
      ([_, groupChats]) => groupChats.length > 0
    )
  ) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.div
          className="flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ opacity: { duration: 0.3 } }}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-muted/40">
            <Empty weight="duotone" className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            no chats found for &quot;{search}&quot;
          </p>
        </motion.div>
      </div>
    );
  }

  // Render chat groups
  return (
    <>
      {Object.entries(filteredChatGroups).map(
        ([group, groupChats]) =>
          groupChats.length > 0 && (
            <div key={group} className="mb-2">
              <h4 className="px-2 py-1 text-muted-foreground text-xs">
                {group}
              </h4>
              <div className="space-y-1">
                {groupChats.map((chat) => (
                  <button
                    key={chat.id}
                    onMouseEnter={() => handleMouseEnter(chat.id)}
                    onFocus={() => setCommandHoveredItem(chat.id, 'keyboard')}
                    onClick={() => handleSelectChat(chat.id)}
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between px-2 py-1.5 text-muted-foreground transition-colors duration-300 hover:text-foreground/80 active:text-foreground',
                      activeItemId === chat.id
                        ? 'bg-accent'
                        : 'hover:bg-accent/50',
                      pathname?.includes(`/c/${chat.id}`) ? 'font-medium' : ''
                    )}
                  >
                    <div className="flex items-center">
                      <ChatDots
                        weight="duotone"
                        className="mr-2 h-4 w-4 text-muted-foreground"
                      />
                      <span className="flex-1 truncate text-left text-sm">
                        {chat.title}
                      </span>
                    </div>
                    <CaretRight
                      weight="bold"
                      className="h-3 w-3 text-muted-foreground"
                    />
                  </button>
                ))}
              </div>
            </div>
          )
      )}
    </>
  );
});
