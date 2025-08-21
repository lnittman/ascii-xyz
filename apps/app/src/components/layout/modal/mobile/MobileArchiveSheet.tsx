'use client';

import {
  mobileArchiveModalOpenAtom,
  mobileArchiveModalStateAtom,
  mobileChatMenuOpenAtom,
} from '@/atoms/mobile-menus';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import { useDeleteChat } from '@/hooks/chat/mutations';
import { useChats } from '@/hooks/chat/queries';
import { useDeleteProjectMutation } from '@/hooks/project/mutations';
import { useProjects } from '@/hooks/project/queries';
import { Archive, ArrowLeft } from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import { useAtom, useSetAtom } from 'jotai';
import { useState } from 'react';

export function MobileArchiveSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileArchiveModalOpenAtom);
  const [modalState] = useAtom(mobileArchiveModalStateAtom);
  const setMobileChatMenuOpen = useSetAtom(mobileChatMenuOpenAtom);
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: mutateChats } = useChats();
  const { mutate: mutateProjects } = useProjects();
  const { deleteChat } = useDeleteChat();
  const { deleteProject } = useDeleteProjectMutation();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBack = () => {
    setIsOpen(false);
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setMobileChatMenuOpen(true);
    }, 100);
  };

  const handleArchive = async () => {
    if (!modalState.itemId) {
      return;
    }

    setIsLoading(true);

    try {
      if (modalState.itemType === 'project') {
        await deleteProject({ id: modalState.itemId });
        mutateProjects();
      } else {
        await deleteChat(modalState.itemId);
        mutateChats();
      }

      handleClose();
    } catch (_error) {
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  const title = (
    <div className="flex items-center gap-3">
      <button
        onClick={handleBack}
        className="flex h-8 w-8 items-center justify-center rounded-none border border-border bg-muted/20 text-muted-foreground transition-all duration-200 hover:border-foreground/20 hover:bg-muted/40 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        aria-label="back to menu"
      >
        <ArrowLeft className="h-4 w-4" weight="duotone" />
      </button>
      <span>archive chat</span>
    </div>
  );

  return (
    <MobileSheet isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3 rounded-none bg-muted/50 p-3">
          <Archive className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground text-sm">
              archive this {modalState.itemType}?
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              the {modalState.itemType} will be moved to your archived items and
              can be restored later.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 rounded-none text-foreground"
          >
            cancel
          </Button>
          <Button
            onClick={handleArchive}
            disabled={isLoading}
            variant="secondary"
            className="flex-1 rounded-none"
          >
            {isLoading ? 'archiving...' : 'archive'}
          </Button>
        </div>
      </div>
    </MobileSheet>
  );
}
