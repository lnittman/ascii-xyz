'use client';

import { attachmentModalAtom } from '@/atoms/layout/modal';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import {
  ArrowsOut,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
} from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { cn } from '@repo/design/lib/utils';
import { useAtom } from 'jotai';
import React, { useState } from 'react';

export function MobileImagePreviewSheet() {
  const { isMobile } = useIsMobile();
  const [attachmentModal, setAttachmentModal] = useAtom(attachmentModalAtom);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const isOpen =
    attachmentModal.open &&
    attachmentModal.attachmentType === 'image' &&
    isMobile;

  // Reset state after sheet has closed
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

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Touch handlers for drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1 && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      setTouchStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoom > 1 && e.touches.length === 1) {
      e.preventDefault(); // Prevent scrolling
      const touch = e.touches[0];
      const newX = touch.clientX - touchStart.x;
      const newY = touch.clientY - touchStart.y;

      requestAnimationFrame(() => {
        setPosition({ x: newX, y: newY });
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse handlers for desktop dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      e.preventDefault();
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      e.preventDefault();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      requestAnimationFrame(() => {
        setPosition({ x: newX, y: newY });
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const title = (attachmentModal.metadata?.name as string) || 'image preview';

  return (
    <MobileSheet
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      contentHeight="fill"
      customHeader={false}
      position="bottom"
    >
      <div className="flex h-full flex-col">
        {/* Image container */}
        <div className="relative flex-1 overflow-hidden bg-muted/10">
          <div
            className={cn(
              'flex h-full w-full select-none items-center justify-center',
              zoom > 1 && 'touch-none',
              isDragging && 'cursor-grabbing',
              zoom > 1 && !isDragging && 'cursor-grab'
            )}
            style={{ touchAction: zoom > 1 ? 'none' : 'auto' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="relative"
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transition: isDragging
                  ? 'none'
                  : 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            >
              <img
                src={attachmentModal.metadata?.url as string}
                alt={(attachmentModal.metadata?.name as string) || 'Preview'}
                className="pointer-events-none max-h-[60vh] max-w-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="border-border/50 border-t p-4">
          {/* Zoom controls - full width */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="h-12 w-12 rounded-none"
            >
              <MagnifyingGlassMinus weight="duotone" className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              onClick={handleResetZoom}
              className="h-12 min-w-[80px] rounded-none px-4 font-mono text-sm"
            >
              {Math.round(zoom * 100)}%
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="h-12 w-12 rounded-none"
            >
              <MagnifyingGlassPlus weight="duotone" className="h-5 w-5" />
            </Button>

            <div className="mx-1 h-8 w-px bg-border/50" />

            <Button
              variant="outline"
              size="icon"
              onClick={handleResetZoom}
              className="h-12 w-12 rounded-none"
            >
              <ArrowsOut weight="duotone" className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </MobileSheet>
  );
}
