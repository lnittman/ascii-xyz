'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';

import { useRenameChat } from '@/hooks/chat/mutations';
import { useChatData, useChats } from '@/hooks/chat/queries';
import { useProjectMutations } from '@/hooks/project/mutations';
import { useProject, useProjects } from '@/hooks/project/queries';
import { useModals } from '@/hooks/use-modals';
import { cn } from '@repo/design/lib/utils';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  itemType?: 'chat' | 'project';
}

export function RenameModal({
  isOpen,
  onClose,
  itemId,
  itemType = 'chat',
}: RenameModalProps) {
  const { closeRenameModal } = useModals();
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [newTitle, setNewTitle] = useState('');

  // Get chat title from the sidebar list for instant display
  const { chats } = useChats();
  const { projects } = useProjects();

  const { chat: chatData, mutate: localMutateChat } = useChatData(
    itemType === 'chat' ? itemId : null
  );
  const { data: projectData, mutate: localMutateProject } = useProject(
    itemType === 'project' ? itemId : null
  );

  const { renameChat } = useRenameChat();
  const { updateProject } = useProjectMutations();
  const { mutate: mutateProjects } = useProjects();
  const [isRenaming, setIsRenaming] = useState(false);

  // Try to get title from cached list first for instant display
  const cachedTitle =
    itemType === 'project'
      ? projects?.find((p: any) => p.id === itemId)?.name
      : chats?.find((c: any) => c.id === itemId)?.title;

  const currentTitle =
    cachedTitle ||
    (itemType === 'project' ? projectData?.name || '' : chatData?.title || '');

  // Set initial title immediately when modal opens
  useEffect(() => {
    if (isOpen && currentTitle) {
      setNewTitle(currentTitle);
    }
  }, [isOpen, currentTitle]);

  // Handle focus separately
  useEffect(() => {
    if (isOpen) {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }

      focusTimeoutRef.current = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
      }, 50);

      return () => {
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
        }
      };
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isRenaming) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newTitle.trim();

    if (!itemId || !trimmedTitle || trimmedTitle === currentTitle) {
      if (trimmedTitle === currentTitle) {
        onClose();
      }
      return;
    }

    setIsRenaming(true);
    try {
      if (itemType === 'project') {
        await updateProject({ id: itemId, name: trimmedTitle });
      } else {
        await renameChat({ id: itemId, title: trimmedTitle });
        localMutateChat(
          (currentData: any) =>
            currentData ? { ...currentData, title: trimmedTitle } : undefined,
          false
        );
      }
      await mutateProjects();
      closeRenameModal();
    } catch (_error) {
    } finally {
      setIsRenaming(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isRenaming) {
        e.preventDefault();
        if (document.activeElement === inputRef.current) {
          inputRef.current?.blur();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isRenaming]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400]">
          <motion.div
            className="fixed inset-0 bg-background/60 backdrop-blur-md"
            onClick={handleBackdropClick}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 w-full max-w-md transform"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col overflow-hidden rounded-none border border-border/50 bg-background shadow-lg">
              <div className="relative flex items-center justify-between border-b p-3">
                <h3 className="font-normal text-foreground text-sm">
                  rename {itemType}
                </h3>

                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-none transition-colors hover:bg-accent/50"
                  disabled={isRenaming}
                >
                  <X
                    weight="duotone"
                    className="h-4 w-4 text-muted-foreground"
                  />
                </button>
              </div>

              <div className="p-4">
                <p className="mb-4 text-muted-foreground text-sm">
                  choose a new title for this {itemType}
                </p>

                <form
                  onSubmit={handleSubmit}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className={cn(
                      'relative mb-4 flex h-[44px] w-full items-center overflow-hidden rounded-none border transition-colors',
                      isRenaming
                        ? 'border-input/30 bg-muted/30'
                        : 'border-input'
                    )}
                  >
                    <Input
                      ref={inputRef}
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={currentTitle}
                      className={cn(
                        'absolute inset-0 box-border h-full w-full border-none px-3 py-0 leading-normal ring-0 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0',
                        isRenaming
                          ? 'cursor-not-allowed bg-transparent text-muted-foreground'
                          : 'text-foreground'
                      )}
                      style={{
                        lineHeight: '1.5',
                        fontSize: '0.875rem',
                      }}
                      disabled={isRenaming}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>

                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      disabled={isRenaming}
                      className={cn(
                        'w-20 rounded-none text-xs transition-colors',
                        isRenaming
                          ? 'cursor-not-allowed text-muted-foreground/50'
                          : 'text-foreground'
                      )}
                    >
                      cancel
                    </Button>

                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      disabled={
                        !newTitle.trim() ||
                        isRenaming ||
                        newTitle === currentTitle
                      }
                      className={cn(
                        'w-20 rounded-none text-xs transition-colors',
                        !newTitle.trim() ||
                          isRenaming ||
                          newTitle === currentTitle
                          ? 'cursor-not-allowed opacity-50'
                          : ''
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isRenaming ? 'saving...' : 'save'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
