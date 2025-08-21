'use client';

import { GitBranch } from '@phosphor-icons/react';
import type { Change } from 'diff';

import { useOutputDiff } from '@/hooks/output/use-output-versions';
import { ScrollArea } from '@repo/design/components/ui/scroll-area';
import { cn } from '@repo/design/lib/utils';

interface OutputDiffViewerProps {
  outputId: string;
  version1: number;
  version2: number;
}

export function OutputDiffViewer({
  outputId,
  version1,
  version2,
}: OutputDiffViewerProps) {
  const { diff, isLoading } = useOutputDiff(outputId, version1, version2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  if (!diff) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <GitBranch weight="duotone" size={16} />
          <span>
            v{version1} → v{version2}
          </span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground text-xs">
          <span className="text-green-600">+{diff.stats.additions}</span>
          <span className="text-red-600">-{diff.stats.deletions}</span>
        </div>
      </div>

      <ScrollArea className="h-[400px] rounded-lg border">
        <div className="p-4 font-mono text-sm">
          {diff.changes.map((change: Change, index: number) => (
            <div
              key={index}
              className={cn(
                'whitespace-pre-wrap px-2 py-1',
                change.added && 'bg-green-500/20 text-green-300',
                change.removed && 'bg-red-500/20 text-red-300'
              )}
            >
              {change.added && '+ '}
              {change.removed && '- '}
              {change.value}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
