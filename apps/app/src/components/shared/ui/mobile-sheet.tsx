'use client';

import { isMobileMenuOpenAtom } from '@/atoms/mobile-menus';
import { X } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import type React from 'react';
import { useEffect } from 'react';

interface MobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  customHeader?: boolean; // When true, title takes full width without h2 wrapper
  showCloseButton?: boolean;
  position?: 'top' | 'bottom';
  spacing?: 'sm' | 'md' | 'lg'; // sm=10px, md=18px, lg=26px from all edges
  children: React.ReactNode;
  className?: string;
  contentHeight?: 'auto' | 'fill' | 'full'; // 'auto' for feedback, 'fill' for notifications, 'full' for nearly fullscreen
}

// Hook to auto-close mobile overlays when transitioning to desktop
function useAutoCloseOnDesktop(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleResize = () => {
      // Close immediately if screen becomes larger than mobile breakpoint (1024px)
      if (window.innerWidth >= 1024) {
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);

    // Check immediately in case we're already on desktop
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, onClose]);
}

export function MobileSheet({
  isOpen,
  onClose,
  title,
  customHeader = false,
  showCloseButton = false,
  position = 'bottom',
  spacing = 'lg',
  children,
  className,
  contentHeight = 'auto',
}: MobileSheetProps) {
  const [, setIsMobileMenuOpen] = useAtom(isMobileMenuOpenAtom);

  // Manage global mobile menu state
  useEffect(() => {
    if (isOpen) {
      setIsMobileMenuOpen(true);
    } else {
      // Modal is closing - close global state immediately so blur overlay fades out in sync
      setIsMobileMenuOpen(false);
    }
  }, [isOpen, setIsMobileMenuOpen]);

  // Auto-close when transitioning to desktop
  useAutoCloseOnDesktop(isOpen, onClose);

  // Enhanced close handler
  const handleClose = () => {
    onClose();
  };

  // Define spacing values
  const getSpacingClass = () => {
    const horizontalSpacing =
      spacing === 'sm'
        ? 'left-2.5 right-2.5'
        : spacing === 'md'
          ? ''
          : 'left-6.5 right-6.5';

    if (contentHeight === 'full') {
      if (spacing === 'sm') {
        return `${horizontalSpacing} top-2.5 bottom-2.5`;
      }
      if (spacing === 'md') {
        return `${horizontalSpacing} top-4.5 bottom-4.5`;
      }
      return `${horizontalSpacing} top-6.5 bottom-6.5`;
    }

    const verticalSpacing =
      position === 'top'
        ? spacing === 'sm'
          ? 'top-2.5'
          : spacing === 'md'
            ? 'top-4.5'
            : 'top-6.5'
        : spacing === 'sm'
          ? 'bottom-2.5'
          : spacing === 'md'
            ? 'bottom-4.5'
            : 'bottom-6.5';

    return `${horizontalSpacing} ${verticalSpacing}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300]" onClick={handleClose}>
          {/* Sheet content - positioned from top or bottom */}
          <motion.div
            initial={{
              opacity: 0,
              y: position === 'top' ? -50 : 50,
            }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: position === 'top' ? -50 : 50,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
            className={cn('absolute', getSpacingClass())}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                'overflow-hidden rounded-none border border-border bg-background font-mono text-sm shadow-2xl',
                className
              )}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between border-border border-b px-6 py-4">
                  {customHeader ? (
                    <>
                      {title}
                      <button
                        onClick={handleClose}
                        className={cn(
                          'ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-none border border-border bg-muted/20 text-muted-foreground transition-all duration-200',
                          'hover:border-foreground/20 hover:bg-muted/40 hover:text-foreground',
                          'focus:outline-none focus:ring-2 focus:ring-foreground/20'
                        )}
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" weight="duotone" />
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="font-medium text-foreground text-lg">
                        {title}
                      </h2>
                      <button
                        onClick={handleClose}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-none border border-border bg-muted/20 text-muted-foreground transition-all duration-200',
                          'hover:border-foreground/20 hover:bg-muted/40 hover:text-foreground',
                          'focus:outline-none focus:ring-2 focus:ring-foreground/20'
                        )}
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" weight="duotone" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Content */}
              <div
                className={cn(
                  contentHeight === 'full'
                    ? 'h-full'
                    : contentHeight === 'fill'
                      ? 'h-[65vh]'
                      : 'max-h-[60vh]',
                  'overflow-y-auto'
                )}
              >
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
