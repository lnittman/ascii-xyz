'use client';

import { ArrowClockwise, Check, Spinner, XCircle, Clock } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@repo/design/lib/utils';
import { useUserGenerations } from '@/hooks/use-generation';
import type { Id } from '@repo/backend/convex/_generated/dataModel';

interface Generation {
  _id: Id<'artworkGenerations'>;
  status: 'pending' | 'planning' | 'generating' | 'completed' | 'failed';
  prompt: string;
  modelId: string;
  currentFrame: number;
  totalFrames: number;
  frames: string[];
  createdAt: string;
  error?: string;
}

interface GenerationHistoryProps {
  userId: string;
  onRetry: (generationId: Id<'artworkGenerations'>) => void;
  onSelect?: (generation: Generation) => void;
  selectedId?: Id<'artworkGenerations'>;
  limit?: number;
  className?: string;
}

export function GenerationHistory({
  userId,
  onRetry,
  onSelect,
  selectedId,
  limit = 10,
  className,
}: GenerationHistoryProps) {
  const generations = useUserGenerations(userId, limit) as Generation[] | undefined;

  const isLoading = generations === undefined;
  const isEmpty = generations?.length === 0;

  return (
    <div
      data-testid="generation-history"
      className={cn('flex flex-col', className)}
    >
      {isLoading && (
        <div
          data-testid="history-loading"
          className="flex items-center justify-center py-8"
        >
          <Spinner className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isEmpty && !isLoading && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-xs font-mono text-muted-foreground">
            No generations yet
          </p>
        </div>
      )}

      {generations && generations.length > 0 && (
        <div className="flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {generations.map((generation) => (
              <GenerationHistoryItem
                key={generation._id}
                generation={generation}
                isSelected={generation._id === selectedId}
                onRetry={() => onRetry(generation._id)}
                onSelect={onSelect ? () => onSelect(generation) : undefined}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

interface GenerationHistoryItemProps {
  generation: Generation;
  isSelected: boolean;
  onRetry: () => void;
  onSelect?: () => void;
}

function GenerationHistoryItem({
  generation,
  isSelected,
  onRetry,
  onSelect,
}: GenerationHistoryItemProps) {
  const canRetry =
    generation.status === 'completed' ||
    generation.status === 'failed';

  const isActive =
    generation.status === 'planning' ||
    generation.status === 'generating' ||
    generation.status === 'pending';

  const truncatedPrompt = generation.prompt.length > 60
    ? `${generation.prompt.slice(0, 60)}...`
    : generation.prompt;

  const handleClick = (e: React.MouseEvent) => {
    // Don't select if clicking the retry button
    if ((e.target as HTMLElement).closest('button')) return;
    onSelect?.();
  };

  return (
    <motion.div
      data-testid={`generation-item-${generation._id}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        'group relative flex items-start gap-3 rounded-md px-3 py-2.5',
        'border border-transparent transition-colors',
        'cursor-pointer hover:bg-muted/50',
        isSelected && 'bg-muted border-border',
      )}
      onClick={handleClick}
    >
      {/* Status indicator */}
      <div className="flex-shrink-0 mt-0.5">
        <StatusIcon status={generation.status} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs truncate">{truncatedPrompt}</p>

        <div className="flex items-center gap-2 mt-1">
          {/* Status text */}
          <StatusText
            status={generation.status}
            currentFrame={generation.currentFrame}
            totalFrames={generation.totalFrames}
            error={generation.error}
          />

          {/* Model */}
          <span className="text-[10px] font-mono text-muted-foreground/70">
            {generation.modelId}
          </span>
        </div>
      </div>

      {/* Retry button */}
      {canRetry && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          className={cn(
            'flex-shrink-0 p-1.5 rounded-sm',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-muted transition-colors',
            'opacity-0 group-hover:opacity-100',
          )}
          aria-label="Retry"
        >
          <ArrowClockwise className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}

function StatusIcon({ status }: { status: Generation['status'] }) {
  switch (status) {
    case 'completed':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'planning':
    case 'generating':
    case 'pending':
      return <Spinner className="h-4 w-4 animate-spin text-muted-foreground" />;
    default:
      return null;
  }
}

function StatusText({
  status,
  currentFrame,
  totalFrames,
  error,
}: {
  status: Generation['status'];
  currentFrame: number;
  totalFrames: number;
  error?: string;
}) {
  switch (status) {
    case 'completed':
      return (
        <span className="text-[10px] font-mono text-green-500">Completed</span>
      );
    case 'failed':
      return (
        <span className="text-[10px] font-mono text-destructive" title={error}>
          Failed{error && `: ${error.slice(0, 30)}${error.length > 30 ? '...' : ''}`}
        </span>
      );
    case 'generating':
      return (
        <span className="text-[10px] font-mono text-muted-foreground">
          Generating {currentFrame} / {totalFrames}
        </span>
      );
    case 'planning':
      return (
        <span className="text-[10px] font-mono text-muted-foreground">
          Planning...
        </span>
      );
    case 'pending':
      return (
        <span className="text-[10px] font-mono text-muted-foreground">
          Pending...
        </span>
      );
    default:
      return null;
  }
}
