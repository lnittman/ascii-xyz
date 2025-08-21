'use client';

import {
  mobileChatMenuOpenAtom,
  mobileDeleteModalOpenAtom,
  mobileDeleteModalStateAtom,
} from '@/atoms/mobile-menus';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import { useDeleteChat } from '@/hooks/chat/mutations';
import { useChatData, useChats } from '@/hooks/chat/queries';
import { useProjectMutations } from '@/hooks/project/mutations';
import { useProject, useProjects } from '@/hooks/project/queries';
import { ArrowLeft, Trash } from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import { useAtom, useSetAtom } from 'jotai';
import { useState } from 'react';

export function MobileDeleteSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileDeleteModalOpenAtom);
  const [modalState] = useAtom(mobileDeleteModalStateAtom);
  const setMobileChatMenuOpen = useSetAtom(mobileChatMenuOpenAtom);

  const { mutate: mutateChats } = useChats();
  const { deleteChat } = useDeleteChat();
  const { mutate: mutateProjects } = useProjects();
  const { deleteProject } = useProjectMutations();
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch data for the item being deleted
  const { chat: chatData } = useChatData(
    modalState.itemType === 'chat' ? modalState.itemId : null
  );
  const { data: projectData } = useProject(
    modalState.itemType === 'project' ? modalState.itemId : null
  );

  const isLoading = isDeleting;
  const itemName =
    modalState.itemType === 'project'
      ? projectData?.name || 'this project'
      : chatData?.title || 'this chat';

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

  const handleDelete = async () => {
    if (!modalState.itemId) {
      return;
    }

    setIsDeleting(true);
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
      setIsDeleting(false);
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
      <span>delete {modalState.itemType}</span>
    </div>
  );

  return (
    <MobileSheet isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3 rounded-none bg-destructive/10 p-3">
          <Trash className="h-5 w-5 flex-shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-foreground text-sm">
              delete {itemName}?
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              this action cannot be undone. this {modalState.itemType} and all
              its data will be permanently removed.
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
            variant="outline"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 rounded-none border-red-500/20 text-red-500/70 transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500"
          >
            {isLoading ? 'deleting...' : 'delete'}
          </Button>
        </div>
      </div>
    </MobileSheet>
  );
}
