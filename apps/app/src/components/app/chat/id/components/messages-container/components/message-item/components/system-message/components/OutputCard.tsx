'use client';
import { ArrowRight } from '@phosphor-icons/react';
import { useAtomValue, useSetAtom } from 'jotai';

import {
  chatOutputsAtom,
  currentChatIdAtom,
  outputPanelOpenAtom,
  selectedOutputIdAtom,
} from '@/atoms/layout/output';

interface OutputCardProps {
  outputId: string;
  title: string;
  type: string;
  messageId: string;
}

export function OutputCard({
  outputId,
  title,
  type,
  messageId,
}: OutputCardProps) {
  const setOutputPanelOpen = useSetAtom(outputPanelOpenAtom);
  const setSelectedOutputId = useSetAtom(selectedOutputIdAtom);
  const setChatOutputs = useSetAtom(chatOutputsAtom);
  const currentChatId = useAtomValue(currentChatIdAtom);

  const handleClick = () => {
    // Add this output to the chat outputs if not already there
    setChatOutputs((prev) => {
      const exists = prev.some((o) => o.id === outputId);
      if (!exists && currentChatId) {
        return [
          ...prev,
          {
            id: outputId,
            title,
            type,
            messageId,
            chatId: currentChatId,
            createdAt: new Date(),
            isPinned: false,
          },
        ];
      }
      return prev;
    });

    // Set this as the selected output
    setSelectedOutputId(outputId);

    // Open the output panel
    setOutputPanelOpen(true);
  };

  return (
    <div
      className={
        'my-2 h-9 cursor-pointer overflow-hidden border border-border/40 transition-colors hover:border-border'
      }
      onClick={handleClick}
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
