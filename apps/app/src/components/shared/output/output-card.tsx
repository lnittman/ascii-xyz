'use client';
import { ArrowRight } from '@phosphor-icons/react';

interface OutputCardProps {
  outputId: string;
  title: string;
  type: string;
  onClick?: () => void;
  className?: string;
}

export function OutputCard({
  outputId,
  title,
  type,
  onClick,
  className = '',
}: OutputCardProps) {
  return (
    <div
      className={`my-2 h-9 cursor-pointer overflow-hidden border border-border/40 transition-colors hover:border-border ${className}`}
      onClick={onClick}
    >
      <div
        className={
          'flex h-full items-center justify-between bg-purple-500/5 px-3 text-muted-foreground text-xs'
        }
      >
        <div className="flex items-center gap-1.5">
          <span className={'font-medium text-purple-600'}>output:</span>
          <span className="max-w-[220px] truncate">{title}</span>
          <span className="text-muted-foreground/70">({type})</span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/70" />
      </div>
    </div>
  );
}
