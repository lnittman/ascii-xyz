'use client';

import { useEffect, useState } from 'react';

import { FolderSimple, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@repo/design/components/ui/button';
import { cn } from '@repo/design/lib/utils';

import { RelativeScrollFadeContainer } from '@/components/shared/relative-scroll-fade-container';
import { useUpdateChatProject } from '@/hooks/chat/mutations';
import { useChatData } from '@/hooks/chat/queries';
import { useProjects } from '@/hooks/project/queries';
import { useModals } from '@/hooks/use-modals';

interface AddToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string | null;
}

export function AddToProjectModal({
  isOpen,
  onClose,
  chatId,
}: AddToProjectModalProps) {
  const { closeAddToProjectModal } = useModals();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const { chat: chatData } = useChatData(chatId);
  const { updateChatProject } = useUpdateChatProject();
  const [isUpdating, setIsUpdating] = useState(false);
  const { projects } = useProjects();

  // Filter out projects that don't belong to the user and exclude current project
  const availableProjects =
    projects?.filter((project: any) => project.id !== chatData?.projectId) ||
    [];

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedProjectId(null);
    }
  }, [isOpen]);

  const handleBackdropClick = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!chatId || !selectedProjectId || isUpdating) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateChatProject(chatId, selectedProjectId);
      closeAddToProjectModal();
    } catch (_error) {
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveFromProject = async () => {
    if (!chatId || isUpdating) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateChatProject(chatId, null);
      closeAddToProjectModal();
    } catch (_error) {
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isUpdating) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isUpdating]);

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
          >
            <div className="flex flex-col overflow-hidden rounded-none border border-border/50 bg-background shadow-lg">
              {/* Header */}
              <div className="relative flex items-center justify-between border-b p-3">
                <h3 className="font-normal text-foreground text-sm">
                  add to project
                </h3>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-none transition-colors hover:bg-accent/50"
                  disabled={isUpdating}
                >
                  <X
                    weight="duotone"
                    className="h-4 w-4 text-muted-foreground"
                  />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {chatData?.projectId && (
                  <div className="mb-4 rounded-none border border-border/50 bg-accent/20 p-3">
                    <p className="mb-2 text-foreground text-sm">
                      this chat is currently in a project
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFromProject}
                      disabled={isUpdating}
                      className="rounded-none text-red-500 text-xs hover:bg-red-500/10 hover:text-red-600"
                    >
                      {isUpdating ? 'removing...' : 'remove from project'}
                    </Button>
                  </div>
                )}

                <p className="mb-4 text-muted-foreground text-sm">
                  choose a project to organize this chat
                </p>

                {availableProjects.length === 0 ? (
                  <div className="py-8 text-center">
                    <FolderSimple
                      weight="duotone"
                      className="mx-auto mb-3 h-12 w-12 text-muted-foreground"
                    />
                    <p className="mb-2 text-muted-foreground text-sm">
                      no projects available
                    </p>
                    <p className="text-muted-foreground text-xs">
                      create a project first to organize your chats
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Project list */}
                    <RelativeScrollFadeContainer className="mb-4 max-h-60">
                      <div className="space-y-2">
                        {availableProjects.map((project: any) => (
                          <button
                            key={project.id}
                            onClick={() => setSelectedProjectId(project.id)}
                            className={cn(
                              'w-full rounded-none border p-3 text-left transition-all duration-200',
                              selectedProjectId === project.id
                                ? 'border-accent bg-accent/20 text-foreground'
                                : 'border-border/50 text-muted-foreground hover:border-accent/50 hover:bg-accent/10 hover:text-foreground'
                            )}
                            disabled={isUpdating}
                          >
                            <div className="flex items-center gap-3">
                              <FolderSimple
                                weight="duotone"
                                className="h-5 w-5 flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-sm">
                                  {project.name}
                                </p>
                                {project.description && (
                                  <p className="mt-1 truncate text-muted-foreground text-xs">
                                    {project.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </RelativeScrollFadeContainer>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={isUpdating}
                        className="rounded-none text-foreground text-xs"
                      >
                        cancel
                      </Button>

                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!selectedProjectId || isUpdating}
                        className="rounded-none text-xs"
                      >
                        {isUpdating ? 'adding...' : 'add to project'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
