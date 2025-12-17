'use client';

import { useState } from 'react';
import { Heart } from '@phosphor-icons/react';
import { cn } from '@repo/design/lib/utils';
import { Button } from '@repo/design/components/ui/button';
import { useLikeState } from '@/hooks/use-social';
import { Id } from '@repo/backend/convex/_generated/dataModel';

interface LikeButtonProps {
  artworkId: Id<'artworks'>;
  className?: string;
  /** Show like count inline */
  showCount?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export function LikeButton({
  artworkId,
  className,
  showCount = true,
  size = 'md',
}: LikeButtonProps) {
  const { hasLiked, count, toggle } = useLikeState(artworkId);
  const [isAnimating, setIsAnimating] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);

  // Use optimistic values if available, otherwise real values
  const displayLiked = optimisticLiked ?? hasLiked;
  const displayCount = optimisticCount ?? count;

  const handleClick = async () => {
    if (!toggle) return;

    // Optimistic update
    const wasLiked = displayLiked;
    setOptimisticLiked(!wasLiked);
    setOptimisticCount(wasLiked ? displayCount - 1 : displayCount + 1);

    // Trigger animation
    if (!wasLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }

    try {
      await toggle();
    } catch (error) {
      // Revert on error
      setOptimisticLiked(null);
      setOptimisticCount(null);
      console.error('Failed to toggle like:', error);
    }

    // Clear optimistic state after real data arrives
    setTimeout(() => {
      setOptimisticLiked(null);
      setOptimisticCount(null);
    }, 500);
  };

  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-9 w-9',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={cn(
          sizeClasses[size],
          'rounded-md transition-all duration-200',
          displayLiked
            ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10'
            : 'text-muted-foreground hover:text-red-500 hover:bg-muted/50',
          isAnimating && 'scale-125'
        )}
        title={displayLiked ? 'Unlike' : 'Like'}
      >
        <Heart
          size={iconSizes[size]}
          weight={displayLiked ? 'fill' : 'regular'}
          className={cn(
            'transition-all duration-200',
            isAnimating && 'animate-pulse'
          )}
        />
      </Button>
      {showCount && (
        <span
          className={cn(
            'text-sm tabular-nums transition-colors duration-200',
            displayLiked ? 'text-red-500' : 'text-muted-foreground'
          )}
        >
          {displayCount}
        </span>
      )}
    </div>
  );
}

/**
 * Compact like indicator (no button, just icon + count)
 */
export function LikeCount({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Heart size={14} weight="duotone" className="text-muted-foreground" />
      <span className="text-sm text-muted-foreground tabular-nums">{count}</span>
    </div>
  );
}
