'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSharedArtwork } from '@/hooks/use-shares';
import { calculateFrameDelay, EMBED_DEFAULTS } from '@/lib/embed';

// Prevent static generation
export const dynamic = 'force-dynamic';

export default function EmbedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const shareCode = params?.token as string;

  // Get embed options from query params
  const theme = (searchParams?.get('theme') as 'light' | 'dark') || 'dark';
  const autoplay = searchParams?.get('autoplay') !== 'false';
  const loop = searchParams?.get('loop') !== 'false';

  const artworkState = useSharedArtwork(shareCode);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const artwork = artworkState.status === 'ready' ? artworkState.data : null;
  const frames = artwork?.frames || [];
  const fps = artwork?.metadata.fps || 10;
  const frameDelay = calculateFrameDelay(fps);

  // Animation loop
  const animate = useCallback(() => {
    if (frames.length <= 1) return;

    setCurrentFrame((prev) => {
      const next = prev + 1;
      if (next >= frames.length) {
        if (loop) {
          return 0;
        } else {
          setIsPlaying(false);
          return prev;
        }
      }
      return next;
    });
  }, [frames.length, loop]);

  // Start/stop animation
  useEffect(() => {
    if (isPlaying && frames.length > 1) {
      animationRef.current = setInterval(animate, frameDelay);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, frameDelay, animate, frames.length]);

  // Theme colors
  const backgroundColor = EMBED_DEFAULTS.backgroundColor[theme];
  const textColor = EMBED_DEFAULTS.textColor[theme];

  // Loading state
  if (artworkState.status === 'loading') {
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <div className="animate-pulse" style={{ color: textColor }}>
          Loading...
        </div>
      </div>
    );
  }

  // Not found state
  if (artworkState.status === 'empty' || !artwork) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <div style={{ color: textColor }} className="text-center">
          <p className="text-lg">Artwork not found</p>
          <p className="text-sm opacity-60 mt-2">
            This link may have expired or been removed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* ASCII Display */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <pre
          className="leading-tight whitespace-pre select-none"
          style={{
            color: textColor,
            fontFamily: EMBED_DEFAULTS.fontFamily,
            fontSize: `${EMBED_DEFAULTS.fontSize}px`,
          }}
          onClick={() => frames.length > 1 && setIsPlaying(!isPlaying)}
        >
          {frames[currentFrame] || frames[0] || 'No content'}
        </pre>
      </div>

      {/* Controls (subtle, appears on hover) */}
      {frames.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              color: textColor,
            }}
          >
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="hover:opacity-80"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <span>
              {currentFrame + 1}/{frames.length}
            </span>
          </div>
        </div>
      )}

      {/* Attribution */}
      <a
        href="https://ascii.xyz"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 text-xs opacity-40 hover:opacity-70 transition-opacity"
        style={{ color: textColor }}
      >
        ascii.xyz
      </a>
    </div>
  );
}
