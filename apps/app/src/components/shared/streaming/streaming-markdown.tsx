'use client';

import { useStreamingText } from '@repo/design/hooks/use-streaming-text';
import { cn } from '@repo/design/lib/utils';
import { motion } from 'framer-motion';
import type React from 'react';
import { memo } from 'react';

interface StreamingMarkdownProps {
  content: string;
  isStreaming?: boolean;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
  gradientFade?: boolean;
  gradientSize?: number;
  // For rendering markdown
  renderMarkdown: (content: string) => React.ReactNode;
}

export const StreamingMarkdown = memo(function StreamingMarkdown({
  content,
  isStreaming = true,
  speed = 20, // Slightly faster for markdown content
  onComplete,
  className,
  showCursor = true,
  gradientFade = true,
  gradientSize = 120,
  renderMarkdown,
}: StreamingMarkdownProps) {
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

  return (
    <div className={cn('relative', className)}>
      {/* Render markdown with streamed text */}
      <div className="relative">
        {renderMarkdown(displayedText)}

        {/* Gradient fade overlay for streaming effect */}
        {gradientFade && isActivelyStreaming && displayedText.length > 20 && (
          <div
            className="pointer-events-none absolute right-0 bottom-0"
            style={{
              width: `${gradientSize}px`,
              height: '1.5em',
              background: `linear-gradient(90deg, 
                transparent 0%, 
                var(--background) 60%, 
                var(--background) 100%)`,
              maskImage:
                'linear-gradient(to bottom, transparent 0%, black 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, black 100%)',
            }}
          />
        )}

        {/* Blinking cursor for active streaming */}
        {showCursor && isActivelyStreaming && (
          <motion.span
            className="ml-[1px] inline-block h-[1.2em] w-[2px] bg-foreground/50 align-text-bottom"
            animate={{ opacity: [1, 0] }}
            transition={{
              duration: 0.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>
    </div>
  );
});
