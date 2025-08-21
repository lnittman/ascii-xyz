'use client';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useAtom } from 'jotai';

import { ScrollFadeContainer } from '@/components/shared/scroll-fade-container';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';

import { sidebarOpenAtom } from '@/atoms/layout/sidebar';

import type { Chat, Project } from '@repo/database/types';
import { ChatsSection } from './components/ChatsSection';
import { CodeButton } from './components/CodeButton';
import { NewChatButton } from './components/NewChatButton';
import { ProjectsSection } from './components/ProjectsSection';
import { SidebarHeader } from './components/SidebarHeader';
import { UserMenu } from './components/user-menu';

interface SidebarProps {
  initialProjects?: Project[];
  initialChats?: Chat[];
}

export function Sidebar({ initialProjects, initialChats }: SidebarProps = {}) {
  const { isMobile, ready } = useIsMobile();
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);

  // Track if initial load is complete to prevent animations on first render
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Close sidebar on mobile, allow animations after initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // For mobile: always start closed
      if (isMobile) {
        setIsOpen(false);
      }

      // Mark initial load as complete after a short delay to prevent animations
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isMobile, setIsOpen]);

  if (!ready) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay when sidebar is open - using global blur overlay instead */}
      {isOpen && isMobile && (
        <motion.div
          className="fixed inset-0 z-[240] bg-background/80 backdrop-blur-sm lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Unified sidebar - adapts between mobile and desktop */}
      <motion.div
        className="fixed top-0 bottom-0 left-0 z-[245] flex flex-col overflow-hidden border-border border-t border-r"
        style={{ backgroundColor: 'var(--sidebar)' }}
        initial={{
          width: isMobile ? (isOpen ? 280 : 0) : isOpen ? 280 : 48,
          borderRightWidth: isMobile && !isOpen ? '0px' : '1px',
        }}
        animate={{
          width: isMobile ? (isOpen ? 280 : 0) : isOpen ? 280 : 48,
          borderRightWidth: isMobile && !isOpen ? '0px' : '1px',
          transition: {
            duration: initialLoadComplete ? 0.3 : 0,
            ease: [0.32, 0.72, 0, 1],
          },
        }}
      >
        <div className="flex h-full flex-col">
          {/* Top space with search button */}
          <SidebarHeader />

          {/* Code button */}
          <CodeButton />

          {/* New Chat button */}
          <NewChatButton />

          {/* Content area with Projects and Chats - scrollable with fade effects */}
          <ScrollFadeContainer
            showTop
            showBottom
            fadeSize={24}
            fadeColor="var(--sidebar)"
            className="flex-grow"
            scrollableClassName="overflow-y-auto"
          >
            <ProjectsSection initialProjects={initialProjects} />
            <ChatsSection initialChats={initialChats} />
          </ScrollFadeContainer>

          {/* User menu at the bottom - always fixed */}
          <div className="mt-auto px-2 pt-2 pb-2">
            <UserMenu />
          </div>
        </div>
      </motion.div>
    </>
  );
}
