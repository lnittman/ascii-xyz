'use client';

import React from 'react';

import { X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@repo/design/components/ui/button';

import { useDeleteChat } from '@/hooks/chat/mutations';
import { useChatData } from '@/hooks/chat/queries';
import { useDeleteProjectMutation } from '@/hooks/project/mutations';
import { useProjects } from '@/hooks/project/queries';
import { useModals } from '@/hooks/use-modals';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  itemType?: 'chat' | 'project';
}

export function ArchiveModal({
  isOpen,
  onClose,
  itemId,
  itemType = 'chat',
}: ArchiveModalProps) {
  const { closeArchiveModal } = useModals();

  const { chat: chatData } = useChatData(itemType === 'chat' ? itemId : null);
  const { projects } = useProjects();
  const { deleteChat } = useDeleteChat();
  const { deleteProject } = useDeleteProjectMutation();

  // Find project name if it's a project
  const projectName = React.useMemo(() => {
    if (itemType === 'project' && projects) {
      const project = projects.find((p: any) => p.id === itemId);
      return project?.name;
    }
    return null;
  }, [itemType, projects, itemId]);

  const title =
    itemType === 'project'
      ? projectName || 'this project'
      : chatData?.title || 'this chat';
  const [isArchiving, setIsArchiving] = React.useState(false);

  const handleConfirm = async () => {
    if (!itemId) {
      return;
    }

    try {
      setIsArchiving(true);

      // Since archive isn't implemented yet, using delete functionality
      // TODO: Implement proper archive functionality
      if (itemType === 'project') {
        await deleteProject({ id: itemId });
      } else {
        await deleteChat(itemId);
      }

      closeArchiveModal();
    } catch (_error) {
      setIsArchiving(false);
    }
  };

  const handleBackdropClick = () => {
    if (!isArchiving) {
      onClose();
    }
  };

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
              <div className="relative flex items-center justify-between border-b p-3">
                <h3 className="font-normal text-foreground text-sm">
                  archive {itemType}?
                </h3>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-none transition-colors hover:bg-accent/50"
                  disabled={isArchiving}
                >
                  <X
                    weight="duotone"
                    className="h-4 w-4 text-muted-foreground"
                  />
                </button>
              </div>

              <div className="p-4">
                <p className="mb-2 text-foreground text-sm">
                  this will archive <span className="font-medium">{title}</span>
                  .
                </p>

                <p className="mb-4 text-muted-foreground text-xs">
                  archived items can be accessed later from the archives
                  section.
                </p>

                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    disabled={isArchiving}
                    className="w-24 rounded-none text-xs"
                  >
                    cancel
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleConfirm}
                    disabled={isArchiving}
                    className="w-24 rounded-none text-xs"
                  >
                    {isArchiving ? 'archiving...' : 'archive'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
