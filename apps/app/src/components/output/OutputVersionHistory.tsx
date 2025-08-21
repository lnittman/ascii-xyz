'use client';

import { ArrowCounterClockwise, Clock, GitBranch } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

import { useOutputVersions } from '@/hooks/output/use-output-versions';
import { Button } from '@repo/design/components/ui/button';
import { Checkbox } from '@repo/design/components/ui/checkbox';
import { ScrollArea } from '@repo/design/components/ui/scroll-area';
import { cn } from '@repo/design/lib/utils';
import { toast } from 'sonner';

interface OutputVersionHistoryProps {
  outputId: string;
  onCompare?: (v1: number, v2: number) => void;
  onRestore?: (version: number) => void;
}

export function OutputVersionHistory({
  outputId,
  onCompare,
  onRestore,
}: OutputVersionHistoryProps) {
  const { versions, isLoading } = useOutputVersions(outputId);
  const [comparing, setComparing] = useState<number[]>([]);

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
    try {
      const response = await fetch(`/api/outputs/${outputId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version }),
      });

      if (!response.ok) {
        throw new Error('failed to restore version');
      }

      toast.success(`successfully restored to version ${version}`);

      if (onRestore) {
        onRestore(version);
      }
    } catch (_error) {
      toast.error('failed to restore version. please try again.');
    }
  };

  const getVersionPreview = (content: string) => {
    return content.slice(0, 100) + (content.length > 100 ? '...' : '');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium text-sm">
          <Clock size={16} weight="duotone" />
          version history ({versions.length})
        </h3>
        {comparing.length === 2 && (
          <Button size="sm" variant="outline" onClick={handleCompare}>
            <GitBranch size={16} weight="duotone" className="mr-2" />
            compare v{comparing[0]} ↔ v{comparing[1]}
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px] rounded-lg border">
        <div className="space-y-1 p-2">
          {versions.map((version: any) => (
            <div
              key={version.id}
              className={cn(
                'flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted/50',
                comparing.includes(version.version) && 'bg-muted'
              )}
            >
              <Checkbox
                checked={comparing.includes(version.version)}
                onCheckedChange={(checked) =>
                  handleVersionCheck(version.version, checked as boolean)
                }
                className="mt-1"
              />

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-xs">v{version.version}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(version.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="truncate text-muted-foreground text-xs">
                  {getVersionPreview(version.content)}
                </p>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRestore(version.version)}
                title="restore this version"
              >
                <ArrowCounterClockwise size={16} weight="duotone" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
