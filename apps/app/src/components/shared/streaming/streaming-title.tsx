'use client';

import { useStreamingText } from '@repo/design/hooks/use-streaming-text';
import {
  safariGPUAcceleration,
  useIsIOSSafari,
} from '@repo/design/lib/safari-utils';
import { cn } from '@repo/design/lib/utils';
import { memo, useEffect, useRef, useState } from 'react';

interface StreamingTitleProps {
  text: string;
  isStreaming?: boolean;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  gradientSize?: number;
}

export const StreamingTitle = memo(function StreamingTitle({
  text,
  isStreaming = true,
  speed = 25,
  onComplete,
  className,
  gradientSize = 40,
}: StreamingTitleProps) {
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

  const isIOSSafari = useIsIOSSafari();

  // Track width to prevent layout shifts
  const textRef = useRef<HTMLSpanElement>(null);
  const [minWidth, setMinWidth] = useState<number | undefined>();

  useEffect(() => {
    if (textRef.current && isComplete) {
      // Set minimum width to final text width to prevent collapse during transitions
      setMinWidth(textRef.current.offsetWidth);
    }
  }, [isComplete]);

  return (
    <span
      className={cn(
        'relative inline-block',
        isIOSSafari && 'safari-gpu-accelerated',
        className
      )}
      style={{
        minWidth: minWidth ? `${minWidth}px` : undefined,
        ...(isIOSSafari ? safariGPUAcceleration : {}),
      }}
    >
      <span ref={textRef} className="relative">
        {displayedText}

        {/* Gradient fade overlay - only during active streaming */}
        {gradientSize > 0 &&
          isActivelyStreaming &&
          displayedText.length > 5 && (
            <span
              className="pointer-events-none absolute top-0 right-0"
              style={{
                width: `${gradientSize}px`,
                height: '100%',
                background: `linear-gradient(90deg, 
                transparent 0%, 
                var(--background) 80%, 
                var(--background) 100%)`,
                ...(isIOSSafari ? { WebkitTransform: 'translateZ(0)' } : {}),
              }}
            />
          )}
      </span>
    </span>
  );
});
