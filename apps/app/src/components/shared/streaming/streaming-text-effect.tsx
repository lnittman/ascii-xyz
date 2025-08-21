'use client';

import { TextEffect } from '@/components/shared/text-effect';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface StreamingTextEffectProps {
  content: string;
  isStreaming?: boolean;
  speed?: number;
  preset?: 'blur' | 'fade-in-blur' | 'scale' | 'fade' | 'slide';
  per?: 'word' | 'char' | 'line';
  className?: string;
  onComplete?: () => void;
}

export function StreamingTextEffect({
  content,
  isStreaming = true,
  speed = 20,
  preset = 'fade-in-blur',
  per = 'word',
  className,
  onComplete,
}: StreamingTextEffectProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!isStreaming || !content) {
      setDisplayedContent(content);
      onComplete?.();
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastUpdateRef.current) {
        lastUpdateRef.current = timestamp;
      }

      const elapsed = timestamp - lastUpdateRef.current;
      const charsToAdd = Math.floor((elapsed * speed) / 1000);

      if (charsToAdd > 0) {
        lastUpdateRef.current = timestamp;

        setCurrentIndex((prevIndex) => {
          const newIndex = Math.min(prevIndex + charsToAdd, content.length);

          if (newIndex === content.length) {
            onComplete?.();
          }

          return newIndex;
        });
      }

      if (currentIndex < content.length) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (currentIndex < content.length) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [content, currentIndex, isStreaming, speed, onComplete]);

  useEffect(() => {
    setDisplayedContent(content.slice(0, currentIndex));
  }, [content, currentIndex]);

  // Split content into segments for animation
  const segments = displayedContent.split(
    per === 'word' ? ' ' : per === 'line' ? '\n' : ''
  );
  const lastSegmentLength = segments.at(-1)?.length;
  const previousSegments = lastSegmentLength
    ? displayedContent.slice(0, -lastSegmentLength)
    : displayedContent;
  const lastSegment = segments.at(-1) || '';

  if (!isStreaming) {
    return <span className={className}>{content}</span>;
  }

  return (
    <span className={cn('inline', className)}>
      {previousSegments}
      {lastSegment && (
        <TextEffect
          preset={preset}
          per={per}
          speedReveal={0.2}
          speedSegment={0.05}
          delay={0}
          className="inline"
          segmentWrapperClassName="inline-block"
        >
          {lastSegment}
        </TextEffect>
      )}
    </span>
  );
}
