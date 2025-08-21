'use client';

import { cn } from '@/lib/utils';
import { CircleNotch } from '@phosphor-icons/react';

type ToolCallPart = {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: any;
};

interface ToolCallProgressProps {
  toolCall: ToolCallPart;
  className?: string;
}

export function ToolCallProgress({
  toolCall,
  className,
}: ToolCallProgressProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-border/50 bg-muted p-2',
        className
      )}
    >
      <CircleNotch className="h-3 w-3 animate-spin text-muted-foreground" />
      <span className="text-muted-foreground text-sm">
        Running {toolCall.toolName}...
      </span>
    </div>
  );
}

interface ToolCallStatusProps {
  toolCall: ToolCallPart & {
    status?: 'pending' | 'running' | 'complete' | 'error';
  };
  className?: string;
}

export function ToolCallStatus({ toolCall, className }: ToolCallStatusProps) {
  const status = toolCall.status || 'running';

  const statusConfig = {
    pending: {
      icon: <div className="h-3 w-3 animate-pulse rounded-full bg-muted" />,
      text: `Preparing ${toolCall.toolName}...`,
      bgColor: 'bg-muted/50',
    },
    running: {
      icon: <CircleNotch className="h-3 w-3 animate-spin text-blue-500" />,
      text: `Running ${toolCall.toolName}...`,
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    complete: {
      icon: <div className="h-3 w-3 rounded-full bg-green-500" />,
      text: `Completed ${toolCall.toolName}`,
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    error: {
      icon: <div className="h-3 w-3 rounded-full bg-red-500" />,
      text: `Failed ${toolCall.toolName}`,
      bgColor: 'bg-red-50 dark:bg-red-950/20',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-border/50 p-2 transition-colors',
        config.bgColor,
        className
      )}
    >
      {config.icon}
      <span className="text-muted-foreground text-sm">{config.text}</span>
    </div>
  );
}
