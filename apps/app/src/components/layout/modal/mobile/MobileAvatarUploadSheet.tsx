'use client';

import {
  mobileAvatarUploadModalOpenAtom,
  mobileAvatarUploadModalStateAtom,
} from '@/atoms/mobile-menus';
import { toast } from '@/components/shared/ui/custom-toast';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import { useUser } from '@clerk/nextjs';
import { ArrowsIn, ArrowsOut, Minus, Plus } from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import { useAtom } from 'jotai';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface MobileAvatarUploadSheetProps {
  onAvatarUpdate?: () => void;
}

export function MobileAvatarUploadSheet({
  onAvatarUpdate,
}: MobileAvatarUploadSheetProps = {}) {
  const [isOpen, setIsOpen] = useAtom(mobileAvatarUploadModalOpenAtom);
  const [modalState] = useAtom(mobileAvatarUploadModalStateAtom);
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
    if (modalState.file && isOpen) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
        // Reset crop controls
        setScale(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(modalState.file);
    } else if (!isOpen) {
      // Reset when sheet closes
      setPreviewUrl(null);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [modalState.file, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
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

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
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
    if (!modalState.file || !previewUrl || !user) {
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

  return (
    <MobileSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="change avatar"
      position="bottom"
      spacing="md"
    >
      <div className="p-4 pb-safe">
        <div className="flex flex-col items-center space-y-4">
          {previewUrl && (
            <div className="relative">
              {/* Crop viewport */}
              <div
                className="relative h-56 w-56 touch-none select-none overflow-hidden border-2 border-border bg-muted"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
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
              title="reset"
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
              title="fit"
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
            drag to reposition • use controls to zoom
          </p>

          {/* Actions */}
          <div className="flex w-full gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 rounded-none font-medium"
            >
              cancel
            </Button>

            <Button
              onClick={handleUpload}
              disabled={isUploading || !previewUrl}
              variant="accent"
              className="flex-1 rounded-none font-medium"
            >
              {isUploading ? 'processing...' : 'set avatar'}
            </Button>
          </div>
        </div>
      </div>
    </MobileSheet>
  );
}
