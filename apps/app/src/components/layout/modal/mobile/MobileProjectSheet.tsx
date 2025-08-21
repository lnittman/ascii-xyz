'use client';

import { mobileProjectModalOpenAtom } from '@/atoms/mobile-menus';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import { useProjectMutations } from '@/hooks/project/mutations';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { useAtom } from 'jotai';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

export function MobileProjectSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileProjectModalOpenAtom);
  const [projectName, setProjectName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { createAndNavigate, isCreating, createError } = useProjectMutations();

  const handleClose = () => {
    setIsOpen(false);
    setProjectName('');
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim() || isCreating) {
      return;
    }

    const newProjectId = await createAndNavigate(projectName.trim());

    if (newProjectId) {
      setProjectName('');
      handleClose();
    } else {
    }
  };

  return (
    <MobileSheet isOpen={isOpen} onClose={handleClose} title="create project">
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        {/* Content area - takes up available space */}
        <div className="flex-1 space-y-4 p-4">
          <div>
            <Input
              ref={inputRef}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. birthday party planning"
              disabled={isCreating}
              className="rounded-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Info section */}
          <div className="rounded-none bg-accent/30 p-3">
            <div className="flex items-start gap-2">
              <div className="font-semibold text-foreground text-xs">
                what's a project?
              </div>
            </div>
            <p className="mt-1 text-muted-foreground text-xs">
              projects keep chats, files, and custom instructions in one place.
              use them for ongoing work, or just to keep things tidy.
            </p>
          </div>
        </div>

        {/* Bottom action buttons */}
        <div className="border-border border-t p-4">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 rounded-none text-foreground text-xs"
            >
              cancel
            </Button>
            <Button
              type="submit"
              variant="fm"
              disabled={isCreating || !projectName.trim()}
              className="flex-1 rounded-none text-xs"
            >
              {isCreating ? 'creating...' : 'create project'}
            </Button>
          </div>
        </div>
      </form>
    </MobileSheet>
  );
}
