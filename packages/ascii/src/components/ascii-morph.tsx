'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import type { AsciiMorphProps, MousePosition, RippleConfig } from '../types';

/**
 * AsciiMorph Component
 * 
 * A high-performance ASCII art morphing animation component with interactive features.
 * Uses data.json-driven frame morphing with optional mouse tracking and ripple effects.
 * 
 * @example
 * ```tsx
 * import { AsciiMorph } from '@repo/ascii';
 * import morphData from './data/morph-data.json';
 * 
 * <AsciiMorph 
 *   frames={morphData}
 *   speed={150}
 *   interactive={true}
 *   className="absolute inset-0"
 * />
 * ```
 */
export function AsciiMorph({ 
  frames,
  className = '', 
  speed = 150,
  interactive = true,
  rippleConfig = {
    enabled: true,
    radius: 0.1,
    characters: ['◦', '○', '◯', '◉', '●', '◐', '◑', '◒', '◓']
  },
  loop = true,
  autoPlay = true,
  onFrameChange,
  onComplete
}: AsciiMorphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLPreElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0.5, y: 0.5 });
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Validate frames
  const validFrames = useMemo(() => {
    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      console.warn('AsciiMorph: No valid frames provided');
      return ['No frames provided'];
    }
    return frames;
  }, [frames]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setCurrentFrame((prev) => {
        const next = (prev + 1) % validFrames.length;
        
        // Trigger frame change callback
        onFrameChange?.(next, validFrames[next]);
        
        // Check for completion
        if (next === 0 && !loop) {
          setIsPlaying(false);
          onComplete?.();
        }
        
        return next;
      });
    };

    animationRef.current = setInterval(animate, speed);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [speed, isPlaying, validFrames.length, loop, onFrameChange, onComplete]);

  // Mouse interaction
  useEffect(() => {
    if (!interactive || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
    };

    const handleMouseLeave = () => {
      setMousePos({ x: 0.5, y: 0.5 });
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [interactive]);

  // Apply interactive distortion with ripple effect
  useEffect(() => {
    if (!interactive || !frameRef.current || !rippleConfig.enabled) return;

    const frame = validFrames[currentFrame];
    if (!frame) return;

    const lines = frame.split('\n');
    const distortedLines = lines.map((line, lineIndex) => {
      if (!line.trim()) return line;
      
      const lineY = lineIndex / lines.length;
      const distanceY = Math.abs(mousePos.y - lineY);
      
      if (distanceY < rippleConfig.radius * 2) {
        const chars = line.split('');
        return chars.map((char, charIndex) => {
          const charX = charIndex / chars.length;
          const distanceX = Math.abs(mousePos.x - charX);
          
          if (distanceX < rippleConfig.radius && char !== ' ') {
            // Create ripple effect near mouse
            const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
            if (distance < rippleConfig.radius) {
              const intensity = 1 - (distance / rippleConfig.radius);
              const rippleIndex = Math.floor(intensity * (rippleConfig.characters.length - 1));
              return rippleConfig.characters[rippleIndex] || char;
            }
          }
          return char;
        }).join('');
      }
      return line;
    });

    frameRef.current.textContent = distortedLines.join('\n');
  }, [currentFrame, mousePos, interactive, rippleConfig, validFrames]);

  // Public methods via ref
  useEffect(() => {
    // Expose methods for external control
    if (containerRef.current) {
      (containerRef.current as any).asciiMorph = {
        play: () => setIsPlaying(true),
        pause: () => setIsPlaying(false),
        reset: () => setCurrentFrame(0),
        goToFrame: (frame: number) => setCurrentFrame(frame % validFrames.length),
        getCurrentFrame: () => currentFrame,
        getTotalFrames: () => validFrames.length
      };
    }
  }, [currentFrame, validFrames.length]);

  return (
    <div 
      ref={containerRef}
      className={`ascii-morph-container ${className}`}
      data-playing={isPlaying}
      data-frame={currentFrame}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <pre 
          ref={frameRef}
          className="ascii-morph-content text-current font-mono text-[10px] leading-[12px] select-none pointer-events-none whitespace-pre"
          style={{
            textShadow: '0 0 20px currentColor',
            filter: 'contrast(1.2)',
            opacity: 0.9
          }}
        >
          {validFrames[currentFrame]}
        </pre>
      </div>
      
      {/* Optional overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/5 pointer-events-none" />
    </div>
  );
}