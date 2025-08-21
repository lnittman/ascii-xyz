'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { AnimatePresence, motion } from 'framer-motion';

interface CustomTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
}

export const CustomTooltip = ({
  content,
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 5,
  className = '',
}: CustomTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle positioning of the tooltip
  useEffect(() => {
    if (isOpen && containerRef.current && tooltipRef.current) {
      const triggerRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let x = 0;
      let y = 0;

      // Handle vertical positioning based on side
      if (side === 'bottom') {
        y = triggerRect.bottom + window.scrollY + sideOffset;
      } else if (side === 'top') {
        y = triggerRect.top + window.scrollY - tooltipRect.height - sideOffset;
      } else if (side === 'right') {
        y =
          triggerRect.top +
          window.scrollY +
          triggerRect.height / 2 -
          tooltipRect.height / 2;
        x = triggerRect.right + window.scrollX + sideOffset;
      } else if (side === 'left') {
        y =
          triggerRect.top +
          window.scrollY +
          triggerRect.height / 2 -
          tooltipRect.height / 2;
        x = triggerRect.left + window.scrollX - tooltipRect.width - sideOffset;
      }

      // Handle horizontal alignment for top and bottom
      if (side === 'top' || side === 'bottom') {
        if (align === 'center') {
          // Precise centering calculation
          const triggerCenter = triggerRect.left + triggerRect.width / 2;
          x = triggerCenter + window.scrollX - tooltipRect.width / 2;
        } else if (align === 'start') {
          x = triggerRect.left + window.scrollX;
        } else if (align === 'end') {
          x = triggerRect.right + window.scrollX - tooltipRect.width;
        }
      }

      setPosition({ x, y });
    }
  }, [isOpen, side, align, sideOffset]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set a timer to show the tooltip after 600ms
    timerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 600);
  };

  const handleMouseLeave = () => {
    // Clear the timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Close the tooltip
    setIsOpen(false);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="inline-flex"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        {children}
      </div>

      {typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={tooltipRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.1 }}
                style={{
                  position: 'absolute',
                  top: position.y,
                  left: position.x,
                  zIndex: 1000,
                  pointerEvents: 'none',
                }}
                className="tooltip-container"
              >
                <div
                  className={`relative rounded-none border border-border/40 bg-background px-3 py-1.5 font-medium text-foreground text-xs ${className}`}
                  style={{ transform: 'translateX(0)' }} // Ensure no transform offset
                >
                  {content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
