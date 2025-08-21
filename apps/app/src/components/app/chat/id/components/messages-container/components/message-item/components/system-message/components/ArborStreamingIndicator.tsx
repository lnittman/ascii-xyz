'use client';

import { cn } from '@repo/design/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ArborStreamingIndicatorProps {
  isStreaming: boolean;
  className?: string;
}

export function ArborStreamingIndicator({
  isStreaming,
  className,
}: ArborStreamingIndicatorProps) {
  // Different ASCII shapes to morph between
  const shapes = ['▄█▄', '▀█▀', '◣◢', '◤◥', '▐█▌', '▄▀▄'];

  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [wasStreaming, setWasStreaming] = useState(false);

  // Track when streaming changes for fade out effect
  useEffect(() => {
    if (isStreaming) {
      setWasStreaming(true);
    } else if (wasStreaming) {
      // Add a small delay before stopping the animation to allow for smooth fade
      const timeout = setTimeout(() => {
        setWasStreaming(false);
      }, 300); // Match fade out duration
      return () => clearTimeout(timeout);
    }
  }, [isStreaming, wasStreaming]);

  // Cycle through shapes when streaming
  useEffect(() => {
    if (!isStreaming) {
      setCurrentShapeIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentShapeIndex((prev) => (prev + 1) % shapes.length);
    }, 400); // Change shape every 400ms

    return () => clearInterval(interval);
  }, [isStreaming, shapes.length]);

  return (
    <div
      className={cn(
        'relative inline-flex h-6 w-8 items-center justify-center',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {(isStreaming || wasStreaming) && (
          <motion.div
            key="streaming-indicator"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative h-full w-full"
          >
            {/* Base indicator with shape morphing */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentShapeIndex}
                className="absolute inset-0 flex select-none items-center justify-center font-mono text-[11px] leading-none"
                initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
                animate={{
                  opacity: isStreaming ? 0.9 : 0.3,
                  scale: 1,
                  rotate: 0,
                }}
                exit={{ opacity: 0, scale: 0.8, rotate: 180 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeInOut',
                }}
              >
                <span className="text-primary/70 drop-shadow-sm">
                  {shapes[currentShapeIndex]}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Glowing effect when actively streaming */}
            {isStreaming && (
              <>
                {/* Outer glow that pulses */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center font-mono text-[11px] leading-none blur-md"
                  animate={{
                    opacity: [0, 0.6, 0],
                    scale: [1, 1.4, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                >
                  <span className="text-primary/40">
                    {shapes[currentShapeIndex]}
                  </span>
                </motion.div>

                {/* Inner pulse with color shift */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center font-mono text-[11px] leading-none"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    filter: [
                      'hue-rotate(0deg)',
                      'hue-rotate(20deg)',
                      'hue-rotate(0deg)',
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                    delay: 0.2,
                  }}
                >
                  <span className="text-primary/80 mix-blend-screen">
                    {shapes[currentShapeIndex]}
                  </span>
                </motion.div>

                {/* Enhanced particle effects */}
                {[...new Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-1 w-1 rounded-full bg-primary/40"
                    initial={{
                      x: 0,
                      y: 0,
                      scale: 0,
                    }}
                    animate={{
                      x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 3), 0],
                      y: [0, (i < 2 ? -1 : 1) * (8 + i * 2), 0],
                      opacity: [0, 0.8, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeOut',
                      delay: i * 0.2,
                      repeatDelay: 0.5,
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
