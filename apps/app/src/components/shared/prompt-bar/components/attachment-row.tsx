'use client';

import {
  File,
  FileAudio,
  FileCode,
  FileDoc,
  FilePdf,
  FileVideo,
  FileXls,
  Image,
  TextT,
  X,
} from '@phosphor-icons/react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';

import { cn } from '@repo/design/lib/utils';

export interface Attachment {
  id: string;
  name: string;
  type:
    | 'file'
    | 'image'
    | 'text'
    | 'code'
    | 'pdf'
    | 'doc'
    | 'spreadsheet'
    | 'audio'
    | 'video';
  size?: number;
  content?: string;
  url?: string;
  metadata?: Record<string, any>;
}

interface AttachmentRowProps {
  attachments: Attachment[];
  onRemoveAttachment: (id: string) => void;
  onAttachmentClick?: (attachment: Attachment) => void;
}

export function AttachmentRow({
  attachments,
  onRemoveAttachment,
  onAttachmentClick,
}: AttachmentRowProps) {
  // Calculate size to display in KB or MB
  const formatFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) {
      return '';
    }

    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    }
    if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    }
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get extension from filename
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Get icon based on attachment type
  const getAttachmentIcon = (attachment: Attachment) => {
    const ext = getFileExtension(attachment.name);

    switch (attachment.type) {
      case 'image':
        return <Image weight="duotone" className="h-5 w-5 text-blue-400" />;
      case 'text':
        return <TextT weight="duotone" className="h-5 w-5 text-gray-400" />;
      case 'code':
        return (
          <FileCode weight="duotone" className="h-5 w-5 text-indigo-400" />
        );
      case 'pdf':
        return <FilePdf weight="duotone" className="h-5 w-5 text-red-400" />;
      case 'doc':
        return <FileDoc weight="duotone" className="h-5 w-5 text-blue-500" />;
      case 'spreadsheet':
        return <FileXls weight="duotone" className="h-5 w-5 text-green-500" />;
      case 'audio':
        return (
          <FileAudio weight="duotone" className="h-5 w-5 text-purple-400" />
        );
      case 'video':
        return <FileVideo weight="duotone" className="h-5 w-5 text-pink-400" />;
      default: {
        // Try to determine file type from extension
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
          return <Image weight="duotone" className="h-5 w-5 text-blue-400" />;
        }
        if (['pdf'].includes(ext)) {
          return <FilePdf weight="duotone" className="h-5 w-5 text-red-400" />;
        }
        if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) {
          return <FileDoc weight="duotone" className="h-5 w-5 text-blue-500" />;
        }
        if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) {
          return (
            <FileXls weight="duotone" className="h-5 w-5 text-green-500" />
          );
        }
        if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
          return (
            <FileAudio weight="duotone" className="h-5 w-5 text-purple-400" />
          );
        }
        if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
          return (
            <FileVideo weight="duotone" className="h-5 w-5 text-pink-400" />
          );
        }
        if (
          [
            'js',
            'ts',
            'py',
            'java',
            'c',
            'cpp',
            'html',
            'css',
            'jsx',
            'tsx',
            'php',
            'rb',
            'go',
          ].includes(ext)
        ) {
          return (
            <FileCode weight="duotone" className="h-5 w-5 text-indigo-400" />
          );
        }

        return <File weight="duotone" className="h-5 w-5 text-gray-500" />;
      }
    }
  };

  // Get smaller icon for the title bar
  const getTitleBarIcon = (attachment: Attachment) => {
    const _ext = getFileExtension(attachment.name);

    switch (attachment.type) {
      case 'image':
        return <Image weight="duotone" className="h-3.5 w-3.5 text-blue-400" />;
      case 'text':
        return <TextT weight="duotone" className="h-3.5 w-3.5 text-gray-400" />;
      case 'code':
        return (
          <FileCode weight="duotone" className="h-3.5 w-3.5 text-indigo-400" />
        );
      case 'pdf':
        return (
          <FilePdf weight="duotone" className="h-3.5 w-3.5 text-red-400" />
        );
      case 'doc':
        return (
          <FileDoc weight="duotone" className="h-3.5 w-3.5 text-blue-500" />
        );
      case 'spreadsheet':
        return (
          <FileXls weight="duotone" className="h-3.5 w-3.5 text-green-500" />
        );
      case 'audio':
        return (
          <FileAudio weight="duotone" className="h-3.5 w-3.5 text-purple-400" />
        );
      case 'video':
        return (
          <FileVideo weight="duotone" className="h-3.5 w-3.5 text-pink-400" />
        );
      default:
        return <File weight="duotone" className="h-3.5 w-3.5 text-gray-500" />;
    }
  };

  const hasAttachments = attachments.length > 0;

  return (
    <AnimatePresence>
      {hasAttachments ? (
        <motion.div
          key="attachment-row"
          className={cn('overflow-hidden border-border/50 border-t')}
          initial={{ height: 0, opacity: 0, borderTopWidth: 0 }}
          animate={{
            height: 'auto',
            opacity: 1,
            borderTopWidth: 1,
          }}
          exit={{
            height: 0,
            opacity: 0,
            borderTopWidth: 0,
          }}
          transition={{
            duration: 0.3,
            ease: [0.32, 0.72, 0, 1],
          }}
        >
          <div
            className="no-scrollbar overflow-x-auto px-3 py-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <LayoutGroup>
              <motion.div className="flex gap-2 pr-3" layout>
                <AnimatePresence mode="popLayout">
                  {attachments.map((attachment, index, _array) => (
                    <motion.div
                      key={attachment.id}
                      className={cn(
                        'group relative flex flex-shrink-0 flex-col justify-between',
                        'border border-border/50 bg-accent/10 transition-colors hover:bg-accent/20',
                        'cursor-pointer overflow-hidden rounded-none'
                      )}
                      style={{ width: '72px', height: '72px' }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        width: 0,
                        marginRight: 0,
                        transition: {
                          opacity: { duration: 0.25, ease: 'easeOut' },
                          width: { duration: 0.15, delay: 0.2 },
                          marginRight: { duration: 0.15, delay: 0.2 },
                        },
                      }}
                      transition={{
                        duration: 0.25,
                        delay: index * 0.03,
                        ease: 'easeOut',
                        layout: { duration: 0.2, ease: [0.32, 0.72, 0, 1] },
                      }}
                      layout
                      onClick={() => onAttachmentClick?.(attachment)}
                    >
                      {/* X button overlay in top-left */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveAttachment(attachment.id);
                        }}
                        className="-translate-x-0.5 -translate-y-0.5 absolute top-0 left-[1px] z-10 flex h-5 w-5 items-center justify-center bg-background/70 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X
                          weight="duotone"
                          className="h-4 w-4 text-foreground"
                        />
                      </button>

                      {/* Icon and thumbnail section */}
                      <div className="flex flex-1 items-center justify-center overflow-hidden">
                        {attachment.type === 'image' && attachment.url ? (
                          <div className="flex h-full w-full items-center justify-center overflow-hidden bg-white/5">
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="max-h-full max-w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            {getAttachmentIcon(attachment)}
                          </div>
                        )}
                      </div>

                      {/* Footer with filetype icon and filename */}
                      <div className="flex w-full items-center gap-1 bg-background/80 px-1 py-0.5 text-xs backdrop-blur-sm">
                        <div className="flex-shrink-0">
                          {getTitleBarIcon(attachment)}
                        </div>
                        <span className="max-w-[52px] truncate text-muted-foreground text-xs">
                          {attachment.name.split('.')[0]}
                        </span>
                      </div>

                      {/* Hover overlay for file info */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-1 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                        <div className="text-center text-white/90">
                          <p className="max-w-[60px] truncate font-medium text-xs">
                            {attachment.name.split('.')[0]}
                          </p>
                          {attachment.size && (
                            <p className="text-[10px] text-white/70">
                              {formatFileSize(attachment.size)}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
