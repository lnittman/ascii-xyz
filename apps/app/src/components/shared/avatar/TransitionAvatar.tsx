'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/design/components/ui/avatar';
import { cn } from '@repo/design/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface TransitionAvatarProps {
  src?: string | null;
  alt?: string;
  fallback: React.ReactNode;
  className?: string;
  imageClassName?: string;
  overlay?: React.ReactNode;
  skipInitialAnimation?: boolean;
}

export function TransitionAvatar({
  src,
  alt = 'Avatar',
  fallback,
  className,
  imageClassName,
  overlay,
  skipInitialAnimation = false,
}: TransitionAvatarProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [nextSrc, setNextSrc] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const prevSrcRef = useRef(src);

  useEffect(() => {
    // If src changed and we have a new image URL
    if (src !== prevSrcRef.current && src) {
      if (currentSrc) {
        // We have an existing image, so prepare for transition
        setNextSrc(src);
        setIsTransitioning(true);

        // Preload the new image
        const img = new Image();
        img.onload = () => {
          setImageLoaded(true);
        };
        img.src = src;
      } else {
        // No existing image, just set it directly
        setCurrentSrc(src);
      }
    } else if (!src && currentSrc) {
      // Image was removed, transition to fallback
      setIsTransitioning(true);
      setNextSrc(null);
    }

    prevSrcRef.current = src;
  }, [src, currentSrc]);

  // Handle the actual transition after image loads
  useEffect(() => {
    if (isTransitioning && (imageLoaded || nextSrc === null)) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setCurrentSrc(nextSrc);
        setIsTransitioning(false);
        setImageLoaded(false);
        setNextSrc(null);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, imageLoaded, nextSrc]);

  return (
    <Avatar className={cn('relative overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        {currentSrc ? (
          <motion.div
            key={currentSrc}
            initial={skipInitialAnimation ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <AvatarImage
              src={currentSrc}
              alt={alt}
              className={imageClassName}
            />
          </motion.div>
        ) : (
          <motion.div
            key="fallback"
            initial={skipInitialAnimation ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <AvatarFallback className="relative h-full w-full">
              {fallback}
            </AvatarFallback>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preload next image invisibly */}
      {nextSrc && (
        <div className="pointer-events-none absolute inset-0 opacity-0">
          <AvatarImage src={nextSrc} alt={alt} className={imageClassName} />
        </div>
      )}

      {/* Overlay */}
      {overlay && <div className="absolute inset-0 z-10">{overlay}</div>}
    </Avatar>
  );
}
