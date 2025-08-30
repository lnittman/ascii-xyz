'use client';

import { useEffect, useRef, useState } from 'react';
import morphData from '@/lib/ascii/data/morph-data.json';

interface AsciiMorphProps {
  className?: string;
  speed?: number; // milliseconds between frames
  interactive?: boolean; // react to mouse position
}

export function AsciiMorph({ 
  className = '', 
  speed = 150,
  interactive = true 
}: AsciiMorphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLPreElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setCurrentFrame((prev) => (prev + 1) % morphData.length);
    };

    animationRef.current = setInterval(animate, speed);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [speed]);

  // Mouse interaction
  useEffect(() => {
    if (!interactive || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  // Apply interactive distortion
  useEffect(() => {
    if (!interactive || !frameRef.current) return;

    const lines = morphData[currentFrame].split('\n');
    const distortedLines = lines.map((line, lineIndex) => {
      if (!line.trim()) return line;
      
      const lineY = lineIndex / lines.length;
      const distanceY = Math.abs(mousePos.y - lineY);
      
      if (distanceY < 0.2) {
        const chars = line.split('');
        return chars.map((char, charIndex) => {
          const charX = charIndex / chars.length;
          const distanceX = Math.abs(mousePos.x - charX);
          
          if (distanceX < 0.1 && char !== ' ') {
            // Create ripple effect near mouse
            const intensity = 1 - (distanceX / 0.1);
            const rippleChars = ['◦', '○', '◯', '◉', '●', '◐', '◑', '◒', '◓'];
            return rippleChars[Math.floor(intensity * rippleChars.length)] || char;
          }
          return char;
        }).join('');
      }
      return line;
    });

    frameRef.current.textContent = distortedLines.join('\n');
  }, [currentFrame, mousePos, interactive]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <pre 
          ref={frameRef}
          className="text-foreground/10 font-mono text-[10px] leading-[12px] select-none pointer-events-none whitespace-pre animate-pulse"
          style={{
            textShadow: '0 0 20px currentColor',
            filter: 'contrast(1.2)',
          }}
        >
          {morphData[currentFrame]}
        </pre>
      </div>
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/50 pointer-events-none" />
    </div>
  );
}