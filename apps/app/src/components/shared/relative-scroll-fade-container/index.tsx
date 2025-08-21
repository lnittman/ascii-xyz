'use client';

import { cn } from '@repo/design/lib/utils';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * RelativeScrollFadeContainer - A lightweight scroll fade container for modals and dropdowns
 *
 * Unlike ScrollFadeContainer which uses fixed positioning (suitable for full-page scroll areas),
 * this component uses absolute positioning making it perfect for:
 * - Modal content areas
 * - Dropdown menus
 * - Nested scrollable regions
 * - Any container where you need fade effects relative to the container, not the viewport
 *
 * @example
 * // Basic usage in a modal
 * <RelativeScrollFadeContainer className="flex-1">
 *   <div className="p-4">
 *     {longContent}
 *   </div>
 * </RelativeScrollFadeContainer>
 *
 * @example
 * // Custom fade colors and sizes
 * <RelativeScrollFadeContainer
 *   fadeColor="var(--popover)"
 *   fadeSize={32}
 *   className="h-64"
 * >
 *   {items.map(item => <Item key={item.id} {...item} />)}
 * </RelativeScrollFadeContainer>
 *
 * @example
 * // Horizontal scrolling
 * <RelativeScrollFadeContainer
 *   orientation="horizontal"
 *   className="w-full"
 * >
 *   <div className="flex gap-4 p-4">
 *     {images.map(img => <img key={img.id} src={img.src} />)}
 *   </div>
 * </RelativeScrollFadeContainer>
 */

interface RelativeScrollFadeContainerProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  fadeColor?: string;
  fadeSize?: number;
  orientation?: 'vertical' | 'horizontal';
  showStartFade?: boolean;
  showEndFade?: boolean;
}

export function RelativeScrollFadeContainer({
  children,
  className = '',
  contentClassName = '',
  fadeColor = 'var(--background)',
  fadeSize = 24,
  orientation = 'vertical',
  showStartFade = true,
  showEndFade = true,
}: RelativeScrollFadeContainerProps) {
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    if (orientation === 'vertical') {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setCanScrollStart(scrollTop > 1);
      setCanScrollEnd(scrollTop < scrollHeight - clientHeight - 1);
    } else {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollStart(scrollLeft > 1);
      setCanScrollEnd(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, [orientation]);

  useEffect(() => {
    checkScroll();
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    // Use ResizeObserver to detect content changes
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  const isVertical = orientation === 'vertical';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Start fade (top or left) */}
      {showStartFade && canScrollStart && (
        <div
          className={cn(
            'pointer-events-none absolute z-10',
            isVertical ? 'top-0 right-0 left-0' : 'top-0 bottom-0 left-0'
          )}
          style={{
            [isVertical ? 'height' : 'width']: `${fadeSize}px`,
            background: isVertical
              ? `linear-gradient(to bottom, ${fadeColor} 0%, transparent 100%)`
              : `linear-gradient(to right, ${fadeColor} 0%, transparent 100%)`,
          }}
        />
      )}

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className={cn(
          isVertical ? 'overflow-y-auto' : 'overflow-x-auto',
          'h-full',
          contentClassName
        )}
      >
        {children}
      </div>

      {/* End fade (bottom or right) */}
      {showEndFade && canScrollEnd && (
        <div
          className={cn(
            'pointer-events-none absolute z-10',
            isVertical ? 'right-0 bottom-0 left-0' : 'top-0 right-0 bottom-0'
          )}
          style={{
            [isVertical ? 'height' : 'width']: `${fadeSize}px`,
            background: isVertical
              ? `linear-gradient(to top, ${fadeColor} 0%, transparent 100%)`
              : `linear-gradient(to left, ${fadeColor} 0%, transparent 100%)`,
          }}
        />
      )}
    </div>
  );
}

/**
 * StaticRelativeScrollFade - A simpler version that always shows fade gradients
 *
 * Use this when you want fade gradients that are always visible regardless of scroll state.
 * This is useful for:
 * - Containers where content is guaranteed to overflow
 * - Design consistency when you always want the fade effect
 * - Performance optimization (no scroll listeners)
 *
 * @example
 * <StaticRelativeScrollFade className="h-64">
 *   <div className="p-4">
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *   </div>
 * </StaticRelativeScrollFade>
 */
export function StaticRelativeScrollFade({
  children,
  className = '',
  contentClassName = '',
  fadeColor = 'var(--background)',
  fadeSize = 24,
  orientation = 'vertical',
}: Omit<RelativeScrollFadeContainerProps, 'showStartFade' | 'showEndFade'>) {
  const isVertical = orientation === 'vertical';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Top/Left fade gradient */}
      <div
        className={cn(
          'pointer-events-none absolute z-10',
          isVertical ? 'top-0 right-0 left-0' : 'top-0 bottom-0 left-0'
        )}
        style={{
          [isVertical ? 'height' : 'width']: `${fadeSize}px`,
          background: isVertical
            ? `linear-gradient(to bottom, ${fadeColor} 0%, transparent 100%)`
            : `linear-gradient(to right, ${fadeColor} 0%, transparent 100%)`,
        }}
      />

      {/* Scrollable content */}
      <div
        className={cn(
          isVertical ? 'overflow-y-auto' : 'overflow-x-auto',
          'h-full',
          contentClassName
        )}
      >
        {children}
      </div>

      {/* Bottom/Right fade gradient */}
      <div
        className={cn(
          'pointer-events-none absolute z-10',
          isVertical ? 'right-0 bottom-0 left-0' : 'top-0 right-0 bottom-0'
        )}
        style={{
          [isVertical ? 'height' : 'width']: `${fadeSize}px`,
          background: isVertical
            ? `linear-gradient(to top, ${fadeColor} 0%, transparent 100%)`
            : `linear-gradient(to left, ${fadeColor} 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}
