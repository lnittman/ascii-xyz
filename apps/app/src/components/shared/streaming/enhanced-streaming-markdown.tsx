'use client';

import { useStreamingText } from '@repo/design/hooks/use-streaming-text';
import { cn } from '@repo/design/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { memo, useEffect, useState } from 'react';

interface EnhancedStreamingMarkdownProps {
  content: string;
  isStreaming?: boolean;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
  gradientFade?: boolean;
  gradientSize?: number;
  renderMarkdown: (content: string) => React.ReactNode;
  // New props for enhanced streaming
  streamingIndicator?: React.ReactNode;
  cursorPosition?: 'inline' | 'below';
}

export const EnhancedStreamingMarkdown = memo(
  function EnhancedStreamingMarkdown({
    content,
    isStreaming = true,
    speed = 20,
    onComplete,
    className,
    showCursor = true,
    gradientFade = true,
    gradientSize = 120,
    renderMarkdown,
    streamingIndicator,
    cursorPosition = 'inline',
  }: EnhancedStreamingMarkdownProps) {
    const {
      displayedText,
      isComplete,
      isStreaming: isActivelyStreaming,
    } = useStreamingText({
      text: content,
      isStreaming,
      speed,
      onComplete,
    });

    const [lastWord, setLastWord] = useState('');
    const [previousText, setPreviousText] = useState('');

    // Extract the last word for animation
    useEffect(() => {
      if (isActivelyStreaming && displayedText.length > previousText.length) {
        const words = displayedText.trim().split(/\s+/);
        if (words.length > 0) {
          setLastWord(words.at(-1) || '');
        }
        setPreviousText(displayedText);
      }
    }, [displayedText, isActivelyStreaming, previousText]);

    return (
      <div className={cn('relative', className)}>
        {/* Render markdown with streamed text */}
        <div className="relative">
          {renderMarkdown(displayedText)}

          {/* Enhanced gradient fade overlay */}
          {gradientFade && isActivelyStreaming && displayedText.length > 20 && (
            <motion.div
              className="pointer-events-none absolute right-0 bottom-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                width: `${gradientSize}px`,
                height: '2em',
                background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(var(--background), 0.5) 30%,
                rgba(var(--background), 0.8) 70%,
                var(--background) 100%)`,
                maskImage:
                  'linear-gradient(to bottom, transparent 0%, black 100%)',
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0%, black 100%)',
              }}
            />
          )}

          {/* Inline animated cursor with pulse effect */}
          {showCursor && isActivelyStreaming && cursorPosition === 'inline' && (
            <motion.span
              className="ml-[2px] inline-block align-text-bottom"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className="inline-block h-[1.2em] w-[2px] rounded-full bg-primary/60"
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scaleY: [0.9, 1, 0.9],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
              />
            </motion.span>
          )}
        </div>

        {/* Below content streaming indicator */}
        <AnimatePresence mode="wait">
          {showCursor &&
            isActivelyStreaming &&
            cursorPosition === 'below' &&
            streamingIndicator && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="mt-2"
              >
                {streamingIndicator}
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    );
  }
);
