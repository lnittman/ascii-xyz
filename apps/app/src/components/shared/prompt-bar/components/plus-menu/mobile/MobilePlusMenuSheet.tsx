'use client';

import {
  mobilePlusMenuHandlersAtom,
  mobilePlusMenuOpenAtom,
} from '@/atoms/mobile-menus';
import { toast } from '@/components/shared/ui/custom-toast';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import {
  Camera,
  File,
  FileArrowUp,
  Images,
  Wrench,
} from '@phosphor-icons/react';
import { useAtom } from 'jotai';
import type React from 'react';
import { useState } from 'react';
import type { Attachment } from '../../attachment-row';

const MenuItem = ({
  icon,
  label,
  onClick,
  disabled = false,
  rightElement,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  rightElement?: React.ReactNode;
}) => (
  <div className="px-3 py-1">
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between gap-3 rounded-none px-3 py-3 text-left text-sm transition-colors ${
        disabled
          ? 'cursor-not-allowed text-muted-foreground/50'
          : 'text-foreground hover:bg-accent'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {rightElement}
    </button>
  </div>
);

const MobileUploadSheet = ({
  isOpen,
  onClose,
  onFileSelect,
  onScreenshotCapture,
}: {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect?: (files: FileList) => void;
  onScreenshotCapture?: (attachment: Attachment) => void;
}) => {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const handleFileUpload = (accept?: string) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = accept || '*/*';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.onchange = (e) => {
        try {
          const files = (e.target as HTMLInputElement).files;
          if (files && onFileSelect) {
            onFileSelect(files);
          }
        } catch (_error) {
          toast.error('failed to process selected files');
        } finally {
          document.body.removeChild(input);
        }
      };
      input.click();
      onClose();
    } catch (_error) {
      toast.error('failed to open file browser');
    }
  };

  const handleCameraCapture = async () => {
    if (isMobile) {
      // On mobile: trigger camera directly via file input
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Use rear camera by default
        input.onchange = (e) => {
          try {
            const files = (e.target as HTMLInputElement).files;
            if (files && onFileSelect) {
              onFileSelect(files);
            }
          } catch (_error) {
            toast.device('failed to process captured photo');
          }
        };
        input.click();
        onClose();
      } catch (_error) {
        toast.device('failed to open camera');
      }
    } else {
      // On desktop: use getUserMedia API for webcam
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;

        // Create a simple capture interface
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        `;

        const videoContainer = document.createElement('div');
        videoContainer.style.cssText = `
          position: relative;
          max-width: 80%;
          max-height: 70%;
        `;

        video.style.cssText = `
          width: 100%;
          height: auto;
          border-radius: 8px;
        `;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
          margin-top: 20px;
          display: flex;
          gap: 16px;
        `;

        const captureBtn = document.createElement('button');
        captureBtn.textContent = 'capture';
        captureBtn.style.cssText = `
          padding: 12px 24px;
          background: #0066cc;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'cancel';
        cancelBtn.style.cssText = `
          padding: 12px 24px;
          background: #666;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        `;

        const cleanup = () => {
          stream.getTracks().forEach((track) => track.stop());
          document.body.removeChild(modal);
        };

        captureBtn.onclick = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
              if (blob) {
                const timestamp = new Date()
                  .toISOString()
                  .replace(/[-:.]/g, '')
                  .slice(0, 15);
                const filename = `photo_${timestamp}.png`;
                const imageUrl = URL.createObjectURL(blob);

                // Create attachment directly
                const attachment: Attachment = {
                  id: crypto.randomUUID(),
                  name: filename,
                  type: 'image',
                  size: blob.size,
                  url: imageUrl,
                  metadata: {
                    mimeType: 'image/png',
                    blob,
                  },
                };

                // Use the screenshot handler if available
                if (onScreenshotCapture) {
                  onScreenshotCapture(attachment);
                }
              }
              cleanup();
            }, 'image/png');
          }
        };

        cancelBtn.onclick = cleanup;

        videoContainer.appendChild(video);
        buttonContainer.appendChild(captureBtn);
        buttonContainer.appendChild(cancelBtn);
        modal.appendChild(videoContainer);
        modal.appendChild(buttonContainer);
        document.body.appendChild(modal);

        onClose();
      } catch (error) {
        // Handle specific camera errors with appropriate messages
        let errorMessage = 'Camera access failed';

        if (error instanceof DOMException) {
          switch (error.name) {
            case 'NotFoundError':
              errorMessage = 'no camera found on this device';
              break;
            case 'NotAllowedError':
              errorMessage = 'camera access denied';
              break;
            case 'NotReadableError':
              errorMessage = 'camera is already in use';
              break;
            case 'OverconstrainedError':
              errorMessage = "camera doesn't support the requested settings";
              break;
            case 'NotSupportedError':
              errorMessage = 'camera access is not supported';
              break;
            case 'SecurityError':
              errorMessage =
                'camera access blocked due to security restrictions';
              break;
            default:
              errorMessage = 'camera access failed';
          }
        }

        toast.device(errorMessage);

        onClose();
      }
    }
  };

  const handlePhotoSelect = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.style.display = 'none';
      document.body.appendChild(input);

      if (isMobile) {
        // On mobile: this should open photo library
        // Don't set capture attribute to avoid camera
      } else {
        // On desktop: this will open file dialog filtered to images
        // Could also include common image formats explicitly
        input.accept =
          'image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml';
      }

      input.onchange = (e) => {
        try {
          const files = (e.target as HTMLInputElement).files;
          if (files && onFileSelect) {
            onFileSelect(files);
          }
        } catch (_error) {
          toast.error('failed to process selected photos');
        } finally {
          document.body.removeChild(input);
        }
      };
      input.click();
      onClose();
    } catch (_error) {
      toast.error('failed to open photo browser');
    }
  };

  return (
    <MobileSheet isOpen={isOpen} onClose={onClose} title="upload content">
      <div className="py-2">
        <MenuItem
          icon={<Camera size={20} />}
          label="take a photo"
          onClick={handleCameraCapture}
        />
        <MenuItem
          icon={<Images size={20} />}
          label={isMobile ? 'choose from photos' : 'choose images'}
          onClick={handlePhotoSelect}
        />
        <MenuItem
          icon={<File size={20} />}
          label="browse files"
          onClick={() => handleFileUpload()}
        />
      </div>
    </MobileSheet>
  );
};

export function MobilePlusMenuSheet() {
  const [isOpen, setIsOpen] = useAtom(mobilePlusMenuOpenAtom);
  const [handlers] = useAtom(mobilePlusMenuHandlersAtom);
  const [showUploadSheet, setShowUploadSheet] = useState(false);

  const handleClose = () => setIsOpen(false);

  const handleUploadFile = () => {
    handleClose();
    setShowUploadSheet(true);
  };

  const handleManageTools = () => {
    // Disabled for now - coming soon
  };

  return (
    <>
      <MobileSheet isOpen={isOpen} onClose={handleClose} title="add content">
        <div className="py-2">
          <MenuItem
            icon={<FileArrowUp size={20} />}
            label="upload a file"
            onClick={handleUploadFile}
          />
          <MenuItem
            icon={<Wrench size={20} />}
            label="manage tools"
            onClick={handleManageTools}
            disabled={true}
            rightElement={
              <span className="rounded-none bg-muted/40 px-2 py-1 text-muted-foreground text-xs">
                coming soon
              </span>
            }
          />
        </div>
      </MobileSheet>

      <MobileUploadSheet
        isOpen={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
        onFileSelect={handlers.onFileSelect}
        onScreenshotCapture={handlers.onScreenshotCapture}
      />
    </>
  );
}
