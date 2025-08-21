import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { Check, PencilSimple } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';

import { Button } from '@repo/design/components/ui/button';
import { cn } from '@repo/design/lib/utils';

import { currentProjectAtom } from '@/atoms/project';
import { useProjectMutations } from '@/hooks/project/mutations';
import { useProject } from '@/hooks/project/queries';

export function ProjectName() {
  // Get initial data from Jotai atom for immediate rendering
  const [currentProject] = useAtom(currentProjectAtom);
  const projectId = currentProject?.id || null;

  // Keep existing SWR query for fetching project data
  const { data: projectFromApi, mutate: mutateProject } = useProject(projectId);

  // Use the consolidated mutation hook for update operation
  const { updateAndInvalidate, isUpdating, updateError } =
    useProjectMutations();

  // Prioritize the currently selected project from atom if it matches the ID
  // or use API data when it becomes available
  const useCurrentProject = currentProject && currentProject.id === projectId;
  const project = useCurrentProject ? currentProject : projectFromApi;

  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // Update input when project data changes - prioritize faster state updates
  useEffect(() => {
    if (project) {
      setNameInput(project.name || '');
    }
  }, [project]);

  // Initial loading state
  if (!project) {
    // Show a skeleton loader for the name while data is loading
    return (
      <div className="flex w-full items-center justify-between">
        <div className="relative flex-grow">
          <div className="h-8 w-3/4 animate-pulse bg-accent/30" />
        </div>
      </div>
    );
  }

  // Start editing and focus the input
  const startEditing = () => {
    setIsEditing(true);

    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        const length = nameInputRef.current.value.length;
        nameInputRef.current.setSelectionRange(length, length);
      }
    }, 10);
  };

  // Save the updated project name using the mutation hook
  const saveProjectName = async () => {
    const trimmedName = nameInput.trim();
    if (!trimmedName || trimmedName === project?.name || isUpdating) {
      setIsEditing(false);
      if (trimmedName !== project?.name) {
        setNameInput(project?.name || ''); // Revert if invalid/unchanged
      }
      return;
    }

    try {
      const success = await updateAndInvalidate(projectId!, trimmedName);
      if (success) {
        // Manually trigger revalidation if needed after successful update
        mutateProject();
      } else {
        setNameInput(project?.name || '');
      }
    } finally {
      setIsEditing(false);
    }
  };

  // Handle key presses in the name input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveProjectName();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNameInput(project?.name || '');
    }
  };

  return (
    <div className="flex w-full items-center justify-between">
      <div className="relative flex-grow">
        <input
          ref={nameInputRef}
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Save on blur only if editing was active
            if (isEditing) {
              saveProjectName();
            }
          }}
          disabled={!isEditing || isUpdating} // Disable during update
          className={cn(
            'w-full border-none bg-transparent font-medium text-2xl text-foreground outline-none focus:outline-none focus:ring-0',
            isEditing ? 'cursor-text' : 'cursor-default'
          )}
          style={{ caretColor: isEditing ? 'auto' : 'transparent' }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
      >
        <Button
          variant="outline"
          size="icon"
          className="ml-2 h-8 w-8 rounded-none text-muted-foreground transition-colors duration-200 hover:bg-muted-foreground/10 hover:text-foreground"
          onClick={isEditing ? saveProjectName : startEditing}
          aria-label={isEditing ? 'Save project name' : 'Edit project name'}
          disabled={isUpdating} // Disable button during update
        >
          <AnimatePresence mode="wait" initial={false}>
            {isEditing ? (
              <motion.div
                key="check"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeInOut',
                }}
              >
                {/* Show spinner if updating */}
                {isUpdating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Check weight="duotone" className="h-4 w-4" />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="pencil"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.2,
                  ease: 'easeInOut',
                }}
              >
                <PencilSimple weight="duotone" className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
}
