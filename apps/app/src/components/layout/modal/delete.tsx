'use client';

import { useEffect, useState } from 'react';

import { X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { Button } from '@repo/design/components/ui/button';

import { useDeleteChat } from '@/hooks/chat/mutations';
import { useChatData } from '@/hooks/chat/queries';
import { useProjectMutations } from '@/hooks/project/mutations';
import { useProject, useProjects } from '@/hooks/project/queries';
import { useModals } from '@/hooks/use-modals';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  itemType?: 'chat' | 'project';
}

export function DeleteModal({
  isOpen,
  onClose,
  itemId,
  itemType = 'chat',
}: DeleteModalProps) {
  const router = useRouter();
  const { closeDeleteModal } = useModals();
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset processing state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset the state when modal closes
      setIsProcessing(false);
    }
  }, [isOpen]);

  const { chat: chatData } = useChatData(itemType === 'chat' ? itemId : null);
  const { data: projectData } = useProject(
    itemType === 'project' ? itemId : null
  );
  const { deleteChat } = useDeleteChat();
  const { mutate: mutateProjects } = useProjects();
  const { deleteProject } = useProjectMutations();

  const isDeleting = isProcessing;
  const title =
    itemType === 'project'
      ? projectData?.name || 'this project'
      : chatData?.title || 'this chat';

  const handleConfirm = async () => {
    if (!itemId) {
      return;
    }

    try {
      setIsProcessing(true);

      if (itemType === 'project') {
        await deleteProject({ id: itemId });
      } else {
        await deleteChat(itemId);

        if (window.location.pathname.includes(`/c/${itemId}`)) {
          router.push('/');
        }
      }

      await mutateProjects();
      closeDeleteModal();
    } catch (_error) {
      setIsProcessing(false);
    }
  };

  const handleBackdropClick = () => {
    if (!isDeleting) {
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
                  delete {itemType}?
                </h3>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-none transition-colors hover:bg-accent/50"
                  disabled={isDeleting}
                >
                  <X
                    weight="duotone"
                    className="h-4 w-4 text-muted-foreground"
                  />
                </button>
              </div>

              <div className="p-4">
                <p className="mb-4 text-foreground text-sm">
                  this will delete <span className="font-medium">{title}</span>.
                </p>

                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    disabled={isDeleting}
                    className="w-24 rounded-none text-xs"
                  >
                    cancel
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleConfirm}
                    disabled={isDeleting}
                    className="w-24 rounded-none font-medium text-xs"
                  >
                    {isDeleting ? 'deleting...' : 'delete'}
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
