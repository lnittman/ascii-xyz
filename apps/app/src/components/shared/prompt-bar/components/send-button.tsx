'use client';
import { rateLimitPresets, useRateLimit } from '@/hooks/use-rate-limit';
import { ArrowUp, SpinnerGap, Stop } from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

interface SendButtonProps {
  isLoading: boolean;
  hasInput: boolean;
  disabled?: boolean;
  onSubmit: () => void;
  onStop?: () => void;
}

export function SendButton({
  isLoading,
  hasInput,
  disabled = false,
  onSubmit,
  onStop,
}: SendButtonProps) {
  // Apply rate limiting to prevent message spam
  const { checkRateLimit, isLimited } = useRateLimit(rateLimitPresets.chat);

  const handleSubmit = () => {
    // Check rate limit before submitting
    if (checkRateLimit()) {
      onSubmit();
    }
  };
  // If we're loading and have a stop function, show stop button
  if (isLoading && onStop) {
    return (
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="flex h-8 w-8 items-center justify-center rounded-none text-muted-foreground transition-colors duration-300 hover:bg-accent/60 hover:text-foreground/75 active:bg-accent/80 active:text-foreground"
        onClick={onStop}
        aria-label="Stop generating"
      >
        <Stop weight="duotone" className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={`flex h-8 w-8 items-center justify-center rounded-none transition-all duration-300 ${
        hasInput && !isLoading && !isLimited
          ? 'bg-accent text-foreground hover:bg-accent/80 hover:text-foreground/80 active:text-foreground'
          : 'bg-accent/60 text-foreground/60 hover:bg-accent/80 hover:text-foreground/80'
      }`}
      onClick={handleSubmit}
      disabled={isLoading || !hasInput || disabled || isLimited}
      title={isLimited ? 'Rate limit exceeded. Please wait.' : undefined}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="spinner"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          >
            <SpinnerGap weight="bold" className="h-4 w-4 animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="arrow"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          >
            <ArrowUp weight="bold" className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
