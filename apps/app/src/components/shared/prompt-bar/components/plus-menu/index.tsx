'use client';

import { useAtom } from 'jotai';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { Plus } from '@phosphor-icons/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@repo/design/components/ui/button';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { cn } from '@repo/design/lib/utils';

import {
  mobilePlusMenuHandlersAtom,
  mobilePlusMenuOpenAtom,
} from '@/atoms/mobile-menus';
import type { Attachment } from '../attachment-row';
import { ManageToolsButton } from './components/manage-tools-button';
import { ScreenshotButton } from './components/screenshot-button';
import { UploadFileButton } from './components/upload-file-button';

interface PlusMenuProps {
  disabled?: boolean;
  onFileSelect?: (files: FileList) => void;
  onScreenshotCapture?: (attachment: Attachment) => void;
}

export function PlusMenu({
  disabled = false,
  onFileSelect,
  onScreenshotCapture,
}: PlusMenuProps) {
  const { isMobile } = useIsMobile();
  const [, setMobilePlusMenuOpen] = useAtom(mobilePlusMenuOpenAtom);
  const [, setMobilePlusMenuHandlers] = useAtom(mobilePlusMenuHandlersAtom);
  const [isHovering, setIsHovering] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showHoverEffect, setShowHoverEffect] = useState(false);

  // Set handlers for mobile sheet when component mounts or handlers change
  useEffect(() => {
    setMobilePlusMenuHandlers({ onFileSelect, onScreenshotCapture });
  }, [onFileSelect, onScreenshotCapture, setMobilePlusMenuHandlers]);

  useEffect(() => {
    if (isOpen) {
      setShowHoverEffect(true);
    } else if (!isHovering) {
      setShowHoverEffect(false);
    }
  }, [isOpen, isHovering]);

  const handleFileSelection = useCallback(
    (files: FileList) => {
      if (onFileSelect && files.length > 0) {
        onFileSelect(files);
        // Keep the menu open briefly to provide visual feedback before closing
        setTimeout(() => setIsOpen(false), 100);
      }
    },
    [onFileSelect]
  );

  const handleScreenshotCapture = useCallback(
    (attachment: Attachment) => {
      if (onScreenshotCapture) {
        onScreenshotCapture(attachment);
        setIsOpen(false);
      }
    },
    [onScreenshotCapture]
  );

  const handleOpenMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMobilePlusMenuOpen(true);
  };

  // --- Conditional Rendering Logic ---
  if (isMobile) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-none border text-muted-foreground transition-all duration-300',
          'border-border/60 bg-muted/40 hover:border-border hover:bg-muted hover:text-foreground'
        )}
        disabled={disabled}
        onClick={handleOpenMobileMenu}
      >
        <Plus weight="duotone" className="h-4 w-4" />
      </Button>
    );
  }

  // --- Desktop Dropdown (existing logic) ---
  return (
    <DropdownMenuPrimitive.Root onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-none border text-muted-foreground transition-all duration-300',
            showHoverEffect
              ? 'border-border bg-muted'
              : 'border-border/60 bg-muted/40 hover:border-border hover:bg-muted hover:text-foreground'
          )}
          disabled={disabled}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Plus
            weight="duotone"
            className={`h-4 w-4 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-45' : 'rotate-0'}`}
          />
        </Button>
      </DropdownMenuPrimitive.Trigger>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenuPrimitive.Portal forceMount>
            <DropdownMenuPrimitive.Content
              asChild
              side="bottom"
              align="start"
              alignOffset={0}
              sideOffset={8}
              onCloseAutoFocus={(event) => {
                // Prevent focusing back on the trigger when clicking file input
                event.preventDefault();
              }}
            >
              <motion.div
                className="z-50 min-w-[180px] space-y-1 overflow-hidden rounded-none border border-border/20 border-border/60 bg-popover/95 p-1 shadow-md backdrop-blur-sm"
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{
                  duration: 0.2,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                <UploadFileButton onFileSelect={handleFileSelection} />
                <ScreenshotButton
                  onScreenshotCapture={handleScreenshotCapture}
                />
                <ManageToolsButton />
              </motion.div>
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        )}
      </AnimatePresence>
    </DropdownMenuPrimitive.Root>
  );
}
