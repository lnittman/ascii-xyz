'use client';
import { ScrollFadeContainer } from '@/components/shared/scroll-fade-container';
import {
  ChartLine,
  Code,
  FileHtml,
  FileJs,
  FileText,
  Notebook,
  PushPin,
  Table,
  TextAlignLeft,
} from '@phosphor-icons/react';
import { cn } from '@repo/design/lib/utils';

interface Output {
  id: string;
  title: string;
  type: string;
  messageId: string;
  createdAt: Date;
  isPinned: boolean;
}

interface OutputListProps {
  outputs: Output[];
  onSelectOutput: (outputId: string) => void;
}

export function OutputList({ outputs, onSelectOutput }: OutputListProps) {
  const getIcon = (type: string) => {
    const iconProps = { className: 'h-4 w-4', weight: 'duotone' } as const;

    switch (type) {
      case 'code':
        return <Code {...iconProps} />;
      case 'document':
        return <FileText {...iconProps} />;
      case 'markdown':
        return <Notebook {...iconProps} />;
      case 'json':
        return <FileJs {...iconProps} />;
      case 'html':
        return <FileHtml {...iconProps} />;
      case 'table':
        return <Table {...iconProps} />;
      case 'diagram':
        return <ChartLine {...iconProps} />;
      default:
        return <TextAlignLeft {...iconProps} />;
    }
  };

  // Sort outputs: pinned first, then by creation date (newest first)
  const sortedOutputs = [...outputs].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <ScrollFadeContainer className="flex-1" fadeColor="var(--sidebar)">
      <div className="py-2">
        {sortedOutputs.map((output) => (
          <button
            key={output.id}
            onClick={() => onSelectOutput(output.id)}
            className={cn(
              'w-full px-3 py-2 text-left transition-colors hover:bg-accent/50',
              'group relative flex items-center gap-3'
            )}
          >
            <div
              className={cn(
                'text-muted-foreground transition-colors group-hover:text-foreground'
              )}
            >
              {getIcon(output.type)}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium text-foreground text-sm group-hover:text-foreground">
                {output.title}
              </h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className={cn('text-muted-foreground text-xs')}>
                  {output.type}
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-muted-foreground text-xs">
                  {new Date(output.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {output.isPinned && (
              <PushPin
                weight="fill"
                className="absolute top-2.5 right-3 h-3 w-3 text-primary"
              />
            )}
          </button>
        ))}
      </div>
    </ScrollFadeContainer>
  );
}
