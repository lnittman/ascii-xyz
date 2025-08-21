'use client';

import { useAtom } from 'jotai';
import type React from 'react';
import { useMemo, useState } from 'react';

import {
  Archive,
  DotsThree,
  Export,
  FolderSimple,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react';

import {
  mobileChatMenuOpenAtom,
  mobileChatMenuStateAtom,
} from '@/atoms/mobile-menus';
import { useModals } from '@/hooks/use-modals';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import { cn } from '@repo/design/lib/utils';

import { Menu, type MenuGroup } from '.';

interface ChatMenuProps {
  chatId: string;
  isProject?: boolean;
  isActive?: boolean;
}

export function ChatMenu({
  chatId,
  isProject = false,
  isActive = false,
}: ChatMenuProps) {
  const { isMobile } = useIsMobile();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [, setMobileMenuOpen] = useAtom(mobileChatMenuOpenAtom);
  const [, setMobileMenuState] = useAtom(mobileChatMenuStateAtom);
  const [isOpen, setIsOpen] = useState(false);

  // Use the chat modals hook
  const {
    openDeleteModal,
    openRenameModal,
    openShareModal,
    openArchiveModal,
    openAddToProjectModal,
  } = useModals();

  const handleOpenMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMobileMenuState({ chatId, isProject });
    setMobileMenuOpen(true);
  };

  const handleAddToProject = (e: React.MouseEvent | Event) => {
    // Prevent event from propagating to parent elements
    e.stopPropagation();

    openAddToProjectModal(chatId);
  };

  const handleRename = (e: React.MouseEvent | Event) => {
    // Prevent event from propagating to parent elements
    e.stopPropagation();

    openRenameModal(chatId, isProject ? 'project' : 'chat');
  };

  const handleShare = (e: React.MouseEvent | Event) => {
    // Prevent event from propagating to parent elements
    e.stopPropagation();

    openShareModal(chatId);
  };

  const handleArchive = (e: React.MouseEvent | Event) => {
    // Prevent event from propagating to parent elements
    e.stopPropagation();

    openArchiveModal(chatId, isProject ? 'project' : 'chat');
  };

  const handleShowDeleteConfirmation = (e: React.MouseEvent | Event) => {
    // Prevent event from propagating to parent elements
    e.stopPropagation();

    openDeleteModal(chatId, isProject ? 'project' : 'chat');
  };

  // Define menu groups and items
  const menuGroups = useMemo<MenuGroup[]>(() => {
    const mainGroup: MenuGroup = {
      items: [
        ...(isProject
          ? []
          : [
              {
                id: 'add-to-project',
                label: 'add to project',
                icon: <FolderSimple weight="duotone" className="h-4 w-4" />,
                onClick: handleAddToProject,
              },
              {
                id: 'share',
                label: 'share',
                icon: <Export weight="duotone" className="h-4 w-4" />,
                onClick: handleShare,
              },
            ]),
        {
          id: 'rename',
          label: 'rename',
          icon: <PencilSimple weight="duotone" className="h-4 w-4" />,
          onClick: handleRename,
        },
        {
          id: 'archive',
          label: 'archive',
          icon: <Archive weight="duotone" className="h-4 w-4" />,
          onClick: handleArchive,
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
          onClick: handleShowDeleteConfirmation,
          isDanger: true,
        },
      ],
    };

    return [mainGroup, dangerGroup];
  }, [isProject]); // Only recompute when isProject changes

  // --- Conditional Rendering Logic ---
  if (isMobile) {
    return (
      <button
        onClick={handleOpenMobileMenu}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-none text-muted-foreground opacity-100 transition-all',
          isActive
            ? 'hover:bg-foreground/10 hover:text-foreground'
            : 'hover:bg-accent/90 hover:text-foreground'
        )}
      >
        <DotsThree weight="duotone" className="h-5 w-5" />
      </button>
    );
  }

  // --- Desktop Dropdown (existing logic) ---
  return (
    <span
      className={cn(
        'relative z-20',
        isDesktop
          ? isOpen
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100'
          : 'opacity-100',
        'transition-opacity duration-200'
      )}
    >
      <Menu
        trigger={<DotsThree weight="duotone" className="h-5 w-5" />}
        groups={menuGroups}
        triggerClassName={cn(
          'flex h-6 w-6 items-center justify-center rounded-none text-muted-foreground transition-all',
          isActive
            ? 'hover:bg-foreground/10 hover:text-foreground'
            : 'hover:bg-accent/90 hover:text-foreground'
        )}
        triggerActiveClassName="bg-accent text-foreground"
        onOpenChange={setIsOpen}
      />
    </span>
  );
}
