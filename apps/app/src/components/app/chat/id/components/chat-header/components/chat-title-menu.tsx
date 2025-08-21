'use client';

import {
  Archive,
  CaretDown,
  CaretUp,
  Export,
  FolderSimple,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  mobileChatMenuOpenAtom,
  mobileChatMenuStateAtom,
} from '@/atoms/mobile-menus';
import { Menu, type MenuGroup } from '@/components/shared/menu';
import { TextScramble } from '@/components/shared/text-scramble';
import { useModals } from '@/hooks/use-modals';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';

interface ChatTitleMenuProps {
  chatId: string;
  chatTitle?: string;
  isProject?: boolean;
}

export function ChatTitleMenu({
  chatId,
  chatTitle,
  isProject = false,
}: ChatTitleMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMobile } = useIsMobile();
  const [, setMobileMenuOpen] = useAtom(mobileChatMenuOpenAtom);
  const [, setMobileMenuState] = useAtom(mobileChatMenuStateAtom);

  // Track title animation state
  const hasInitialTitle = chatTitle && chatTitle !== 'untitled';
  const [showUntitled, setShowUntitled] = useState(!hasInitialTitle);
  const [showNewTitle, setShowNewTitle] = useState(hasInitialTitle);
  const [isScrambling, setIsScrambling] = useState(false);
  const [scrambleTrigger, setScrambleTrigger] = useState(false);
  const prevTitleRef = useRef<string | undefined>(chatTitle);
  const isFirstRenderRef = useRef(true);

  const {
    openDeleteModal,
    openRenameModal,
    openShareModal,
    openArchiveModal,
    openAddToProjectModal,
  } = useModals();

  // Handle title transitions
  useEffect(() => {
    // Skip animation on first render if we already have a title
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      if (hasInitialTitle) {
        // We already have a title, no need to animate
        return;
      }
    }

    if (!chatTitle || chatTitle === 'untitled') {
      // No real title yet - show untitled
      setShowUntitled(true);
      setShowNewTitle(false);
      setIsScrambling(false);
      prevTitleRef.current = chatTitle;
      return;
    }

    // Check if this is actually a new title (not just an update)
    if (prevTitleRef.current !== chatTitle) {
      if (showUntitled) {
        // Transitioning from untitled to real title
        // First fade out untitled
        setShowUntitled(false);

        // After fade completes, show new title with streaming
        setTimeout(() => {
          setShowNewTitle(true);
          setIsScrambling(true);
          setScrambleTrigger(true);
        }, 200); // Match fade animation duration
      } else if (prevTitleRef.current && prevTitleRef.current !== 'untitled') {
        // Direct title change (e.g., from rename)
        setShowNewTitle(true);
        setIsScrambling(true);
        setScrambleTrigger(true);
      }

      prevTitleRef.current = chatTitle;
    }
  }, [chatTitle, showUntitled, hasInitialTitle]);

  const handleOpenMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMobileMenuState({ chatId, isProject });
    setMobileMenuOpen(true);
  };

  // Define menu groups for the title dropdown
  const titleMenuGroups = useMemo<MenuGroup[]>(() => {
    const mainGroup: MenuGroup = {
      items: [
        {
          id: 'rename',
          label: 'rename',
          icon: <PencilSimple weight="duotone" className="h-4 w-4" />,
          onClick: (e: React.MouseEvent | Event) => {
            e.stopPropagation();
            openRenameModal(chatId, isProject ? 'project' : 'chat');
          },
        },
        ...(isProject
          ? []
          : [
              {
                id: 'share',
                label: 'share',
                icon: <Export weight="duotone" className="h-4 w-4" />,
                onClick: (e: React.MouseEvent | Event) => {
                  e.stopPropagation();
                  openShareModal(chatId);
                },
              },
              {
                id: 'add-to-project',
                label: 'add to project',
                icon: <FolderSimple weight="duotone" className="h-4 w-4" />,
                onClick: (e: React.MouseEvent | Event) => {
                  e.stopPropagation();
                  openAddToProjectModal(chatId);
                },
              },
            ]),
        {
          id: 'archive',
          label: 'archive',
          icon: <Archive weight="duotone" className="h-4 w-4" />,
          onClick: (e: React.MouseEvent | Event) => {
            e.stopPropagation();
            openArchiveModal(chatId, isProject ? 'project' : 'chat');
          },
        },
      ],
      showDivider: true,
    };

    const dangerGroup: MenuGroup = {
      items: [
        {
          id: 'delete',
          label: 'delete',
          icon: <Trash weight="duotone" className="h-4 w-4 text-red-500" />,
          onClick: (e: React.MouseEvent | Event) => {
            e.stopPropagation();
            openDeleteModal(chatId, isProject ? 'project' : 'chat');
          },
          isDanger: true,
        },
      ],
    };

    return [mainGroup, dangerGroup];
  }, [
    chatId,
    isProject,
    openRenameModal,
    openShareModal,
    openAddToProjectModal,
    openArchiveModal,
    openDeleteModal,
  ]);

  // Determine which title to show
  const displayTitle = showNewTitle && chatTitle ? chatTitle : 'untitled';
  const shouldScramble = !!(showNewTitle && chatTitle && isScrambling);

  // --- Conditional Rendering Logic ---
  if (isMobile) {
    return (
      <button
        onClick={handleOpenMobileMenu}
        className="flex h-8 select-none items-center rounded-none px-3 text-foreground transition-all hover:bg-accent/40 hover:text-accent-foreground"
      >
        <div className="flex items-center">
          <TextScramble
            as="span"
            className="font-medium text-sm"
            duration={1.2}
            speed={0.04}
            characterSet=". "
            trigger={shouldScramble && scrambleTrigger}
            onScrambleComplete={() => {
              setIsScrambling(false);
              setScrambleTrigger(false);
            }}
          >
            {displayTitle}
          </TextScramble>
          <CaretDown
            weight="duotone"
            className="ml-2 h-4 w-4 flex-shrink-0 text-muted-foreground"
          />
        </div>
      </button>
    );
  }

  // --- Desktop Dropdown ---
  return (
    <Menu
      trigger={
        <div className="flex items-center gap-2 text-foreground">
          <TextScramble
            as="span"
            className="font-medium text-sm"
            duration={1.2}
            speed={0.04}
            characterSet=". "
            trigger={shouldScramble && scrambleTrigger}
            onScrambleComplete={() => {
              setIsScrambling(false);
              setScrambleTrigger(false);
            }}
          >
            {displayTitle}
          </TextScramble>
          <AnimatePresence mode="wait" initial={false}>
            {menuOpen ? (
              <motion.div
                key="up"
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.15 }}
              >
                <CaretUp
                  weight="duotone"
                  className="h-4 w-4 text-muted-foreground"
                />
              </motion.div>
            ) : (
              <motion.div
                key="down"
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2 }}
                transition={{ duration: 0.15 }}
              >
                <CaretDown
                  weight="duotone"
                  className="h-4 w-4 text-muted-foreground"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }
      groups={titleMenuGroups}
      side="bottom"
      align="end"
      sideOffset={8}
      triggerClassName="h-8 flex items-center px-3 transition-all hover:bg-accent/40 hover:text-accent-foreground select-none rounded-none text-foreground"
      triggerActiveClassName="!bg-accent/50 text-accent-foreground"
      onOpenChange={setMenuOpen}
    />
  );
}
