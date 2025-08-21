'use client';
import { GitBranch } from '@phosphor-icons/react';
import { ScrollArea } from '@repo/design/components/ui/scroll-area';
import { cn } from '@repo/design/lib/utils';

export interface DiffChange {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface DiffStats {
  additions: number;
  deletions: number;
}

export interface DiffData {
  changes: DiffChange[];
  stats: DiffStats;
}

interface DiffViewerProps {
  diff: DiffData | null;
  version1?: string | number;
  version2?: string | number;
  isLoading?: boolean;
  className?: string;
  height?: string | number;
}

export function DiffViewer({
  diff,
  version1,
  version2,
  isLoading = false,
  className,
  height = 400,
}: DiffViewerProps) {
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  if (!diff) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {(version1 !== undefined || version2 !== undefined) && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <GitBranch weight="duotone" size={16} />
            {version1 !== undefined && version2 !== undefined ? (
              <span>
                v{version1} → v{version2}
              </span>
            ) : (
              <span>Diff View</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-muted-foreground text-xs">
            <span className="text-green-600">+{diff.stats.additions}</span>
            <span className="text-red-600">-{diff.stats.deletions}</span>
          </div>
        </div>
      )}

      <ScrollArea
        className="rounded-lg border"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className="p-4 font-mono text-sm">
          {diff.changes.map((change, index) => (
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
