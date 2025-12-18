'use client';

import {
  Code,
  Download,
  FileImage,
  FileJs,
  FileText,
  FileVideo,
  Spinner,
} from '@phosphor-icons/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@repo/design/components/ui/button';
import { cn } from '@repo/design/lib/utils';
import { useExportGif, useExportVideo } from '@/hooks/use-export';
import { generateCodeExport } from '@/lib/export/code';
import type { Doc } from '@repo/backend/convex/_generated/dataModel';

type Artwork = Doc<'artworks'>;

interface ArtworkExportMenuProps {
  artwork: Artwork;
  buttonSize?: 'sm' | 'default' | 'lg' | 'icon';
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';
  className?: string;
}

type ExportFormat = 'gif' | 'video' | 'json' | 'text' | 'code';

interface ExportOption {
  format: ExportFormat;
  label: string;
  description: string;
  icon: typeof FileImage;
}

const exportOptions: ExportOption[] = [
  {
    format: 'gif',
    label: 'Animated GIF',
    description: 'Download as animated image',
    icon: FileImage,
  },
  {
    format: 'video',
    label: 'WebM Video',
    description: 'Download as video file',
    icon: FileVideo,
  },
  {
    format: 'json',
    label: 'JSON',
    description: 'Full data with metadata',
    icon: FileJs,
  },
  {
    format: 'text',
    label: 'Plain Text',
    description: 'ASCII frames as text file',
    icon: FileText,
  },
  {
    format: 'code',
    label: 'Code Snippet',
    description: 'Python code to regenerate',
    icon: Code,
  },
];

export function ArtworkExportMenu({
  artwork,
  buttonSize = 'icon',
  buttonVariant = 'ghost',
  className,
}: ArtworkExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { exportGif } = useExportGif();
  const { exportVideo, isSupported: isVideoSupported } = useExportVideo();

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setIsOpen(false);

    try {
      switch (format) {
        case 'gif':
          await exportGif(artwork, {
            filename: `ascii-${artwork._id}.gif`,
          });
          toast.success('GIF downloaded');
          break;

        case 'video':
          await exportVideo(artwork, {
            filename: `ascii-${artwork._id}.webm`,
          });
          toast.success('Video downloaded');
          break;

        case 'json':
          exportJson(artwork);
          toast.success('JSON downloaded');
          break;

        case 'text':
          exportText(artwork);
          toast.success('Text file downloaded');
          break;

        case 'code':
          exportCode(artwork);
          toast.success('Code snippet downloaded');
          break;
      }
    } catch (error) {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportJson = (artwork: Artwork) => {
    const content = JSON.stringify(
      {
        prompt: artwork.prompt,
        frames: artwork.frames,
        metadata: artwork.metadata,
        createdAt: artwork.createdAt,
      },
      null,
      2
    );

    downloadFile(content, `ascii-${artwork._id}.json`, 'application/json');
  };

  const exportText = (artwork: Artwork) => {
    const separator = '\n' + '='.repeat(artwork.metadata.width || 80) + '\n\n';
    const content = [
      `# ${artwork.prompt}`,
      `# Generated: ${artwork.createdAt}`,
      `# Frames: ${artwork.frames.length}`,
      `# FPS: ${artwork.metadata.fps}`,
      '',
      separator,
      artwork.frames.join(separator),
    ].join('\n');

    downloadFile(content, `ascii-${artwork._id}.txt`, 'text/plain');
  };

  const exportCode = (artwork: Artwork) => {
    const content = generateCodeExport(artwork, { language: 'python' });
    downloadFile(content, `ascii-${artwork._id}.py`, 'text/x-python');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenuPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          disabled={isExporting}
          className={cn(
            'h-7 w-7 hover:bg-muted/50 rounded-sm transition-colors duration-0 cursor-default',
            className
          )}
        >
          {isExporting ? (
            <Spinner className="h-4 w-4 animate-spin" />
          ) : (
            <Download size={14} weight="bold" />
          )}
        </Button>
      </DropdownMenuPrimitive.Trigger>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenuPrimitive.Portal forceMount>
            <DropdownMenuPrimitive.Content
              asChild
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <motion.div
                className="z-50 min-w-[180px] overflow-hidden rounded-md border border-border bg-background p-1 shadow-lg"
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{
                  duration: 0.15,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Export as
                </div>

                {exportOptions
                  .filter((option) => option.format !== 'video' || isVideoSupported)
                  .map((option) => (
                    <DropdownMenuPrimitive.Item
                      key={option.format}
                      className={cn(
                        'flex cursor-pointer select-none items-center rounded-sm px-2 py-2',
                        'text-sm outline-none transition-colors',
                        'hover:bg-muted hover:text-foreground',
                        'focus:bg-muted focus:text-foreground'
                      )}
                      onSelect={() => handleExport(option.format)}
                    >
                      <option.icon className="mr-2 h-4 w-4" weight="duotone" />
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </DropdownMenuPrimitive.Item>
                  ))}
              </motion.div>
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        )}
      </AnimatePresence>
    </DropdownMenuPrimitive.Root>
  );
}
