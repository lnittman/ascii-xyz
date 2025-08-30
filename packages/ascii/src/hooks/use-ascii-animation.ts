import { useState, useEffect, useRef, useCallback } from 'react';
import type { UseAsciiAnimation, AnimationControls } from '../types';

/**
 * Hook for controlling ASCII animations programmatically
 * 
 * @example
 * ```tsx
 * const animation = useAsciiAnimation(frames, {
 *   speed: 200,
 *   autoPlay: true,
 *   loop: true
 * });
 * 
 * // Control animation
 * animation.controls.pause();
 * animation.controls.goToFrame(5);
 * ```
 */
export function useAsciiAnimation(
  frames: string[],
  options: {
    speed?: number;
    autoPlay?: boolean;
    loop?: boolean;
    onFrameChange?: (index: number, content: string) => void;
    onComplete?: () => void;
  } = {}
): UseAsciiAnimation {
  const {
    speed = 150,
    autoPlay = true,
    loop = true,
    onFrameChange,
    onComplete
  } = options;

  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [animationSpeed, setAnimationSpeed] = useState(speed);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = (prev + 1) % frames.length;
        
        // Trigger callbacks
        onFrameChange?.(next, frames[next]);
        
        // Handle completion
        if (next === 0 && !loop) {
          setIsPlaying(false);
          onComplete?.();
        }
        
        return next;
      });
    }, animationSpeed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, animationSpeed, frames.length, loop, onFrameChange, onComplete]);

  // Control functions
  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const reset = useCallback(() => {
    setCurrentFrame(0);
    setIsPlaying(false);
  }, []);
  
  const goToFrame = useCallback((frame: number) => {
    const validFrame = Math.max(0, Math.min(frame, frames.length - 1));
    setCurrentFrame(validFrame);
    onFrameChange?.(validFrame, frames[validFrame]);
  }, [frames, onFrameChange]);
  
  const setSpeed = useCallback((newSpeed: number) => {
    setAnimationSpeed(Math.max(16, newSpeed)); // Min 16ms (60fps)
  }, []);

  const controls: AnimationControls = {
    play,
    pause,
    reset,
    goToFrame,
    setSpeed
  };

  return {
    currentFrame,
    totalFrames: frames.length,
    isPlaying,
    controls,
    frameContent: frames[currentFrame] || ''
  };
}