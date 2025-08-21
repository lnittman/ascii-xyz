'use client';

import {
  ArrowsOut,
  CaretLeft,
  Copy,
  Download,
  PushPin,
  X,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { Button } from '@repo/design/components/ui/button';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { cn } from '@repo/design/lib/utils';

import {
  filteredChatOutputsAtom,
  outputPanelOpenAtom,
  selectedOutputIdAtom,
} from '@/atoms/layout/output';
import { OutputContent } from './components/OutputContent';
import { OutputList } from './components/OutputList';

export function OutputPanel() {
  const { isMobile, ready } = useIsMobile();
  const [isOpen, setIsOpen] = useAtom(outputPanelOpenAtom);
  const [selectedOutputId, setSelectedOutputId] = useAtom(selectedOutputIdAtom);
  const [outputs] = useAtom(filteredChatOutputsAtom);

  // Track if initial load is complete to prevent animations on first render
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!ready) {
    return null;
  }

  // Find selected output
  const selectedOutput = outputs.find((o) => o.id === selectedOutputId);

  return (
    <>
      {/* Mobile overlay when panel is open */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            className="fixed inset-0 z-[240] bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Output panel - slides in from the right */}
      <motion.div
        className="fixed top-0 right-0 bottom-0 z-[260] flex flex-col overflow-hidden border-border border-l bg-sidebar"
        initial={{
          width: isMobile ? (isOpen ? '100%' : 0) : isOpen ? 480 : 0,
          borderLeftWidth: isOpen ? '1px' : '0px',
        }}
        animate={{
          width: isMobile ? (isOpen ? '100%' : 0) : isOpen ? 480 : 0,
          borderLeftWidth: isOpen ? '1px' : '0px',
          transition: {
            duration: initialLoadComplete ? 0.3 : 0,
            ease: [0.32, 0.72, 0, 1],
          },
        }}
      >
        <div className="flex h-full flex-col">
          {/* Header - matching sidebar header style */}
          <div className="flex h-12 items-center justify-between border-border border-b px-3">
            <div className="flex items-center gap-2">
              <h2 className="font-medium text-foreground text-sm">outputs</h2>
              {outputs.length > 0 && (
                <span className="text-muted-foreground text-xs">
                  {outputs.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-0.5">
              {selectedOutput && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none hover:bg-accent/60"
                    onClick={() => {
                      // Pin/unpin functionality
                    }}
                  >
                    <PushPin
                      weight="duotone"
                      className={cn(
                        'h-4 w-4',
                        selectedOutput.isPinned
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none hover:bg-accent/60"
                    onClick={() => {
                      // Copy to clipboard functionality
                      if (selectedOutput.content) {
                        navigator.clipboard.writeText(selectedOutput.content);
                      }
                    }}
                  >
                    <Copy
                      weight="duotone"
                      className="h-4 w-4 text-muted-foreground"
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none hover:bg-accent/60"
                    onClick={() => {
                      // Download functionality
                    }}
                  >
                    <Download
                      weight="duotone"
                      className="h-4 w-4 text-muted-foreground"
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none hover:bg-accent/60"
                    onClick={() => {
                      // Expand/fullscreen functionality
                    }}
                  >
                    <ArrowsOut
                      weight="duotone"
                      className="h-4 w-4 text-muted-foreground"
                    />
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none hover:bg-accent/60"
                onClick={() => setIsOpen(false)}
              >
                <X weight="duotone" className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Navigation back to list */}
          <AnimatePresence mode="wait">
            {selectedOutput && outputs.length > 1 && (
              <motion.button
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedOutputId(null)}
                className="flex items-center gap-2 border-border border-b px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-accent/50 hover:text-foreground"
              >
                <CaretLeft weight="duotone" className="h-4 w-4" />
                <span>back to outputs</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Content area */}
          <div className="flex flex-1 overflow-hidden">
            {outputs.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-8">
                <p className="text-center text-muted-foreground text-sm">
                  no outputs yet
                  <br />
                  <span className="text-xs">
                    outputs will appear here when generated
                  </span>
                </p>
              </div>
            ) : selectedOutput ? (
              <OutputContent output={selectedOutput} />
            ) : (
              <OutputList
                outputs={outputs}
                onSelectOutput={setSelectedOutputId}
              />
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
