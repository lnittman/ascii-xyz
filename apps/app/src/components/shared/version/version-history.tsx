'use client';

import { ArrowCounterClockwise, Clock, GitBranch } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

import { Button } from '@repo/design/components/ui/button';
import { Checkbox } from '@repo/design/components/ui/checkbox';
import { ScrollArea } from '@repo/design/components/ui/scroll-area';
import { cn } from '@repo/design/lib/utils';

export interface Version {
  version: number;
  createdAt: Date | string;
  content: string;
  metadata?: Record<string, any>;
}

interface VersionHistoryProps {
  versions: Version[];
  isLoading?: boolean;
  onCompare?: (v1: number, v2: number) => void;
  onRestore?: (version: number) => Promise<void>;
  onPreview?: (version: number) => void;
  maxPreviewLength?: number;
  className?: string;
}

export function VersionHistory({
  versions,
  isLoading = false,
  onCompare,
  onRestore,
  onPreview,
  maxPreviewLength = 100,
  className,
}: VersionHistoryProps) {
  const [comparing, setComparing] = useState<number[]>([]);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);

  const handleVersionCheck = (version: number, checked: boolean) => {
    if (checked) {
      // Only allow 2 versions to be selected
      setComparing([...comparing, version].slice(-2));
    } else {
      setComparing(comparing.filter((v) => v !== version));
    }
  };

  const handleCompare = () => {
    if (comparing.length === 2 && onCompare) {
      onCompare(comparing[0], comparing[1]);
    }
  };

  const handleRestore = async (version: number) => {
    if (!onRestore) {
      return;
    }

    setRestoringVersion(version);
    try {
      await onRestore(version);
    } finally {
      setRestoringVersion(null);
    }
  };

  const getVersionPreview = (content: string) => {
    return (
      content.slice(0, maxPreviewLength) +
      (content.length > maxPreviewLength ? '...' : '')
    );
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium text-sm">
          <Clock size={16} weight="duotone" />
          version history
        </h3>
        {onCompare && comparing.length === 2 && (
          <Button size="sm" variant="outline" onClick={handleCompare}>
            <GitBranch size={16} weight="duotone" className="mr-2" />
            compare selected
          </Button>
        )}
      </div>

      <ScrollArea className="h-[300px] rounded-lg border">
        <div className="space-y-3 p-4">
          {versions.map((version) => {
            const createdAt =
              typeof version.createdAt === 'string'
                ? new Date(version.createdAt)
                : version.createdAt;

            return (
              <div
                key={version.version}
                className={cn(
                  'cursor-pointer rounded-lg border p-3 hover-bg',
                  comparing.includes(version.version)
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent hover:bg-accent/50'
                )}
                onClick={() => onPreview?.(version.version)}
              >
                <div className="flex items-start gap-3">
                  {onCompare && (
                    <Checkbox
                      checked={comparing.includes(version.version)}
                      onCheckedChange={(checked) =>
                        handleVersionCheck(version.version, checked as boolean)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        v{version.version}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDistanceToNow(createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-muted-foreground text-xs">
                      {getVersionPreview(version.content)}
                    </p>
                    {onRestore && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-auto p-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(version.version);
                        }}
                        disabled={restoringVersion === version.version}
                      >
                        <ArrowCounterClockwise
                          size={14}
                          weight="duotone"
                          className="mr-1"
                        />
                        {restoringVersion === version.version
                          ? 'restoring...'
                          : 'restore'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
