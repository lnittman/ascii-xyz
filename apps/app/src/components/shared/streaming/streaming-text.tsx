'use client';

import { useStreamingText } from '@repo/design/hooks/use-streaming-text';
import { cn } from '@repo/design/lib/utils';
import { motion } from 'framer-motion';
import { memo } from 'react';

interface StreamingTextProps {
  text: string;
  isStreaming?: boolean;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
  gradientFade?: boolean;
  gradientSize?: number;
}

export const StreamingText = memo(function StreamingText({
  text,
  isStreaming = true,
  speed = 30,
  onComplete,
  className,
  showCursor = true,
  gradientFade = true,
  gradientSize = 120,
}: StreamingTextProps) {
  const {
    displayedText,
    isComplete,
    isStreaming: isActivelyStreaming,
  } = useStreamingText({
    text,
    isStreaming,
    speed,
    onComplete,
  });

  return (
    <div className={cn('relative inline', className)}>
      {/* Main text content */}
      <span className="relative">
        {displayedText}

        {/* Gradient fade overlay for streaming effect */}
        {gradientFade && isActivelyStreaming && displayedText.length > 10 && (
          <span
            className="pointer-events-none absolute top-0 right-0"
            style={{
              width: `${gradientSize}px`,
              height: '100%',
              background: `linear-gradient(90deg, 
                transparent 0%, 
                var(--background) 60%, 
                var(--background) 100%)`,
              maskImage: 'linear-gradient(to bottom, black 0%, black 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, black 0%, black 100%)',
            }}
          />
        )}
      </span>

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
  );
});

// StreamingText component for use in buttons/triggers with smooth width transitions
interface StreamingTextButtonProps extends StreamingTextProps {
  wrapperClassName?: string;
}

export const StreamingTextButton = memo(function StreamingTextButton({
  text,
  isStreaming = true,
  speed = 30,
  onComplete,
  className,
  wrapperClassName,
  showCursor = false, // Default to no cursor for buttons
  gradientFade = true,
  gradientSize = 40, // Smaller gradient for buttons
}: StreamingTextButtonProps) {
  const {
    displayedText,
    isComplete,
    isStreaming: isActivelyStreaming,
  } = useStreamingText({
    text,
    isStreaming,
    speed,
    onComplete,
  });

  return (
    <motion.div
      className={cn('relative overflow-hidden', wrapperClassName)}
      layout
      transition={{
        layout: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
      }}
    >
      <span className={cn('relative whitespace-nowrap', className)}>
        {displayedText}

        {/* Gradient fade overlay - adjusted for button context */}
        {gradientFade && isActivelyStreaming && displayedText.length > 5 && (
          <span
            className="pointer-events-none absolute top-0 right-0"
            style={{
              width: `${gradientSize}px`,
              height: '100%',
              background: `linear-gradient(90deg, 
                transparent 0%, 
                var(--background) 70%, 
                var(--background) 100%)`,
            }}
          />
        )}
      </span>

      {/* Optional cursor for buttons */}
      {showCursor && isActivelyStreaming && (
        <motion.span
          className="ml-[1px] inline-block h-[1em] w-[2px] bg-foreground/30 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
});
