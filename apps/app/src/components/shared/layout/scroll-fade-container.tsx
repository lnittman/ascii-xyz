'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

/**
 * ScrollFadeContainer - A reusable component that adds dynamic fade overlays to scrollable content
 *
 * The fade overlays automatically appear/disappear based on scroll state:
 * - Top fade: Shows when content can be scrolled up
 * - Bottom fade: Shows when content can be scrolled down
 * - Left fade: Shows when content can be scrolled left
 * - Right fade: Shows when content can be scrolled right
 *
 * @example
 * // Vertical scrolling with top/bottom fades (like chat messages)
 * <ScrollFadeContainer showTop showBottom className="h-96">
 *   <div className="overflow-y-auto p-4">
 *     {longContent}
 *   </div>
 * </ScrollFadeContainer>
 *
 * @example
 * // Horizontal scrolling with left/right fades (like image gallery)
 * <ScrollFadeContainer showLeft showRight>
 *   <div className="flex overflow-x-auto gap-4 p-4">
 *     {images.map(img => <img key={img.id} src={img.src} />)}
 *   </div>
 * </ScrollFadeContainer>
 *
 * @example
 * // All directions with custom styling
 * <ScrollFadeContainer
 *   showTop showBottom showLeft showRight
 *   fadeSize={48}
 *   fadeColor="rgb(0, 0, 0)"
 *   animationDuration={0.3}
 * >
 *   <div className="overflow-auto w-full h-full p-4">
 *     {gridContent}
 *   </div>
 * </ScrollFadeContainer>
 *
 * @example
 * // With external ref and scroll state callback
 * const scrollRef = useRef(null);
 * const handleScrollState = (state) => {
 *   console.log('Can scroll up:', state.canScrollUp);
 * };
 *
 * <ScrollFadeContainer
 *   showTop showBottom
 *   containerRef={scrollRef}
 *   onScrollStateChange={handleScrollState}
 * >
 *   <div className="overflow-y-auto">
 *     {content}
 *   </div>
 * </ScrollFadeContainer>
 */

export interface ScrollState {
  canScrollUp: boolean;
  canScrollDown: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

interface ScrollFadeContainerProps {
  children: React.ReactNode;
  // Which sides to show fade overlays
  showTop?: boolean;
  showBottom?: boolean;
  showLeft?: boolean;
  showRight?: boolean;
  // Fade overlay customization
  fadeSize?: number; // Size of fade area in pixels
  fadeColor?: string; // CSS color for the fade (defaults to background)
  // Container styling
  className?: string;
  scrollableClassName?: string;
  // Animation settings
  animationDuration?: number;
  // Scroll container ref (optional, for external ref access)
  containerRef?: React.RefObject<HTMLDivElement | null>;
  // Scroll event callback
  onScrollStateChange?: (scrollState: ScrollState) => void;
}

// Memoized fade overlay components to prevent unnecessary re-renders
const TopFadeOverlay = memo(
  ({
    show,
    fadeSize = 32,
    fadeColor = 'var(--background)',
    animationDuration = 0.2,
  }: {
    show: boolean;
    fadeSize?: number;
    fadeColor?: string;
    animationDuration?: number;
  }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          key="top-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: animationDuration, ease: 'easeOut' }}
          className="pointer-events-none fixed right-0 left-0 z-20"
          style={{
            top: 'env(safe-area-inset-top, 0px)',
            height: `${fadeSize}px`,
            background: `linear-gradient(to bottom, ${fadeColor} 0%, transparent 100%)`,
          }}
        />
      )}
    </AnimatePresence>
  )
);

const BottomFadeOverlay = memo(
  ({
    show,
    fadeSize = 32,
    fadeColor = 'var(--background)',
    animationDuration = 0.2,
  }: {
    show: boolean;
    fadeSize?: number;
    fadeColor?: string;
    animationDuration?: number;
  }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          key="bottom-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: animationDuration, ease: 'easeOut' }}
          className="pointer-events-none fixed right-0 left-0 z-20"
          style={{
            bottom: 'env(safe-area-inset-bottom, 0px)',
            height: `${fadeSize}px`,
            background: `linear-gradient(to top, ${fadeColor} 0%, transparent 100%)`,
          }}
        />
      )}
    </AnimatePresence>
  )
);

const LeftFadeOverlay = memo(
  ({
    show,
    fadeSize = 32,
    fadeColor = 'var(--background)',
    animationDuration = 0.2,
  }: {
    show: boolean;
    fadeSize?: number;
    fadeColor?: string;
    animationDuration?: number;
  }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          key="left-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: animationDuration, ease: 'easeOut' }}
          className="pointer-events-none absolute top-0 bottom-0 left-0 z-10"
          style={{
            width: `${fadeSize}px`,
            background: `linear-gradient(to right, ${fadeColor} 0%, transparent 100%)`,
          }}
        />
      )}
    </AnimatePresence>
  )
);

const RightFadeOverlay = memo(
  ({
    show,
    fadeSize = 32,
    fadeColor = 'var(--background)',
    animationDuration = 0.2,
  }: {
    show: boolean;
    fadeSize?: number;
    fadeColor?: string;
    animationDuration?: number;
  }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          key="right-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: animationDuration, ease: 'easeOut' }}
          className="pointer-events-none absolute top-0 right-0 bottom-0 z-10"
          style={{
            width: `${fadeSize}px`,
            background: `linear-gradient(to left, ${fadeColor} 0%, transparent 100%)`,
          }}
        />
      )}
    </AnimatePresence>
  )
);

export const ScrollFadeContainer = ({
  children,
  showTop = false,
  showBottom = false,
  showLeft = false,
  showRight = false,
  fadeSize = 32,
  fadeColor = 'var(--background)',
  className = '',
  scrollableClassName = '',
  animationDuration = 0.2,
  containerRef: externalContainerRef,
  onScrollStateChange,
}: ScrollFadeContainerProps) => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    canScrollUp: false,
    canScrollDown: false,
    canScrollLeft: false,
    canScrollRight: false,
  });

  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef || internalContainerRef;

  // Use ref to store the latest callback to avoid stale closures
  const onScrollStateChangeRef = useRef(onScrollStateChange);
  onScrollStateChangeRef.current = onScrollStateChange;

  // Check scroll state with throttling to avoid excessive updates
  const checkScrollState = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
    } = container;

    // Small threshold to account for floating point precision - more sensitive for mobile
    const threshold = 0.5;

    const canScrollUp = scrollTop > threshold;
    // Check if there's actually scrollable content first
    const hasScrollableContent = scrollHeight > clientHeight + threshold;
    // Show bottom fade whenever there's scrollable content and we're not at the very bottom
    const canScrollDown =
      hasScrollableContent &&
      scrollTop + clientHeight < scrollHeight - threshold;
    const canScrollLeft = scrollLeft > threshold;
    const canScrollRight = scrollLeft < scrollWidth - clientWidth - threshold;

    const newScrollState = {
      canScrollUp,
      canScrollDown,
      canScrollLeft,
      canScrollRight,
    };

    setScrollState((prev) => {
      // Only update if something actually changed
      if (
        prev.canScrollUp !== canScrollUp ||
        prev.canScrollDown !== canScrollDown ||
        prev.canScrollLeft !== canScrollLeft ||
        prev.canScrollRight !== canScrollRight
      ) {
        // Call the callback if provided
        onScrollStateChangeRef.current?.(newScrollState);
        return newScrollState;
      }
      return prev;
    });
  }, []);

  // Throttled scroll handler
  const handleScroll = useCallback(() => {
    checkScrollState();
  }, [checkScrollState]);

  // Check scroll state on mount
  useEffect(() => {
    checkScrollState();
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Monitor for content changes that might affect scrollability
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        checkScrollState();
      });
    });

    resizeObserver.observe(container);

    // Initial check after mount
    requestAnimationFrame(() => {
      checkScrollState();
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkScrollState]);

  return (
    <div className={`relative ${className}`}>
      {/* Fade overlays */}
      {showTop && (
        <TopFadeOverlay
          show={scrollState.canScrollUp}
          fadeSize={fadeSize}
          fadeColor={fadeColor}
          animationDuration={animationDuration}
        />
      )}

      {showBottom && (
        <BottomFadeOverlay
          show={scrollState.canScrollDown}
          fadeSize={fadeSize}
          fadeColor={fadeColor}
          animationDuration={animationDuration}
        />
      )}

      {showLeft && (
        <LeftFadeOverlay
          show={scrollState.canScrollLeft}
          fadeSize={fadeSize}
          fadeColor={fadeColor}
          animationDuration={animationDuration}
        />
      )}

      {showRight && (
        <RightFadeOverlay
          show={scrollState.canScrollRight}
          fadeSize={fadeSize}
          fadeColor={fadeColor}
          animationDuration={animationDuration}
        />
      )}

      {/* Scrollable content */}
      <div ref={containerRef} className={`relative ${scrollableClassName}`}>
        {children}
      </div>
    </div>
  );
};
