'use client';

import { avatarUploadModalAtom } from '@/atoms/layout/modal';
import { toast } from '@/components/shared/ui/custom-toast';
import { useUser } from '@clerk/nextjs';
import {
  ArrowsIn,
  ArrowsOut,
  Minus,
  Plus,
  X,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@repo/design/components/ui/button';
import { cn } from '@repo/design/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface AvatarUploadModalProps {
  onAvatarUpdate?: () => void;
}

export function AvatarUploadModal({
  onAvatarUpdate,
}: AvatarUploadModalProps = {}) {
  const [modal, setModal] = useAtom(avatarUploadModalAtom);
  const { user } = useUser();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load image when file changes
  useEffect(() => {
    if (modal.file && modal.open) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
        // Reset crop controls
        setScale(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(modal.file);
    } else if (!modal.open) {
      // Reset when modal closes
      setPreviewUrl(null);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [modal.file, modal.open]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  // Wheel zoom support
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    const zoomSpeed = 0.1;

    if (delta > 0) {
      // Zoom out
      setScale((prev) => Math.max(prev - zoomSpeed, 0.5));
    } else {
      // Zoom in
      setScale((prev) => Math.min(prev + zoomSpeed, 3));
    }
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleFitToFrame = () => {
    // Calculate scale to fit image in crop area
    if (imageRef.current) {
      const img = imageRef.current;
      const cropSize = 256; // 256px crop area
      const scaleX = cropSize / img.naturalWidth;
      const scaleY = cropSize / img.naturalHeight;
      const fitScale = Math.min(scaleX, scaleY);
      setScale(fitScale);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const getCroppedImageBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!canvasRef.current || !imageRef.current) {
        resolve(null);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      const img = imageRef.current;
      const cropSize = 256;

      // Set canvas size to desired output size
      canvas.width = cropSize;
      canvas.height = cropSize;

      // Calculate the source rectangle to crop from the original image
      const centerX = img.naturalWidth / 2;
      const centerY = img.naturalHeight / 2;
      const sourceSize = Math.min(img.naturalWidth, img.naturalHeight) / scale;
      const sourceX = centerX - sourceSize / 2 - position.x / scale;
      const sourceY = centerY - sourceSize / 2 - position.y / scale;

      // Draw the cropped image
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        cropSize,
        cropSize
      );

      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });
  };

  const handleUpload = async () => {
    if (!modal.file || !previewUrl || !user) {
      return;
    }

    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImageBlob();
      if (!croppedBlob) {
        throw new Error('failed to process image');
      }

      // Convert blob to file for Clerk upload
      const croppedFile = new File([croppedBlob], 'avatar.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Use Clerk's setProfileImage method
      await user.setProfileImage({ file: croppedFile });

      // Notify parent component that upload is complete
      onAvatarUpdate?.();

      toast.success('avatar updated successfully');
      handleClose();
    } catch (_error) {
      toast.error('failed to update avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setModal({ open: false, file: null });
  };

  return (
    <AnimatePresence>
      {modal.open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/20 backdrop-blur-[8px]"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full max-w-lg"
          >
            <div className="rounded-none border border-border bg-background shadow-2xl">
              {/* Header */}
              <div className="border-border border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground text-sm">
                    change avatar
                  </span>
                  <button
                    onClick={handleClose}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-none transition-all duration-200',
                      'border border-border bg-background text-muted-foreground',
                      'hover:border-accent hover:bg-accent hover:text-accent-foreground',
                      'focus:outline-none'
                    )}
                    aria-label="close"
                  >
                    <X className="h-4 w-4" weight="duotone" />
                  </button>
                </div>
              </div>

              {/* Image crop area */}
              <div className="p-6 pb-4">
                <div className="flex flex-col items-center space-y-4">
                  {previewUrl && (
                    <div className="relative">
                      {/* Crop viewport */}
                      <div
                        className="relative h-64 w-64 cursor-move touch-none select-none overflow-hidden border-2 border-border bg-muted"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onWheel={handleWheel}
                      >
                        <img
                          ref={imageRef}
                          src={previewUrl}
                          alt="Avatar preview"
                          className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain transition-transform duration-150 ease-out"
                          style={{
                            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                            transformOrigin: 'center center',
                          }}
                          draggable={false}
                        />
                        {/* Crop overlay */}
                        <div className="pointer-events-none absolute inset-0 border-2 border-foreground/20" />

                        {/* Center cross indicator when dragging */}
                        {isDragging && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="h-6 w-6">
                              <div className="-translate-y-1/2 absolute top-1/2 h-0.5 w-full bg-white/60" />
                              <div className="-translate-x-1/2 absolute left-1/2 h-full w-0.5 bg-white/60" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hidden canvas for cropping */}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}

                  {/* Crop controls */}
                  <div className="flex items-center gap-2 rounded-none border border-border bg-muted/50 p-2">
                    <button
                      onClick={handleZoomOut}
                      className="rounded-none p-2 transition-colors hover:bg-accent disabled:opacity-50"
                      title="zoom out"
                      disabled={scale <= 0.5}
                    >
                      <Minus
                        size={16}
                        weight="duotone"
                        className="text-muted-foreground"
                      />
                    </button>

                    <div className="min-w-[60px] rounded-none border border-border bg-background px-3 py-1 text-center font-mono text-xs">
                      {Math.round(scale * 100)}%
                    </div>

                    <button
                      onClick={handleZoomIn}
                      className="rounded-none p-2 transition-colors hover:bg-accent disabled:opacity-50"
                      title="zoom in"
                      disabled={scale >= 3}
                    >
                      <Plus
                        size={16}
                        weight="duotone"
                        className="text-muted-foreground"
                      />
                    </button>

                    <div className="mx-1 h-6 w-px bg-border" />

                    <button
                      onClick={handleResetZoom}
                      className="rounded-none p-2 transition-colors hover:bg-accent"
                      title="reset zoom and position"
                    >
                      <ArrowsOut
                        size={16}
                        weight="duotone"
                        className="text-muted-foreground"
                      />
                    </button>

                    <button
                      onClick={handleFitToFrame}
                      className="rounded-none p-2 transition-colors hover:bg-accent"
                      title="fit to frame"
                    >
                      <ArrowsIn
                        size={16}
                        weight="duotone"
                        className="text-muted-foreground"
                      />
                    </button>
                  </div>

                  {/* Helpful text */}
                  <p className="max-w-sm text-center text-muted-foreground text-xs">
                    drag to reposition • use controls to zoom and fit
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-border border-t bg-muted/20 px-6 py-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isUploading}
                  className="rounded-none font-medium"
                >
                  cancel
                </Button>

                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !previewUrl}
                  variant="accent"
                  className="min-w-[120px] rounded-none font-medium"
                >
                  {isUploading ? 'processing...' : 'set avatar'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
