'use client';

import {
  ArrowsOut,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  X,
} from '@phosphor-icons/react';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { cn } from '@repo/design/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import React, { useEffect } from 'react';

import { attachmentModalAtom } from '@/atoms/layout/modal';

export function ImagePreviewModal() {
  const { isMobile } = useIsMobile();
  const [attachmentModal, setAttachmentModal] = useAtom(attachmentModalAtom);
  const [zoom, setZoom] = React.useState(1);
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const imageRef = React.useRef<HTMLImageElement>(null);

  // Only show if the modal is open, it's an image, and we're NOT on mobile
  const isVisible =
    attachmentModal.open &&
    attachmentModal.attachmentType === 'image' &&
    !isMobile;

  // Reset state after modal has closed
  React.useEffect(() => {
    if (!attachmentModal.open) {
      // Small delay to ensure animation completes before reset
      const timer = setTimeout(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [attachmentModal.open]);

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

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Drag handlers
  const handleDragStart = (_e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      setIsDragging(true);
    }
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && zoom > 1) {
      e.preventDefault();
      requestAnimationFrame(() => {
        setPosition((prev) => ({
          x: prev.x + e.movementX,
          y: prev.y + e.movementY,
        }));
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[400]">
          <motion.div
            className="fixed inset-0 bg-background/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          <motion.div
            className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 max-h-[85vh] w-full max-w-5xl transform"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex h-full flex-col overflow-hidden rounded-none border border-border/50 bg-background shadow-lg">
              <div className="relative flex items-center justify-between border-b p-3">
                <h3 className="font-normal text-foreground text-sm">
                  {(attachmentModal.metadata?.name as string) ||
                    'image preview'}
                </h3>
                <button
                  onClick={handleClose}
                  className="flex h-7 w-7 items-center justify-center rounded-none transition-colors hover:bg-accent/50"
                >
                  <X
                    weight="duotone"
                    className="h-4 w-4 text-muted-foreground"
                  />
                </button>
              </div>

              <div className="relative flex-1 overflow-hidden bg-muted/20">
                {/* Image container */}
                <div
                  className={cn(
                    'flex h-full w-full select-none items-center justify-center',
                    isDragging
                      ? 'cursor-grabbing'
                      : zoom > 1
                        ? 'cursor-grab'
                        : 'cursor-default'
                  )}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                >
                  <div
                    className="relative"
                    style={{
                      transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                      transition: isDragging
                        ? 'none'
                        : 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      willChange: 'transform',
                    }}
                  >
                    <img
                      ref={imageRef}
                      src={attachmentModal.metadata?.url as string}
                      alt={
                        (attachmentModal.metadata?.name as string) || 'Preview'
                      }
                      className="pointer-events-none max-h-[calc(85vh-120px)] max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* Zoom controls */}
                <div className="-translate-x-1/2 absolute bottom-4 left-1/2 flex items-center gap-1 rounded-none border border-border/50 bg-background/90 p-1 backdrop-blur-sm">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.25}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-none transition-colors hover:bg-accent/50',
                      zoom <= 0.25 && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <MagnifyingGlassMinus
                      weight="duotone"
                      className="h-4 w-4 text-muted-foreground"
                    />
                  </button>

                  <button
                    onClick={handleResetZoom}
                    className="flex h-8 items-center justify-center rounded-none px-3 font-mono text-muted-foreground text-xs transition-colors hover:bg-accent/50"
                  >
                    {Math.round(zoom * 100)}%
                  </button>

                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-none transition-colors hover:bg-accent/50',
                      zoom >= 3 && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <MagnifyingGlassPlus
                      weight="duotone"
                      className="h-4 w-4 text-muted-foreground"
                    />
                  </button>

                  <div className="mx-1 h-5 w-px bg-border/50" />

                  <button
                    onClick={handleResetZoom}
                    className="flex h-8 w-8 items-center justify-center rounded-none transition-colors hover:bg-accent/50"
                  >
                    <ArrowsOut
                      weight="duotone"
                      className="h-4 w-4 text-muted-foreground"
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
