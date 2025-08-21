'use client';

import { useEffect, useState } from 'react';

import { ChatCircleText, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@repo/design/components/ui/button';
import { Textarea } from '@repo/design/components/ui/textarea';

import { RelativeScrollFadeContainer } from '@/components/shared/relative-scroll-fade-container';
import { useProjectMutations } from '@/hooks/project/mutations';
import { useProject } from '@/hooks/project/queries';
import { useModals } from '@/hooks/use-modals';

interface ProjectInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
}

export function ProjectInstructionsModal({
  isOpen,
  onClose,
  projectId,
}: ProjectInstructionsModalProps) {
  const { closeProjectInstructionsModal } = useModals();
  const [instructions, setInstructions] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const { data: project } = useProject(projectId);
  const { updateProjectInstructions, isUpdating } = useProjectMutations();

  // Initialize instructions from project data
  useEffect(() => {
    if (project?.instructions) {
      setInstructions(project.instructions);
      setHasChanges(false);
    } else {
      setInstructions('');
      setHasChanges(false);
    }
  }, [project?.instructions]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isUpdating) {
        closeProjectInstructionsModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isUpdating, closeProjectInstructionsModal]);

  const handleInstructionsChange = (value: string) => {
    setInstructions(value);
    setHasChanges(value !== (project?.instructions || ''));
  };

  const handleSave = async () => {
    if (!projectId || !hasChanges || isUpdating) {
      return;
    }

    try {
      await updateProjectInstructions({ id: projectId, instructions });
      setHasChanges(false);
    } catch (_error) {}
  };

  const handleCancel = () => {
    // Reset to original value
    setInstructions(project?.instructions || '');
    setHasChanges(false);
    closeProjectInstructionsModal();
  };

  const handleBackdropClick = () => {
    if (!isUpdating) {
      closeProjectInstructionsModal();
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
            className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 max-h-[80vh] w-full max-w-2xl transform"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col overflow-hidden rounded-none border border-border/50 bg-background shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                  <ChatCircleText
                    weight="duotone"
                    className="h-5 w-5 text-muted-foreground"
                  />
                  <h3 className="font-medium text-foreground text-sm">
                    project instructions
                  </h3>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={closeProjectInstructionsModal}
                  className="h-8 w-8 rounded-none"
                  disabled={isUpdating}
                >
                  <X weight="duotone" className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <RelativeScrollFadeContainer className="flex-1">
                <div className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-medium text-foreground text-sm">
                        how can the assistant best help you with this project?
                      </h4>
                      <p className="mb-4 text-muted-foreground text-xs">
                        you can ask the assistant to focus on certain topics, or
                        ask it to use a certain tone or format for responses.
                      </p>
                    </div>

                    <Textarea
                      value={instructions}
                      onChange={(e) => handleInstructionsChange(e.target.value)}
                      placeholder='e.g. "respond in spanish. reference the latest javascript documentation. keep answers short and focused."'
                      className="min-h-[300px] resize-none rounded-none text-foreground placeholder:text-muted-foreground"
                      disabled={isUpdating}
                      spellCheck={false}
                    />

                    <div className="text-muted-foreground text-xs">
                      {instructions.length}/2000 characters
                    </div>
                  </div>
                </div>
              </RelativeScrollFadeContainer>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t p-4">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="rounded-none"
                >
                  cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleSave}
                  disabled={!hasChanges || isUpdating}
                  className="rounded-none"
                >
                  {isUpdating ? 'saving...' : 'save'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
