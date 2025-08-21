'use client';

import { Empty, MagnifyingGlass, Plus } from '@phosphor-icons/react';
import { Input } from '@repo/design/components/ui/input';
import { cn } from '@repo/design/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useTransitionRouter } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { mobileCommandMenuOpenAtom } from '@/atoms/mobile-menus';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import { useChats } from '@/hooks/chat/queries';

// Group chats by date - same logic as desktop version
const groupChatsByDate = (chats: any[] | undefined) => {
  if (!chats || !Array.isArray(chats)) {
    return {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      'Previous 30 Days': [],
      Older: [],
    };
  }

  const validChats = chats;

  const groups: Record<string, any[]> = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    'Previous 30 Days': [],
    Older: [],
  };

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(now);
  lastMonth.setDate(lastMonth.getDate() - 30);

  validChats.forEach((chat) => {
    const chatDate = new Date(chat.updatedAt);

    if (chatDate.toDateString() === now.toDateString()) {
      groups.Today.push(chat);
    } else if (chatDate.toDateString() === yesterday.toDateString()) {
      groups.Yesterday.push(chat);
    } else if (chatDate > lastWeek) {
      groups['Previous 7 Days'].push(chat);
    } else if (chatDate > lastMonth) {
      groups['Previous 30 Days'].push(chat);
    } else {
      groups.Older.push(chat);
    }
  });

  return groups;
};

const ChatItem = ({
  chat,
  isActive,
  onClick,
}: {
  chat: any;
  isActive: boolean;
  onClick: () => void;
}) => (
  <div className="px-3 py-1">
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-none px-3 py-3 text-left text-foreground text-sm transition-colors hover:bg-accent',
        isActive && 'bg-accent/70'
      )}
    >
      <span className="flex-1 truncate">{chat.title}</span>
    </button>
  </div>
);

const NewChatItem = ({ onClick }: { onClick: () => void }) => (
  <div className="px-3 py-1">
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-none bg-accent/30 px-3 py-3 text-left text-foreground text-sm transition-colors hover:bg-accent"
    >
      <Plus
        size={20}
        weight="duotone"
        className="flex-shrink-0 text-foreground"
      />
      <span className="flex-1">new chat</span>
    </button>
  </div>
);

export function MobileCommandSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileCommandMenuOpenAtom);
  const { chats, isLoading, mutate: mutateChats } = useChats();
  const router = useTransitionRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  // Group chats by date
  const chatGroups = useMemo(() => groupChatsByDate(chats), [chats]);

  // Filter chat groups based on search
  const filteredChatGroups = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(chatGroups).map(([group, groupChats]) => [
          group,
          groupChats.filter((chat) =>
            chat.title.toLowerCase().includes(search.toLowerCase())
          ),
        ])
      ),
    [chatGroups, search]
  );

  // Fetch chats when the sheet opens
  useEffect(() => {
    if (isOpen) {
      mutateChats();
    }
  }, [isOpen, mutateChats]);

  // Focus the input when the sheet opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  const handleSelectChat = (chatId: string) => {
    handleClose();
    router.push(`/c/${chatId}`);
  };

  const handleNewChat = () => {
    handleClose();
    router.push('/');
  };

  const hasResults = Object.values(filteredChatGroups).some(
    (group) => group.length > 0
  );

  return (
    <MobileSheet
      isOpen={isOpen}
      onClose={handleClose}
      customHeader={true}
      title={
        <div className="relative flex-1">
          <MagnifyingGlass
            weight="duotone"
            className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground"
          />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search..."
            className="h-9 w-full rounded-none border-0 bg-transparent pr-16 pl-10 text-foreground text-sm placeholder:text-muted-foreground focus:border-0 focus:ring-0"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setSearch('')}
                className="-translate-y-1/2 absolute top-1/2 right-2 transform px-2 py-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
              >
                clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      }
      contentHeight="fill"
    >
      <div className="flex h-full flex-col">
        {/* New Chat Button */}
        <div className="flex-shrink-0 border-border/50 border-b px-3 py-3">
          <NewChatItem onClick={handleNewChat} />
        </div>

        {/* Chat List */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Loading your chats...
              </p>
            </div>
          ) : hasResults ? (
            <div className="py-2">
              {Object.entries(filteredChatGroups).map(
                ([group, groupChats]) =>
                  groupChats.length > 0 && (
                    <div key={group} className="mb-4">
                      <div className="px-6 py-2 font-medium text-muted-foreground text-xs">
                        {group}
                      </div>
                      {groupChats.map((chat) => (
                        <ChatItem
                          key={chat.id}
                          chat={chat}
                          isActive={pathname?.includes(`/c/${chat.id}`) || false}
                          onClick={() => handleSelectChat(chat.id)}
                        />
                      ))}
                    </div>
                  )
              )}
            </div>
          ) : search ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <motion.div
                className="flex flex-col items-center justify-center text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ opacity: { duration: 0.3 } }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-muted/40">
                  <Empty
                    weight="duotone"
                    className="h-6 w-6 text-muted-foreground"
                  />
                </div>
                <p className="mb-2 text-muted-foreground text-sm">
                  No chats found
                </p>
                <p className="text-muted-foreground text-xs">
                  Try a different search term
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center">
              <motion.div
                className="flex flex-col items-center justify-center text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ opacity: { duration: 0.3 } }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-muted/40">
                  <Empty
                    weight="duotone"
                    className="h-6 w-6 text-muted-foreground"
                  />
                </div>
                <p className="text-muted-foreground text-sm">no chats yet</p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </MobileSheet>
  );
}
