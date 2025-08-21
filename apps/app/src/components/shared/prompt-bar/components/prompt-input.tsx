'use client';

import type React from 'react';

import { Textarea } from '@repo/design/components/ui/textarea';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';

// Constants for text length thresholds
const MAX_DIRECT_INPUT_CHARS = 5000;

interface PromptInputProps {
  value: string;
  inputRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  isDisabled: boolean;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onLongPaste?: (text: string, fileName: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  minRows?: number;
}

export function PromptInput({
  value,
  inputRef,
  isDisabled,
  placeholder = 'what do you want to know?',
  onChange,
  onSubmit,
  onLongPaste,
  onFocus,
  onBlur,
  minRows = 1,
}: PromptInputProps) {
  const isMobile = useIsMobile();

  // Calculate number of rows based on content
  const inputLines = value?.split('\n') || [''];
  const calculatedRows = inputLines.length > 16 ? 16 : inputLines.length;
  const rows = Math.max(calculatedRows, minRows);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      // Handle Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux) first
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        onSubmit();
        return;
      }

      // On mobile, always just insert a newline
      if (isMobile) {
        // Do nothing, let the default behavior happen (newline)
        return;
      }

      // On desktop, submit on Enter if Shift or Alt is pressed
      if (e.shiftKey || e.altKey) {
        e.preventDefault();
        onSubmit();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');

    // Check if the pasted text is very long
    if (pastedText.length > MAX_DIRECT_INPUT_CHARS && onLongPaste) {
      e.preventDefault(); // Prevent the default paste

      // Generate a filename based on the first line or characters
      const firstLine = pastedText.split('\n')[0].trim();
      const fileName =
        firstLine.length > 0
          ? `${firstLine.substring(0, 30)}${firstLine.length > 30 ? '...' : ''}.txt`
          : `pasted_text_${new Date().toISOString().substring(0, 19).replace(/:/g, '-')}.txt`;

      // Call the handler to create a text attachment instead
      onLongPaste(pastedText, fileName);
    }
  };

  return (
    <div className="relative flex items-center">
      <Textarea
        ref={inputRef}
        id="command-input"
        className={
          '!border-0 !ring-0 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0 focus:!outline-none focus:!border-0 resize-none bg-transparent px-3 pt-2 text-foreground placeholder:select-none placeholder:text-muted-foreground'
        }
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={isDisabled}
        rows={rows}
        spellCheck="false"
        autoCorrect="off"
      />
    </div>
  );
}
