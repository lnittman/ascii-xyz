import { Camera } from '@phosphor-icons/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { v4 as uuidv4 } from 'uuid';

import { cn } from '@repo/design/lib/utils';
import type { Attachment } from '../../attachment-row';

interface ScreenshotButtonProps {
  onScreenshotCapture?: (attachment: Attachment) => void;
}

export function ScreenshotButton({
  onScreenshotCapture,
}: ScreenshotButtonProps) {
  const captureScreenshot = async () => {
    try {
      // Use the browser's screen capture API
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // Using simpler constraints to avoid TypeScript errors
        audio: false,
      });

      // Get the video track from the stream
      const _videoTrack = mediaStream.getVideoTracks()[0];

      // Create a video element to capture a frame
      const video = document.createElement('video');
      video.srcObject = mediaStream;

      // Wait for the video to be loaded enough to capture
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });

      // Create a canvas to draw the captured frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current frame to the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Stop all tracks to close the screenshot selector UI
      mediaStream.getTracks().forEach((track) => track.stop());

      // Convert the canvas to a Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            throw new Error('Could not create blob from canvas');
          }
        }, 'image/png');
      });

      // Create object URL for the blob
      const imageUrl = URL.createObjectURL(blob);

      // Generate a timestamp-based filename
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:.]/g, '')
        .slice(0, 15);
      const filename = `screenshot_${timestamp}.png`;

      // Create the attachment object
      const attachment: Attachment = {
        id: uuidv4(),
        name: filename,
        type: 'image',
        size: blob.size,
        url: imageUrl,
        metadata: {
          mimeType: 'image/png',
          blob,
        },
      };

      // Pass the attachment to the parent component
      if (onScreenshotCapture) {
        onScreenshotCapture(attachment);
      }
    } catch (_error) {}
  };

  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-none px-2 py-1.5 text-foreground text-sm outline-none transition-colors',
        'focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
      )}
      onClick={captureScreenshot}
    >
      <Camera weight="duotone" className="mr-1.5 h-4 w-4" />
      <span>take a screenshot</span>
    </DropdownMenuPrimitive.Item>
  );
}
