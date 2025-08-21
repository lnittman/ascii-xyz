'use client';

import React, { useRef, useState, useCallback, memo } from 'react';

import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { v4 as uuidv4 } from 'uuid';

import { promptInputAtom } from '@/atoms/chat';
import { safariGPUAcceleration, useIsIOSSafari } from '@/lib/safari-utils';
import { cn } from '@repo/design/lib/utils';

import { type Attachment, AttachmentRow } from './components/attachment-row';
import { ControlRow } from './components/control-row';
import { PromptInput } from './components/prompt-input';

interface PromptBarProps {
  onSubmit?: (command: string, attachments?: Attachment[]) => void;
  stop?: () => void;
  isSubmitting?: boolean;
  isFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
  // Attachment modal handlers - optional
  onAttachmentPreview?: (attachment: Attachment) => void;
  // Model selection
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
  // Placeholder text
  placeholder?: string;
  // Disabled state
  disabled?: boolean;
  // Control whether to clear input after submission
  clearOnSubmit?: boolean;
}

const PromptBarComponent = ({
  onSubmit,
  stop,
  isSubmitting = false,
  isFocused = false,
  onFocusChange,
  onAttachmentPreview,
  selectedModelId,
  onModelChange,
  placeholder,
  disabled = false,
  clearOnSubmit = true,
}: PromptBarProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [promptInput, setPromptInput] = useAtom(promptInputAtom);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isIOSSafari = useIsIOSSafari();

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptInput(e.target.value);
  };

  // Focus the input
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle focus/blur for the prompt input
  const handleFocus = () => {
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    onFocusChange?.(false);
  };

  // Handle file selection from plus menu
  const handleFileSelect = useCallback((files: FileList) => {
    if (!files || files.length === 0) {
      return;
    }

    const newAttachments: Attachment[] = [];

    Array.from(files).forEach((file) => {
      // Create object URL for image previews
      const url = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;

      // Determine file type
      let fileType: Attachment['type'] = 'file';

      if (file.type.startsWith('image/')) {
        fileType = 'image';
      } else if (file.type.includes('pdf')) {
        fileType = 'pdf';
      } else if (file.type.includes('word') || file.type.includes('doc')) {
        fileType = 'doc';
      } else if (
        file.type.includes('spreadsheet') ||
        file.type.includes('excel') ||
        file.type.includes('csv')
      ) {
        fileType = 'spreadsheet';
      } else if (file.type.includes('audio')) {
        fileType = 'audio';
      } else if (file.type.includes('video')) {
        fileType = 'video';
      } else if (
        file.name.match(/\.(js|ts|py|java|c|cpp|html|css|jsx|tsx|php|rb|go)$/i)
      ) {
        fileType = 'code';
      }

      newAttachments.push({
        id: uuidv4(),
        name: file.name,
        type: fileType,
        size: file.size,
        url, // URL for image previews
        metadata: {
          file,
          mimeType: file.type,
        },
      });
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
  }, []);

  // Handle screenshot capture
  const handleScreenshotCapture = useCallback((screenshot: Attachment) => {
    setAttachments((prev) => [...prev, screenshot]);
  }, []);

  // Handle long text paste
  const handleLongPaste = (text: string, fileName: string) => {
    const newAttachment: Attachment = {
      id: uuidv4(),
      name: fileName,
      type: 'text',
      size: new Blob([text]).size,
      content: text,
    };

    setAttachments((prev) => [...prev, newAttachment]);
  };

  // Remove an attachment
  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => {
      const updatedAttachments = prev.filter((att) => att.id !== id);

      // Revoke object URLs to prevent memory leaks
      const removedAttachment = prev.find((att) => att.id === id);
      if (removedAttachment?.url && removedAttachment.type === 'image') {
        URL.revokeObjectURL(removedAttachment.url);
      }

      return updatedAttachments;
    });
  };

  // Handle attachment click to show preview/modal
  const handleAttachmentClick = (attachment: Attachment) => {
    onAttachmentPreview?.(attachment);
  };

  // Handle submit action
  const handleSubmit = () => {
    // Only allow submission if we have input text or attachments and aren't already processing or disabled
    if (
      (promptInput?.trim() || attachments.length > 0) &&
      !isSubmitting &&
      !disabled
    ) {
      // Call the handler if provided
      if (onSubmit) {
        onSubmit(promptInput, attachments.length > 0 ? attachments : undefined);

        // Clean up any object URLs before clearing
        attachments.forEach((att) => {
          if (att.url && att.type === 'image') {
            URL.revokeObjectURL(att.url);
          }
        });

        // Clear input after submission only if clearOnSubmit is true
        if (clearOnSubmit) {
          setPromptInput('');
          setAttachments([]);
        } else {
          // Always clear attachments but keep the prompt
          setAttachments([]);
        }
      }
    }
  };

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      // Cleanup function to revoke all object URLs
      attachments.forEach((att) => {
        if (att.url && att.type === 'image') {
          URL.revokeObjectURL(att.url);
        }
      });
    };
  }, []);

  // Use CSS transitions for iOS Safari to prevent flickering
  if (isIOSSafari) {
    return (
      <div
        onClick={focusInput}
        className={cn(
          'relative z-50 flex w-full max-w-2xl flex-col justify-between rounded-none border bg-muted/40 transition-all duration-300',
          'safari-gpu-accelerated safari-prompt-bar',
          isFocused
            ? 'border-primary/10'
            : 'border-border/50 hover:border-border'
        )}
        style={safariGPUAcceleration}
      >
        {/* Fixed content that doesn't move */}
        <div className="flex min-h-[40px] flex-col">
          <PromptInput
            isDisabled={isSubmitting || disabled}
            inputRef={inputRef}
            value={promptInput || ''}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onLongPaste={handleLongPaste}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            minRows={1}
          />

          <ControlRow
            hasInput={!!promptInput?.trim() || attachments.length > 0}
            isLoading={isSubmitting}
            isDisabled={disabled}
            onSubmit={handleSubmit}
            onStop={stop}
            onFileSelect={handleFileSelect}
            onScreenshotCapture={handleScreenshotCapture}
            selectedModelId={selectedModelId}
            onModelChange={onModelChange}
          />
        </div>

        {/* Attachment area with smooth animation */}
        <AttachmentRow
          attachments={attachments}
          onRemoveAttachment={handleRemoveAttachment}
          onAttachmentClick={handleAttachmentClick}
        />
      </div>
    );
  }

  // Standard Framer Motion version for other browsers
  return (
    <motion.div
      onClick={focusInput}
      className={cn(
        'relative z-50 flex w-full max-w-2xl flex-col justify-between rounded-none border bg-muted/40 transition-all duration-300',
        isFocused ? 'border-primary/10' : 'border-border/50 hover:border-border'
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Fixed content that doesn't move */}
      <div className="flex min-h-[40px] flex-col">
        <PromptInput
          isDisabled={isSubmitting || disabled}
          inputRef={inputRef}
          value={promptInput || ''}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onLongPaste={handleLongPaste}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          minRows={1}
        />

        <ControlRow
          hasInput={!!promptInput?.trim() || attachments.length > 0}
          isLoading={isSubmitting}
          isDisabled={disabled}
          onSubmit={handleSubmit}
          onStop={stop}
          onFileSelect={handleFileSelect}
          onScreenshotCapture={handleScreenshotCapture}
          selectedModelId={selectedModelId}
          onModelChange={onModelChange}
        />
      </div>

      {/* Attachment area with smooth animation */}
      <AttachmentRow
        attachments={attachments}
        onRemoveAttachment={handleRemoveAttachment}
        onAttachmentClick={handleAttachmentClick}
      />
    </motion.div>
  );
};

// Export memoized component - leaf component that receives many props
export const PromptBar = memo(PromptBarComponent);
