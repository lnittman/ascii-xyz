'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';

import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';

import { projectModalOpenAtom } from '@/atoms/layout/modal';
import { useProjectMutations } from '@/hooks/project/mutations';

export function ProjectModal() {
  const { createAndNavigate, isCreating, createError } = useProjectMutations();

  const [isOpen, setIsOpen] = useAtom(projectModalOpenAtom);

  const inputRef = useRef<HTMLInputElement>(null);

  const [projectName, setProjectName] = useState('');

  const onClose = () => setIsOpen(false);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle creating a project
  const handleCreateProject = async () => {
    if (!projectName.trim() || isCreating) {
      return;
    }

    const newProjectId = await createAndNavigate(projectName.trim());

    if (newProjectId) {
      setProjectName('');
      onClose();
    } else {
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateProject();
  };

  // Handle backdrop click
  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400]">
          {/* Backdrop with blur */}
          <motion.div
            className="fixed inset-0 bg-background/60 backdrop-blur-md"
            onClick={handleBackdropClick}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal dialog */}
          <motion.div
            className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 w-full max-w-md transform"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col overflow-hidden rounded-none border border-border/50 bg-background shadow-lg">
              {/* Header with close button */}
              <div className="relative flex items-center justify-between border-b p-3">
                <h3 className="font-normal text-foreground text-sm">
                  project name
                </h3>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-none transition-colors hover:bg-accent/50"
                >
                  <X
                    weight="duotone"
                    className="h-4 w-4 text-muted-foreground"
                  />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-3 py-4">
                <div className="mb-6">
                  <Input
                    ref={inputRef}
                    type="text"
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. birthday party planning"
                    className="w-full rounded-none border-input/50 text-foreground focus:border-input"
                  />
                </div>

                {/* Info text */}
                <div className="mb-5 rounded-none bg-accent/30 p-3">
                  <div className="flex items-start gap-2">
                    <div className="font-semibold text-foreground text-xs">
                      what's a project?
                    </div>
                  </div>
                  <p className="mt-1 text-muted-foreground text-xs">
                    projects keep chats, files, and custom instructions in one
                    place. use them for ongoing work, or just to keep things
                    tidy.
                  </p>
                </div>

                {/* Button row */}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="rounded-none text-foreground text-xs"
                  >
                    cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="fm"
                    size="sm"
                    disabled={!projectName.trim() || isCreating}
                    className="rounded-none text-xs"
                  >
                    {isCreating ? 'creating...' : 'create project'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
