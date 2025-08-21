'use client';

import {
  mobileChatMenuOpenAtom,
  mobileRenameModalOpenAtom,
  mobileRenameModalStateAtom,
} from '@/atoms/mobile-menus';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import { useRenameChat } from '@/hooks/chat/mutations';
import { useChats } from '@/hooks/chat/queries';
import { useUpdateProjectMutation } from '@/hooks/project/mutations';
import { useProjects } from '@/hooks/project/queries';
import { ArrowLeft } from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { useAtom, useSetAtom } from 'jotai';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

export function MobileRenameSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileRenameModalOpenAtom);
  const [modalState] = useAtom(mobileRenameModalStateAtom);
  const setMobileChatMenuOpen = useSetAtom(mobileChatMenuOpenAtom);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: mutateChats } = useChats();
  const { renameChat } = useRenameChat();
  const { mutate: mutateProjects } = useProjects();
  const { updateProject } = useUpdateProjectMutation();
  const [isRenaming, setIsRenaming] = useState(false);

  const isLoading = isRenaming;

  const handleClose = () => {
    setIsOpen(false);
    setNewTitle('');
  };

  const handleBack = () => {
    setIsOpen(false);
    setNewTitle('');
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setMobileChatMenuOpen(true);
    }, 100);
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  // Set initial title when modal opens
  useEffect(() => {
    if (isOpen && modalState.itemId) {
      // You might want to fetch the current title here
      // For now, we'll start with empty string
      setNewTitle('');
    }
  }, [isOpen, modalState.itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim() || !modalState.itemId) {
      return;
    }

    setIsRenaming(true);
    try {
      if (modalState.itemType === 'project') {
        await updateProject({ id: modalState.itemId, name: newTitle.trim() });
        mutateProjects();
      } else {
        await renameChat({ id: modalState.itemId, title: newTitle.trim() });
        mutateChats();
      }

      handleClose();
    } catch (_error) {
      // You might want to show an error toast here
    } finally {
      setIsRenaming(false);
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
      <span>
        rename {modalState.itemType === 'project' ? 'project' : 'chat'}
      </span>
    </div>
  );

  return (
    <MobileSheet isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4 p-4">
        <p className="text-muted-foreground text-sm">
          enter a new name for this {modalState.itemType}.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={`${modalState.itemType === 'project' ? 'project' : 'chat'} name`}
            disabled={isLoading}
            className="rounded-none"
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-none"
            >
              cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !newTitle.trim()}
              className="flex-1 rounded-none"
            >
              {isLoading ? 'saving...' : 'save'}
            </Button>
          </div>
        </form>
      </div>
    </MobileSheet>
  );
}
