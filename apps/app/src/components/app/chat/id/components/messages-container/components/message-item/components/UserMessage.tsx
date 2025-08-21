'use client';

import { useMemo, useState } from 'react';

import { useUser } from '@clerk/nextjs';
import {
  Check,
  Copy,
  DownloadSimple,
  File,
  FileCode,
  FileDoc,
  FilePdf,
  FileXls,
  Image,
  TextT,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@repo/design/components/ui/button';

import { CustomTooltip } from '@/components/shared/custom-tooltip';
import {
  estimateFileTokens,
  estimateTokens,
  formatTokenCount,
} from '@/utils/tokenCounter';

interface Attachment {
  name?: string;
  contentType?: string;
  url?: string;
  content?: string;
  size?: number;
}

interface UserMessageProps {
  content: string;
  attachments?: Attachment[];
}

export function UserMessage({ content, attachments = [] }: UserMessageProps) {
  const { user } = useUser();

  const [isCopied, setIsCopied] = useState(false);

  // Get user initials for avatar
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || '?';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);

    // Reset after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleDownload = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `user-message-${timestamp}.txt`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate token count for each attachment
  const attachmentTokens = useMemo(() => {
    return attachments.map((attachment) => {
      if (attachment.content) {
        // For text content, calculate from actual content
        return estimateTokens(attachment.content);
      }
      if (attachment.size) {
        // For files without content, estimate from file size and type
        return estimateFileTokens({
          size: attachment.size,
          type: attachment.contentType || '',
        });
      }
      return 0;
    });
  }, [attachments]);

  // Get icon for attachment based on content type
  const getAttachmentIcon = (contentType?: string) => {
    if (!contentType) {
      return (
        <File weight="duotone" className="h-4 w-4 text-muted-foreground" />
      );
    }

    if (contentType.startsWith('image/')) {
      return <Image weight="duotone" className="h-4 w-4 text-blue-400" />;
    }
    if (contentType.includes('pdf')) {
      return <FilePdf weight="duotone" className="h-4 w-4 text-red-400" />;
    }
    if (contentType.includes('text/')) {
      return <TextT weight="duotone" className="h-4 w-4 text-gray-400" />;
    }
    if (contentType.includes('doc')) {
      return <FileDoc weight="duotone" className="h-4 w-4 text-blue-500" />;
    }
    if (
      contentType.includes('sheet') ||
      contentType.includes('excel') ||
      contentType.includes('csv')
    ) {
      return <FileXls weight="duotone" className="h-4 w-4 text-green-500" />;
    }
    // Check by file extension in name
    const name =
      attachments.find((a) => a.contentType === contentType)?.name || '';
    if (name.match(/\.(js|ts|py|java|c|cpp|html|css|jsx|tsx|php|rb|go)$/i)) {
      return <FileCode weight="duotone" className="h-4 w-4 text-indigo-400" />;
    }
    return <File weight="duotone" className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <motion.div
      className="group"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Message container with avatar inside */}
      <div className="relative w-full rounded-none border border-border/40 bg-muted/40 px-2 py-2">
        <div className="flex items-start">
          {/* Avatar with initials inside message container */}
          <div className="mr-2 flex h-6 w-6 flex-shrink-0 select-none items-center justify-center rounded-none border border-border/40 bg-background font-medium text-foreground text-xs">
            {initials}
          </div>

          {/* Message content */}
          <div className="flex-1 text-sm">
            <p
              className="overflow-hidden whitespace-pre-wrap break-all text-foreground"
              style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
            >
              {content}
            </p>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={index}>
                    {/* Non-image attachments */}
                    {!attachment.contentType?.startsWith('image/') && (
                      <div className="inline-flex items-center gap-1.5 rounded-none border border-border/40 bg-background/80 px-2 py-1">
                        {getAttachmentIcon(attachment.contentType)}
                        <span className="max-w-[150px] truncate text-muted-foreground text-xs">
                          {attachment.name || 'Untitled'}
                        </span>
                        {attachmentTokens[index] > 0 && (
                          <span className="ml-1 text-muted-foreground/60 text-xs">
                            • {formatTokenCount(attachmentTokens[index])}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Image attachments */}
                    {attachment.contentType?.startsWith('image/') &&
                      attachment.url && (
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 rounded-none border border-border/40 bg-background/80 px-2 py-1">
                            {getAttachmentIcon(attachment.contentType)}
                            <span className="max-w-[150px] truncate text-muted-foreground text-xs">
                              {attachment.name || 'Untitled'}
                            </span>
                            {attachmentTokens[index] > 0 && (
                              <span className="ml-1 text-muted-foreground/60 text-xs">
                                • {formatTokenCount(attachmentTokens[index])}
                              </span>
                            )}
                          </div>
                          <div>
                            <img
                              src={attachment.url}
                              alt={attachment.name || 'Attachment'}
                              className="max-h-64 max-w-full rounded-none border border-border/40 object-contain"
                            />
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message action buttons that appear below message with padding */}
      <div className="flex justify-start gap-2 pt-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <CustomTooltip
          content={isCopied ? 'Copied!' : 'Copy message'}
          side="bottom"
        >
          <Button
            variant="ghost"
            size="icon"
            className="flex h-6 w-6 items-center justify-center rounded-none border border-border/40 bg-background hover:bg-accent/50"
            onClick={handleCopy}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCopied ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  <Check
                    weight="duotone"
                    className="h-3.5 w-3.5 text-muted-foreground"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  <Copy
                    weight="duotone"
                    className="h-3.5 w-3.5 text-muted-foreground"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </CustomTooltip>

        <CustomTooltip content="Download" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            className="flex h-6 w-6 items-center justify-center rounded-none border border-border/40 bg-background hover:bg-accent/50"
            onClick={handleDownload}
          >
            <DownloadSimple
              weight="duotone"
              className="h-3.5 w-3.5 text-muted-foreground"
            />
          </Button>
        </CustomTooltip>
      </div>
    </motion.div>
  );
}
