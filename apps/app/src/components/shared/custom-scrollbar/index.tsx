'use client';

import { motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface CustomScrollbarProps {
  targetRef: React.RefObject<HTMLElement | null>;
  className?: string;
}

export function CustomScrollbar({
  targetRef,
  className = '',
}: CustomScrollbarProps) {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(100); // Default to full height
  const [isDragging, setIsDragging] = useState(false);
  const [hasScrollableContent, setHasScrollableContent] = useState(false);
  const [containerBounds, setContainerBounds] = useState({
    top: 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 1000,
  });
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 50; // Allow more retries for fresh page loads

  // Track mount state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Calculate scrollbar visibility and thumb position
  const updateScrollbar = useCallback(() => {
    if (!isMounted) {
      return;
    }

    if (!targetRef.current) {
      // Set fallback state when no target
      setContainerBounds({
        top: 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 1000,
      });
      setHasScrollableContent(false);
      setScrollPercentage(0);
      setThumbHeight(100);

      // Retry if we haven't exceeded max retries
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        setTimeout(() => {
          if (isMounted) {
            updateScrollbar();
          }
        }, 100);
      }
      return;
    }

    // Reset retry count when we have a target
    retryCountRef.current = 0;

    try {
      const target = targetRef.current;
      const { scrollTop, scrollHeight, clientHeight } = target;

      // Get the container's position on the page
      const rect = target.getBoundingClientRect();

      // Only update if we have valid dimensions
      if (rect.height > 0) {
        setContainerBounds({
          top: rect.top,
          height: rect.height,
        });

        // Mark as initialized once we have valid bounds
        if (!isInitialized) {
          setIsInitialized(true);
        }
      }

      // Check if content is scrollable
      const isScrollable = scrollHeight > clientHeight && clientHeight > 0;
      setHasScrollableContent(isScrollable);

      if (isScrollable) {
        // Calculate scroll percentage
        const maxScroll = scrollHeight - clientHeight;
        const percentage = maxScroll > 0 ? scrollTop / maxScroll : 0;
        setScrollPercentage(Math.max(0, Math.min(1, percentage)));

        // Calculate thumb height as a percentage of track height
        const viewportRatio = clientHeight / scrollHeight;
        const thumbHeightPercentage = Math.max(viewportRatio * 100, 10); // Minimum 10%
        setThumbHeight(Math.min(100, thumbHeightPercentage));
      } else {
        // No scrollable content - thumb takes full height
        setScrollPercentage(0);
        setThumbHeight(100);
      }
    } catch (_error) {
      // Set safe fallback state
      setHasScrollableContent(false);
      setScrollPercentage(0);
      setThumbHeight(100);
    }
  }, [targetRef, isMounted, isInitialized]);

  // Handle scroll events
  useEffect(() => {
    if (!targetRef.current) {
      // If target doesn't exist yet, set up a retry mechanism
      const retryTimer = setTimeout(() => {
        if (targetRef.current) {
          updateScrollbar();
        }
      }, 100);

      return () => clearTimeout(retryTimer);
    }

    const target = targetRef.current;
    target.addEventListener('scroll', updateScrollbar);

    // Force initial calculation
    updateScrollbar();

    // Use a slight delay to ensure DOM is fully rendered
    const initialTimer = setTimeout(() => {
      updateScrollbar();
    }, 50);

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      // Add a small delay to ensure the resize is complete
      setTimeout(updateScrollbar, 10);
    });
    resizeObserver.observe(target);

    // Also observe window resize
    const handleWindowResize = () => {
      setTimeout(updateScrollbar, 10);
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      target.removeEventListener('scroll', updateScrollbar);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      clearTimeout(initialTimer);
    };
  }, [updateScrollbar, targetRef]);

  // Force update when targetRef changes (new chat loaded)
  useEffect(() => {
    if (!isMounted) {
      return;
    }

    // Reset retry count and state when target changes
    retryCountRef.current = 0;
    setScrollPercentage(0);
    setThumbHeight(100);
    setHasScrollableContent(false);

    if (targetRef.current) {
      // For fresh page loads, start with more aggressive retry pattern
      const timers = [
        setTimeout(() => isMounted && updateScrollbar(), 0),
        setTimeout(() => isMounted && updateScrollbar(), 50),
        setTimeout(() => isMounted && updateScrollbar(), 100),
        setTimeout(() => isMounted && updateScrollbar(), 200),
        setTimeout(() => isMounted && updateScrollbar(), 400),
        setTimeout(() => isMounted && updateScrollbar(), 800),
        setTimeout(() => isMounted && updateScrollbar(), 1200),
      ];

      return () => {
        timers.forEach((timer) => clearTimeout(timer));
      };
    }
    // If no target, set default container bounds and start retry mechanism
    setContainerBounds({
      top: 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 1000,
    });

    // Start retry mechanism for fresh page loads
    updateScrollbar();
  }, [targetRef.current, updateScrollbar, isMounted]);

  // Handle scrollbar click and drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (
        !targetRef.current ||
        !scrollbarRef.current ||
        !hasScrollableContent
      ) {
        return;
      }

      e.preventDefault();
      setIsDragging(true);

      const scrollbarRect = scrollbarRef.current.getBoundingClientRect();
      const target = targetRef.current;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const relativeY = moveEvent.clientY - scrollbarRect.top;
        const percentage = Math.max(
          0,
          Math.min(1, relativeY / scrollbarRect.height)
        );

        const maxScroll = target.scrollHeight - target.clientHeight;
        target.scrollTop = percentage * maxScroll;
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [targetRef, hasScrollableContent]
  );

  // Handle track click (jump to position)
  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (
        !targetRef.current ||
        !scrollbarRef.current ||
        e.target === thumbRef.current ||
        !hasScrollableContent
      ) {
        return;
      }

      const scrollbarRect = scrollbarRef.current.getBoundingClientRect();
      const relativeY = e.clientY - scrollbarRect.top;
      const percentage = Math.max(
        0,
        Math.min(1, relativeY / scrollbarRect.height)
      );

      const target = targetRef.current;
      const maxScroll = target.scrollHeight - target.clientHeight;
      target.scrollTop = percentage * maxScroll;
    },
    [targetRef, hasScrollableContent]
  );

  // Don't render until properly initialized
  if (!isMounted || !isInitialized) {
    return null;
  }

  return (
    <motion.div
      ref={scrollbarRef}
      className={`fixed top-0 right-0 bottom-0 w-3 bg-border/40 transition-all hover:bg-border/60 ${className}`}
      style={{
        top: containerBounds.top,
        height: containerBounds.height,
        zIndex: 9999, // Ensure it's above everything
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={handleTrackClick}
    >
      {/* Scrollbar thumb */}
      <motion.div
        ref={thumbRef}
        className={`absolute right-0 w-full rounded-none transition-colors ${
          hasScrollableContent
            ? 'cursor-pointer bg-foreground/40 hover:bg-foreground/60'
            : 'cursor-default bg-foreground/20'
        } ${isDragging ? 'bg-foreground/80' : ''}`}
        style={{
          height: `${thumbHeight}%`,
          top: `${scrollPercentage * (100 - thumbHeight)}%`,
        }}
        onMouseDown={handleMouseDown}
        animate={{
          scale: hasScrollableContent && !isDragging ? 1 : 1,
        }}
        whileHover={
          hasScrollableContent
            ? { backgroundColor: 'rgba(var(--foreground-rgb), 0.6)' }
            : {}
        }
      />
    </motion.div>
  );
}
