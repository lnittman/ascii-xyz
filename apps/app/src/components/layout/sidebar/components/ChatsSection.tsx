'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';

import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import { cn } from '@repo/design/lib/utils';

import { sidebarOpenAtom } from '@/atoms/layout/sidebar';
import { ChatMenu } from '@/components/shared/menu/chat-menu';
import { useChats } from '@/hooks/chat/queries';
import { useProjects } from '@/hooks/project/queries';
import type { Chat } from '@repo/database/types';

// Group chats by date
const groupChatsByDate = (chats: any[] | undefined) => {
  // Handle undefined or empty chats array
  if (!chats || !Array.isArray(chats)) {
    // Return empty groups if chats is undefined
    return {
      today: [],
      yesterday: [],
      'previous 7 days': [],
      'previous 30 days': [],
      older: [],
    };
  }

  const groups: Record<string, any[]> = {
    today: [],
    yesterday: [],
    'previous 7 days': [],
    'previous 30 days': [],
    older: [],
  };

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(now);
  lastMonth.setDate(lastMonth.getDate() - 30);

  chats.forEach((chat) => {
    const chatDate = new Date(chat.updatedAt);

    if (chatDate.toDateString() === now.toDateString()) {
      groups.today.push(chat);
    } else if (chatDate.toDateString() === yesterday.toDateString()) {
      groups.yesterday.push(chat);
    } else if (chatDate > lastWeek) {
      groups['previous 7 days'].push(chat);
    } else if (chatDate > lastMonth) {
      groups['previous 30 days'].push(chat);
    } else {
      groups.older.push(chat);
    }
  });

  return groups;
};

interface ChatsSectionProps {
  initialChats?: Chat[];
}

export function ChatsSection({ initialChats }: ChatsSectionProps = {}) {
  const [isOpen, _setIsOpen] = useAtom(sidebarOpenAtom);
  const _isDesktop = useMediaQuery('(min-width: 1024px)');
  const pathname = usePathname();
  const { isLoading: isProjectsLoading } = useProjects();

  // Get chat data - SWR will use server-provided fallbackData from parent
  const { chats, isLoading } = useChats(initialChats);

  // Group chats by date for rendering
  const chatGroups = groupChatsByDate(chats);

  if (isLoading || isProjectsLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: isOpen ? 1 : 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      style={{
        width: 278,
      }}
      className="flex h-full flex-col"
    >
      {/* Chats Section - No title header */}
      <div className="flex-1">
        {Object.entries(chatGroups)
          .filter(([_, groupChats]) => groupChats.length > 0)
          .map(([group, groupChats], index) => (
            <div key={group} className={index === 0 ? 'mt-2' : 'mt-6'}>
              <div
                className="sticky top-0 z-[9] mb-3 px-4 py-2 text-muted-foreground text-xs"
                style={{ backgroundColor: 'var(--sidebar)' }}
              >
                {group}
              </div>
              <div className="space-y-1 px-2">
                <AnimatePresence mode="popLayout">
                  {groupChats.map((chat) => (
                    <motion.div
                      key={chat.id}
                      className="group relative select-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        marginTop: 0,
                        marginBottom: 0,
                        transition: {
                          opacity: { duration: 0.2 },
                        },
                      }}
                      transition={{
                        opacity: { duration: 0.3 },
                        height: { duration: 0.3 },
                      }}
                      layout
                    >
                      <Link
                        href={`/c/${chat.id}`}
                        data-active={pathname?.includes(`/c/${chat.id}`) || false}
                        className={cn(
                          'flex max-h-[32px] w-full cursor-pointer items-center rounded-none px-2 py-2 text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80 group-active:text-foreground',
                          pathname?.includes(`/c/${chat.id}`)
                            ? 'bg-accent'
                            : 'hover:bg-accent/60 active:bg-accent'
                        )}
                      >
                        <span
                          className={cn(
                            'flex-1 truncate leading-normal transition-colors duration-300',
                            pathname?.includes(`/c/${chat.id}`) &&
                              'text-foreground'
                          )}
                          style={{ fontSize: '12px' }}
                        >
                          {chat.title}
                        </span>
                        <ChatMenu
                          chatId={chat.id}
                          isActive={pathname?.includes(`/c/${chat.id}`) || false}
                        />
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
      </div>
    </motion.div>
  );
}
