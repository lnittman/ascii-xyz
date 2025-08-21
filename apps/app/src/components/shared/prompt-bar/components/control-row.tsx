'use client';

import { ModelPicker } from '@/components/code/ModelPicker';
import type { Attachment } from './attachment-row';
import { PlusMenu } from './plus-menu';
import { SendButton } from './send-button';

interface ControlRowProps {
  hasInput: boolean;
  isLoading: boolean;
  isDisabled?: boolean;
  onSubmit: () => void;
  onStop?: () => void;
  onFileSelect?: (files: FileList) => void;
  onScreenshotCapture?: (attachment: Attachment) => void;
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
}

export function ControlRow({
  hasInput,
  isLoading,
  isDisabled = false,
  onSubmit,
  onStop,
  onFileSelect,
  onScreenshotCapture,
  selectedModelId,
  onModelChange,
}: ControlRowProps) {
  return (
    <div className="flex items-center justify-between border-border/50 border-t p-2">
      <div className="flex items-center gap-2">
        <PlusMenu
          disabled={isLoading || isDisabled}
          onFileSelect={onFileSelect}
          onScreenshotCapture={onScreenshotCapture}
        />
        <ModelPicker
          disabled={isLoading || isDisabled}
          selectedModelId={selectedModelId}
          onModelChange={onModelChange}
        />
      </div>

      <div className="flex items-center gap-2">
        <SendButton
          isLoading={isLoading}
          disabled={isDisabled}
          hasInput={hasInput}
          onSubmit={onSubmit}
          onStop={onStop}
        />
      </div>
    </div>
  );
}
