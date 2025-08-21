'use client';

import { cn } from '@/lib/utils';

interface StreamingIndicatorProps {
  isStreaming: boolean;
  className?: string;
  text?: string;
}

export function StreamingIndicator({
  isStreaming,
  className,
  text = 'AI is thinking',
}: StreamingIndicatorProps) {
  if (!isStreaming) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-muted-foreground text-sm',
        className
      )}
    >
      <div className="flex gap-1">
        <span
          className="h-2 w-2 animate-pulse rounded-full bg-current"
          style={{ animationDelay: '0ms' }}
        >
          ●
        </span>
        <span
          className="h-2 w-2 animate-pulse rounded-full bg-current"
          style={{ animationDelay: '200ms' }}
        >
          ●
        </span>
        <span
          className="h-2 w-2 animate-pulse rounded-full bg-current"
          style={{ animationDelay: '400ms' }}
        >
          ●
        </span>
      </div>
      <span className="text-xs">{text}</span>
    </div>
  );
}
