'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

export interface SmoothStreamingTextProps {
  content: string;
  isStreaming?: boolean;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
  gradientFade?: boolean;
  gradientSize?: number;
  // Support both rendering patterns for backwards compatibility
  renderMarkdown?: (content: string) => React.ReactNode;
  children?: (text: string) => React.ReactNode;
  streamingIndicator?: React.ReactNode;
  cursorPosition?: 'inline' | 'below';
}

export function SmoothStreamingText({
  content,
  isStreaming = false,
  speed = 30,
  onComplete,
  className,
  showCursor = false,
  gradientFade = false,
  gradientSize = 120,
  renderMarkdown,
  children,
  streamingIndicator,
  cursorPosition = 'inline',
}: SmoothStreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset when content changes
    if (content !== displayedText + content.slice(displayedText.length)) {
      indexRef.current = 0;
      setDisplayedText('');
      setIsComplete(false);
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start streaming - continue until all text is displayed regardless of streaming state
    intervalRef.current = setInterval(() => {
      if (indexRef.current < content.length) {
        setDisplayedText(content.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        // Animation complete - show full content and mark complete
        setDisplayedText(content);
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [content, isStreaming, speed, onComplete]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const isActivelyStreaming = isStreaming && !isComplete;

  // Support multiple rendering modes: renderMarkdown, children, or plain text
  const renderContent = () => {
    if (renderMarkdown) {
      return renderMarkdown(displayedText);
    }
    if (children) {
      return children(displayedText);
    }
    return <span>{displayedText}</span>;
  };

  return (
    <div className={cn('relative', className)}>
      {/* Render content with support for renderMarkdown, children, or plain text */}
      <div className="relative">
        {renderContent()}

        {/* Enhanced gradient fade overlay with smooth exit */}
        <AnimatePresence>
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
        </AnimatePresence>
      </div>
    </div>
  );
}
