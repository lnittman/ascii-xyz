'use client';
import { ArrowRight } from '@phosphor-icons/react';

interface ToolCallProps {
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
  result?: any;
  isResult?: boolean;
  onClick: (toolName: string, args: Record<string, any>, result?: any) => void;
}

export function ToolCard({
  toolCallId,
  toolName,
  args,
  result,
  isResult = false,
  onClick,
}: ToolCallProps) {
  const handleClick = () => {
    onClick(toolName, args, result);
  };

  return (
    <div
      key={toolCallId}
      className={
        'my-2 h-9 cursor-pointer overflow-hidden border border-border/40 transition-colors hover:border-border'
      }
      onClick={handleClick}
    >
      <div
        className={`${isResult ? 'bg-green-500/5' : 'bg-primary/5'} flex h-full items-center justify-between px-3 text-muted-foreground text-xs`}
      >
        <div className="flex items-center gap-1.5">
          <span
            className={`font-medium ${isResult ? 'text-green-600' : 'text-primary'}`}
          >
            {isResult ? 'result:' : 'tool:'}
          </span>
          <span className="max-w-[220px] truncate">{toolName}</span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/70" />
      </div>
    </div>
  );
}
