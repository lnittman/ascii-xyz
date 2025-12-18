'use client';

import { useAtomValue } from 'jotai';
import { Command } from '@phosphor-icons/react';
import {
  showLeaderIndicatorAtom,
  leaderModeActiveAtom,
  pendingSequenceAtom,
  formatKeyCombo,
} from '@/atoms/keyboard/shortcuts';
import { cn } from '@repo/design/lib/utils';

export function LeaderKeyIndicator() {
  const show = useAtomValue(showLeaderIndicatorAtom);
  const leaderActive = useAtomValue(leaderModeActiveAtom);
  const pendingSequence = useAtomValue(pendingSequenceAtom);

  if (!show) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-2 px-3 py-2',
        'bg-background/95 backdrop-blur-sm border border-border rounded-md shadow-lg',
        'animate-in fade-in slide-in-from-bottom-2 duration-150'
      )}
    >
      <Command className="h-3.5 w-3.5 text-primary" weight="bold" />

      {leaderActive && !pendingSequence && (
        <span className="text-xs text-muted-foreground">
          leader mode active...
        </span>
      )}

      {pendingSequence && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">sequence:</span>
          {pendingSequence.keys.map((key, i) => (
            <kbd
              key={i}
              className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono"
            >
              {formatKeyCombo(key)}
            </kbd>
          ))}
          <span className="text-xs text-muted-foreground animate-pulse">...</span>
        </div>
      )}
    </div>
  );
}
