'use client';
import { ArrowRight } from '@phosphor-icons/react';
import { useSetAtom } from 'jotai';

import {
  outputPanelOpenAtom,
  selectedOutputIdAtom,
} from '@/atoms/layout/output';

interface OutputToolCardProps {
  toolCallId: string;
  result: {
    id: string;
    title: string;
    type: string;
    content?: string;
    metadata?: Record<string, any>;
    created: boolean;
  };
  messageId: string;
}

export function OutputToolCard({
  toolCallId,
  result,
  messageId,
}: OutputToolCardProps) {
  const setOutputPanelOpen = useSetAtom(outputPanelOpenAtom);
  const setSelectedOutputId = useSetAtom(selectedOutputIdAtom);

  const handleClick = () => {
    // Select this output and open the panel
    setSelectedOutputId(result.id);
    setOutputPanelOpen(true);
  };

  return (
    <div
      className="my-2 h-9 cursor-pointer overflow-hidden border border-border/40 transition-colors hover:border-border"
      onClick={handleClick}
    >
      <div className="flex h-full items-center justify-between bg-purple-500/5 px-3 text-muted-foreground text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-purple-600">output:</span>
          <span className="max-w-[220px] truncate">{result.title}</span>
          <span className="text-muted-foreground/70">({result.type})</span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/70" />
      </div>
    </div>
  );
}
