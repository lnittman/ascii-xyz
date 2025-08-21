'use client';

import { CustomTooltip } from '@/components/shared/custom-tooltip';
import { useFeedback } from '@/hooks/feedback/mutations';
import {
  Check,
  Copy,
  DownloadSimple,
  Share,
  ThumbsDown,
  ThumbsUp,
} from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import { cn } from '@repo/design/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, useTransition } from 'react';

// UI feedback types that map to database values via the action
type UIFeedbackType = 'thumbsUp' | 'thumbsDown';

interface ActionButtonsProps {
  content: string;
  chatId: string;
  messageId: string;
  onDownload: (content: string, title: string) => void;
}

export function ActionButtons({
  content,
  chatId,
  messageId,
  onDownload,
}: ActionButtonsProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [feedback, setFeedback] = useState<UIFeedbackType | null>(null);
  const [isPending, startTransition] = useTransition();
  const { handleFeedback: submitFeedback } = useFeedback();

  // Load existing feedback on mount
  useEffect(() => {
    // TODO: Load feedback via API or pass as prop from server component
    // For now, skip loading existing feedback
  }, [messageId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);

    // Reset after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleFeedback = (type: UIFeedbackType) => {
    startTransition(async () => {
      // If clicking the same feedback, remove it
      const newFeedback = feedback === type ? null : type;
      setFeedback(newFeedback);

      // Map UI feedback types to database values
      const dbFeedbackType =
        newFeedback === 'thumbsUp'
          ? 'helpful'
          : newFeedback === 'thumbsDown'
            ? 'not_helpful'
            : null;

      await submitFeedback({
        chatId,
        messageId,
        type: dbFeedbackType,
      });
    });
  };

  return (
    <div className="flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <CustomTooltip content={isCopied ? 'Copied!' : 'Copy message'}>
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
                  className="h-3.5 w-3.5 text-muted-foreground"
                  weight="duotone"
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
                  className="h-3.5 w-3.5 text-muted-foreground"
                  weight="duotone"
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
          onClick={() => onDownload(content, 'Response')}
        >
          <DownloadSimple weight="duotone" className="h-3.5 w-3.5" />
        </Button>
      </CustomTooltip>

      <CustomTooltip content="Share" side="bottom">
        <Button
          variant="ghost"
          size="icon"
          className="flex h-6 w-6 items-center justify-center rounded-none border border-border/40 bg-background hover:bg-accent/50"
        >
          <Share weight="duotone" className="h-3.5 w-3.5" />
        </Button>
      </CustomTooltip>

      <CustomTooltip content="Helpful" side="bottom">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-none border border-border/40 bg-background transition-all hover:bg-accent/50',
            feedback === 'thumbsUp' && 'border-accent bg-accent/50'
          )}
          onClick={() => handleFeedback('thumbsUp')}
          disabled={isPending}
        >
          <motion.div
            animate={{
              scale: feedback === 'thumbsUp' ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <ThumbsUp
              weight={feedback === 'thumbsUp' ? 'fill' : 'duotone'}
              className={cn(
                'h-3.5 w-3.5 transition-all',
                feedback === 'thumbsUp'
                  ? 'text-foreground'
                  : 'text-muted-foreground',
                feedback === 'thumbsDown' && 'opacity-33'
              )}
            />
          </motion.div>
        </Button>
      </CustomTooltip>

      <CustomTooltip content="Not Helpful" side="bottom">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-none border border-border/40 bg-background transition-all hover:bg-accent/50',
            feedback === 'thumbsDown' && 'border-accent bg-accent/50'
          )}
          onClick={() => handleFeedback('thumbsDown')}
          disabled={isPending}
        >
          <motion.div
            animate={{
              scale: feedback === 'thumbsDown' ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <ThumbsDown
              weight={feedback === 'thumbsDown' ? 'fill' : 'duotone'}
              className={cn(
                'h-3.5 w-3.5 transition-all',
                feedback === 'thumbsDown'
                  ? 'text-foreground'
                  : 'text-muted-foreground',
                feedback === 'thumbsUp' && 'opacity-33'
              )}
            />
          </motion.div>
        </Button>
      </CustomTooltip>
    </div>
  );
}
