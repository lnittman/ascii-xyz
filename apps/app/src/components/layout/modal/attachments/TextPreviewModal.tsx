'use client';

import { Check, Copy, Download, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import React, { useEffect } from 'react';

import { Button } from '@repo/design/components/ui/button';

import { attachmentModalAtom } from '@/atoms/layout/modal';
import { RelativeScrollFadeContainer } from '@/components/shared/relative-scroll-fade-container';

export function TextPreviewModal() {
  const [attachmentModal, setAttachmentModal] = useAtom(attachmentModalAtom);
  const [isCopied, setIsCopied] = React.useState(false);

  // Only show if the modal is open and it's a text attachment
  const isVisible =
    attachmentModal.open && attachmentModal.attachmentType === 'text';

  const handleClose = () => {
    setAttachmentModal((prev) => ({ ...prev, open: false }));
  };

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleDownload = () => {
    const content = attachmentModal.metadata?.content as string;
    if (!content) {
      return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = (attachmentModal.metadata?.name as string) || 'text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const content = attachmentModal.metadata?.content as string;
    if (!content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (_err) {}
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[500]">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          />

          {/* Modal content */}
          <motion.div
            className="fixed inset-0 z-10 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-none border border-border/50 bg-background shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-border/50 border-b p-3">
                <h3 className="font-medium text-foreground text-sm">
                  {(attachmentModal.metadata?.name as string) || 'Text Preview'}
                </h3>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-none"
                    onClick={handleCopy}
                  >
                    {isCopied ? (
                      <Check
                        weight="duotone"
                        className="h-4 w-4 text-green-500"
                      />
                    ) : (
                      <Copy
                        weight="duotone"
                        className="h-4 w-4 text-muted-foreground"
                      />
                    )}
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-none"
                    onClick={handleDownload}
                  >
                    <Download
                      weight="duotone"
                      className="h-4 w-4 text-muted-foreground"
                    />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-none"
                    onClick={handleClose}
                  >
                    <X
                      weight="duotone"
                      className="h-4 w-4 text-muted-foreground"
                    />
                  </Button>
                </div>
              </div>

              {/* Text content */}
              <RelativeScrollFadeContainer
                className="flex-1"
                fadeColor="var(--muted/30)"
              >
                <div className="bg-muted/30 p-4">
                  <pre className="whitespace-pre-wrap font-mono text-foreground text-sm">
                    {(attachmentModal.metadata?.content as string) || ''}
                  </pre>
                </div>
              </RelativeScrollFadeContainer>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
