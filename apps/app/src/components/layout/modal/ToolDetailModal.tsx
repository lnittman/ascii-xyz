'use client';

import { useEffect, useRef } from 'react';

import { X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@repo/design/components/ui/button';
import { cn } from '@repo/design/lib/utils';

interface ToolDetailModalProps {
  isOpen: boolean;
  toolArgs: Record<string, any>;
  toolName: string;
  toolResult?: any;
  onClose: () => void;
}

export function ToolDetailModal({
  isOpen,
  toolArgs,
  toolName,
  toolResult,
  onClose,
}: ToolDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Handle backdrop click
  const handleBackdropClick = () => {
    onClose();
  };

  // Format JSON for display
  const formatJSON = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (_error) {
      return String(data);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
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
            ref={modalRef}
          >
            <div className="flex flex-col overflow-hidden rounded-none border border-border/50 bg-background shadow-lg">
              {/* Header with close button */}
              <div className="relative flex items-center justify-between border-b p-3">
                <h3 className="font-normal text-foreground text-sm">
                  tool details: {toolName}
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

              {/* Content */}
              <div className="p-4">
                <div className="space-y-4">
                  {/* Tool name */}
                  <div>
                    <h4 className="mb-1 text-muted-foreground text-xs">
                      tool name
                    </h4>
                    <div className="rounded-none bg-accent/20 p-2 font-mono text-foreground text-sm">
                      {toolName}
                    </div>
                  </div>

                  {/* Tool arguments */}
                  <div>
                    <h4 className="mb-1 text-muted-foreground text-xs">
                      arguments
                    </h4>
                    <pre
                      className={cn(
                        'overflow-auto rounded-none bg-accent/20 p-2 font-mono text-foreground text-sm',
                        'max-h-[150px]'
                      )}
                    >
                      {formatJSON(toolArgs)}
                    </pre>
                  </div>

                  {/* Tool result (if available) */}
                  {toolResult && (
                    <div>
                      <h4 className="mb-1 text-muted-foreground text-xs">
                        result
                      </h4>
                      <pre
                        className={cn(
                          'overflow-auto rounded-none bg-accent/20 p-2 font-mono text-foreground text-sm',
                          'max-h-[150px]'
                        )}
                      >
                        {formatJSON(toolResult)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Button row */}
                <div className="mt-6 flex justify-end">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={onClose}
                    className="rounded-none text-xs"
                  >
                    close
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
