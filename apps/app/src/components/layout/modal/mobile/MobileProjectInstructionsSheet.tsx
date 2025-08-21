'use client';

import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';

import {
  mobileProjectInstructionsModalOpenAtom,
  mobileProjectInstructionsModalStateAtom,
} from '@/atoms/mobile-menus';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import { useProjectMutations } from '@/hooks/project/mutations';
import { useProject } from '@/hooks/project/queries';
import { Button } from '@repo/design/components/ui/button';
import { Textarea } from '@repo/design/components/ui/textarea';

export function MobileProjectInstructionsSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileProjectInstructionsModalOpenAtom);
  const [modalState] = useAtom(mobileProjectInstructionsModalStateAtom);
  const [instructions, setInstructions] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const { data: project } = useProject(modalState.projectId);
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

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleInstructionsChange = (value: string) => {
    setInstructions(value);
    setHasChanges(value !== (project?.instructions || ''));
  };

  const handleSave = async () => {
    if (!modalState.projectId || !hasChanges || isUpdating) {
      return;
    }

    try {
      await updateProjectInstructions({
        id: modalState.projectId,
        instructions,
      });
      setHasChanges(false);
    } catch (_error) {}
  };

  const handleCancel = () => {
    // Reset to original value
    setInstructions(project?.instructions || '');
    setHasChanges(false);
    handleClose();
  };

  return (
    <MobileSheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="Project Instructions"
      contentHeight="fill"
    >
      <div className="flex h-full flex-col">
        {/* Content area - takes up available space */}
        <div className="flex flex-1 flex-col p-4">
          <p className="mb-3 text-muted-foreground text-sm">
            provide context and guidelines for how elysian should behave in this
            project.
          </p>

          <Textarea
            value={instructions}
            onChange={(e) => handleInstructionsChange(e.target.value)}
            placeholder="e.g., you are a helpful assistant working on a react project. always use typescript and follow best practices..."
            className="flex-1 resize-none rounded-none text-foreground placeholder:text-muted-foreground"
            disabled={isUpdating}
          />
        </div>

        {/* Bottom action buttons */}
        <div className="border-border border-t p-4">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={isUpdating}
              className="flex-1 rounded-none text-foreground text-xs"
            >
              cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdating || !hasChanges}
              className="flex-1 rounded-none text-xs"
            >
              {isUpdating ? 'saving...' : 'save instructions'}
            </Button>
          </div>
        </div>
      </div>
    </MobileSheet>
  );
}
