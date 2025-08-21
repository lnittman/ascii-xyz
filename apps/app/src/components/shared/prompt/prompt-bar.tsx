'use client';

import { PaperPlaneRight, Spinner } from '@phosphor-icons/react';
import { cn } from '@repo/design/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

export interface PromptBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  isSubmitting?: boolean;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  showButton?: boolean;
  minRows?: number;
  maxRows?: number;
  onFocus?: () => void;
  onBlur?: () => void;
}

const PromptBarComponent = ({
  value = '',
  onChange,
  onSubmit,
  isSubmitting = false,
  placeholder = 'type a message...',
  disabled = false,
  autoFocus = true,
  className,
  showButton = true,
  minRows = 1,
  maxRows = 5,
  onFocus,
  onBlur,
}: PromptBarProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [rows, setRows] = useState(minRows);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';

      const lineHeight = Number.parseInt(
        window.getComputedStyle(textarea).lineHeight
      );
      const paddingTop = Number.parseInt(
        window.getComputedStyle(textarea).paddingTop
      );
      const paddingBottom = Number.parseInt(
        window.getComputedStyle(textarea).paddingBottom
      );

      const scrollHeight = textarea.scrollHeight - paddingTop - paddingBottom;
      const calculatedRows = Math.ceil(scrollHeight / lineHeight);

      setRows(Math.min(Math.max(calculatedRows, minRows), maxRows));
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [value, minRows, maxRows]);

  // Auto-focus on mount if enabled
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (value.trim() && !isSubmitting && !disabled && onSubmit) {
        onSubmit(value);
      }
    },
    [value, isSubmitting, disabled, onSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  return (
    <motion.div
      className={cn(
        'relative flex items-end border bg-background transition-all duration-200',
        isFocused ? 'border-foreground/20' : 'border-border',
        disabled && 'opacity-50',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled || isSubmitting}
        rows={rows}
        className={cn(
          'flex-1 resize-none bg-transparent px-4 py-3 text-sm',
          'placeholder:text-muted-foreground focus:outline-none',
          'min-h-[48px]',
          !showButton && 'pr-4'
        )}
        style={{
          height: 'auto',
          overflowY: rows >= maxRows ? 'auto' : 'hidden',
        }}
      />

      {showButton && (
        <AnimatePresence mode="wait">
          <motion.button
            key={isSubmitting ? 'loading' : 'send'}
            type="button"
            onClick={() => handleSubmit()}
            disabled={!value.trim() || isSubmitting || disabled}
            className={cn(
              'p-3 transition-all duration-200',
              value.trim() && !isSubmitting && !disabled
                ? 'text-foreground hover:bg-muted'
                : 'cursor-not-allowed text-muted-foreground'
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            {isSubmitting ? (
              <Spinner className="h-5 w-5 animate-spin" />
            ) : (
              <PaperPlaneRight weight="regular" className="h-5 w-5" />
            )}
          </motion.button>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export const PromptBar = memo(PromptBarComponent);
