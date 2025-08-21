'use client';
import { CaretLeft } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom, useAtomValue } from 'jotai';

import { Button } from '@repo/design/components/ui/button';
import { cn } from '@repo/design/lib/utils';

import { chatOutputsAtom, outputPanelOpenAtom } from '@/atoms/layout/output';

export function OutputPanelToggle() {
  const [isOpen, setIsOpen] = useAtom(outputPanelOpenAtom);
  const outputs = useAtomValue(chatOutputsAtom);

  // Only show toggle when there are outputs
  if (outputs.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn('relative h-8 w-8', isOpen && 'bg-accent')}
        >
          <CaretLeft
            weight="duotone"
            className={cn(
              'h-4 w-4 transition-transform',
              !isOpen && 'rotate-180'
            )}
          />
          {outputs.length > 0 && !isOpen && (
            <span className="-top-1 -right-1 absolute h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
