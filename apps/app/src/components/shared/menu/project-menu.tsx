'use client';

import { useAtom } from 'jotai';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';

import { Archive, DotsThree, PencilSimple, Trash } from '@phosphor-icons/react';

import {
  mobileProjectMenuOpenAtom,
  mobileProjectMenuStateAtom,
} from '@/atoms/mobile-menus';
import { useModals } from '@/hooks/use-modals';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import { cn } from '@repo/design/lib/utils';

import { Menu, type MenuGroup } from '.';

interface ProjectMenuProps {
  projectId: string;
  isActive?: boolean;
}

export function ProjectMenu({ projectId, isActive = false }: ProjectMenuProps) {
  const { isMobile } = useIsMobile();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [, setMobileMenuOpen] = useAtom(mobileProjectMenuOpenAtom);
  const [, setMobileMenuState] = useAtom(mobileProjectMenuStateAtom);
  const [isOpen, setIsOpen] = useState(false);

  // Use the chat modals hook
  const { openDeleteModal, openRenameModal, openArchiveModal } = useModals();

  const handleOpenMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMobileMenuState({ projectId });
    setMobileMenuOpen(true);
  };

  const handleRename = useCallback(
    (e: React.MouseEvent | Event) => {
      // Prevent event from propagating to parent elements
      e.stopPropagation();

      openRenameModal(projectId, 'project');
    },
    [openRenameModal, projectId]
  );

  const handleArchive = useCallback(
    (e: React.MouseEvent | Event) => {
      // Prevent event from propagating to parent elements
      e.stopPropagation();

      openArchiveModal(projectId, 'project');
    },
    [openArchiveModal, projectId]
  );

  const handleShowDeleteConfirmation = useCallback(
    (e: React.MouseEvent | Event) => {
      // Prevent event from propagating to parent elements
      e.stopPropagation();

      openDeleteModal(projectId, 'project');
    },
    [openDeleteModal, projectId]
  );

  // Define menu groups and items
  const menuGroups = useMemo<MenuGroup[]>(() => {
    const mainGroup: MenuGroup = {
      items: [
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
  }, [handleRename, handleArchive, handleShowDeleteConfirmation]);

  // Memoize the trigger element to prevent unnecessary renders
  const menuTrigger = useMemo(
    () => <DotsThree weight="duotone" className="h-5 w-5" />,
    []
  );

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
        trigger={menuTrigger}
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
