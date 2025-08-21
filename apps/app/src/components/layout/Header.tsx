'use client';

import {
  CaretLeft,
  CaretRight,
  Sidebar as SidebarIcon,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { usePathname } from 'next/navigation';
import React from 'react';

import { Button } from '@repo/design/components/ui/button';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { cn } from '@repo/design/lib/utils';

import { sidebarOpenAtom } from '@/atoms/layout/sidebar';
import { ChatTitleMenu } from '@/components/app/chat/id/components/chat-header/components';
import { useInitialChat } from '@/contexts/initial-chat-context';
import { useChatData } from '@/hooks/chat/queries';

interface HeaderProps {
  // Chat-specific props (optional - only for chat pages)
  chatId?: string;
  isProject?: boolean;
  // Optional static title for non-chat pages
  title?: string;
  // Initial chat title to avoid loading state
  initialChatTitle?: string;
}

export function Header({
  chatId,
  isProject = false,
  title,
  initialChatTitle,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  const [isHovered, setIsHovered] = React.useState(false);
  const { isMobile } = useIsMobile();
  const pathname = usePathname();
  const { initialChat } = useInitialChat();

  // Use initial chat from context if available and matches current chatId
  const contextInitialChat =
    initialChat?.id === chatId ? initialChat : undefined;

  // Fetch chat data if chatId is provided, using context initial data for immediate display
  const { chat: chatData } = useChatData(chatId || '', contextInitialChat);
  const chatTitle =
    chatData?.title || contextInitialChat?.title || initialChatTitle;

  const toggle = () => setIsOpen(!isOpen);

  // Check if we're on a settings page
  const _isSettingsPage = pathname?.startsWith('/settings');

  // Calculate responsive positioning for chat title
  const getChatTitlePosition = () => {
    if (isMobile) {
      // On mobile, position after the sidebar toggle with some spacing
      return 58; // 48px for toggle button + 4px spacing
    }
    // On desktop, animate position based on sidebar state
    // When sidebar is open (280px), position at 292px (280 + 12px padding)
    // When sidebar is closed (48px), position at 60px (48 + 12px padding)
    return isOpen ? 290 : 58;
  };

  return (
    <>
      {/* Sidebar Toggle - Always above sidebar (245) but below blur overlay (250) */}
      <motion.div
        className="fixed top-3 left-2 z-[248]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Button
          onClick={toggle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group flex h-8 w-8 items-center justify-center rounded-none text-muted-foreground transition-all duration-300 hover:bg-accent/60 hover:text-foreground/75 active:bg-accent active:text-foreground"
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          variant="ghost"
        >
          {/* Different icon behavior for mobile vs desktop with smooth transitions */}
          <span className="relative flex h-5 w-5 items-center justify-center">
            {/* Sidebar icon - visible on desktop or mobile closed */}
            <SidebarIcon
              weight="duotone"
              className={cn(
                'absolute h-5 w-5 transition-opacity duration-200',
                isOpen ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
              )}
            />

            {/* Left Caret - for closing sidebar */}
            <CaretLeft
              weight="duotone"
              className={cn(
                'absolute h-5 w-5 transition-all duration-200',
                isOpen
                  ? 'translate-x-0 opacity-100' // Always visible when open - at center
                  : 'translate-x-1 opacity-0' // Hidden when sidebar is closed - exits to right
              )}
            />

            {/* Right Caret - for opening sidebar */}
            <CaretRight
              weight="duotone"
              className={cn(
                'absolute h-5 w-5 transition-all duration-200',
                !isOpen && isHovered
                  ? 'translate-x-0 opacity-100' // Visible on hover - slides to center
                  : '-translate-x-1 opacity-0' // Hidden - starts from left
              )}
            />
          </span>
        </Button>
      </motion.div>

      {/* Mobile Background for Settings Pages */}
      {/* Removed - no longer needed with proper document flow */}

      {/* Chat Title - Lower z-index so it gets covered by sidebar */}
      {chatId ? (
        <motion.div
          className="fixed top-3 z-[190]"
          initial={{ opacity: 0, marginLeft: getChatTitlePosition() }}
          animate={{
            opacity: 1,
            marginLeft: getChatTitlePosition(),
          }}
          transition={{
            opacity: { duration: 0.3, ease: 'easeInOut', delay: 0.1 },
            marginLeft: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
          }}
        >
          <ChatTitleMenu
            chatId={chatId}
            chatTitle={chatTitle}
            isProject={isProject}
          />
        </motion.div>
      ) : title ? (
        <motion.div
          className={cn(
            'fixed top-[14px] z-[190]',
            // Hide Settings title on desktop - it will be shown in SettingsLayout instead
            !isMobile && title === 'Settings' && 'hidden'
          )}
          initial={{ opacity: 0, marginLeft: getChatTitlePosition() }}
          animate={{
            opacity: 1,
            marginLeft: getChatTitlePosition(),
          }}
          transition={{
            opacity: { duration: 0.3, ease: 'easeInOut', delay: 0.1 },
            marginLeft: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
          }}
        >
          <span className="font-medium text-foreground text-xl">{title}</span>
        </motion.div>
      ) : null}
    </>
  );
}
