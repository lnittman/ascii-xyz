'use client';

import React, { useEffect, useState, useRef } from 'react';

interface AsciiScatterProps {
  className?: string;
  active?: boolean;
  isDark?: boolean;
}

export function AsciiScatter({ className = '', active = true, isDark = false }: AsciiScatterProps) {
  const [frame, setFrame] = useState(0);
  const [mounted, setMounted] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  
  // ASCII-themed characters representing creation and art
  const asciiChars = [
    '█', '▓', '▒', '░', // Density blocks
    '╱', '╲', '╳', '╬', // Crosses and lines
    '◆', '◇', '○', '●', // Shapes
    '▲', '▼', '►', '◄', // Directional
    '∴', '∵', '∷', '⋮', // Pattern dots
    '⟨', '⟩', '⟪', '⟫', // Brackets
    '∿', '≈', '~', '∽', // Waves
    'A', 'S', 'C', 'I', 'I', // Brand letters (ASCII)
    '⣿', '⣷', '⣯', '⣟', // Braille patterns
    '┌', '┐', '└', '┘', '│', '─', // Box drawing
  ];
  
  // Create a larger grid for full-screen effect
  const generateFrame = (frameNum: number) => {
    const width = 160;
    const height = 80;
    const grid = [];
    
    for (let y = 0; y < height; y++) {
      let row = '';
      for (let x = 0; x < width; x++) {
        // Create multiple wave patterns for complexity
        const centerX = width / 2;
        const centerY = height / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        
        // Primary expanding wave
        const wave1 = Math.sin(distance * 0.15 - frameNum * 0.02) * 0.5 + 0.5;
        
        // Secondary rotating wave
        const angle = Math.atan2(y - centerY, x - centerX);
        const wave2 = Math.sin(angle * 3 + frameNum * 0.03) * 0.3;
        
        // Vertical flowing effect
        const flow = Math.sin(y * 0.2 - frameNum * 0.04 + x * 0.05) * 0.3;
        
        // Combine waves for organic movement
        const combined = wave1 + wave2 + flow;
        const threshold = 0.25 + Math.sin(frameNum * 0.01) * 0.15;
        
        // Determine if we should show a character - increased density
        const show = Math.random() < (combined > threshold ? combined * 0.8 : 0.2);
        
        if (show) {
          // Pick character based on position and intensity
          const intensity = combined;
          let charIndex;
          
          if (intensity > 0.8) {
            // High intensity - use solid blocks or letters
            charIndex = Math.random() < 0.3 
              ? Math.floor(Math.random() * 4) // Blocks
              : 16 + Math.floor(Math.random() * 5); // Letters
          } else if (intensity > 0.5) {
            // Medium intensity - use shapes
            charIndex = 8 + Math.floor(Math.random() * 8);
          } else {
            // Low intensity - use light patterns
            charIndex = Math.floor(Math.random() * asciiChars.length);
          }
          
          row += asciiChars[charIndex % asciiChars.length];
        } else {
          row += ' ';
        }
      }
      grid.push(row);
    }
    
    return grid.join('\n');
  };
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!active || !mounted) return;
    
    let frameCount = 0;
    const animate = () => {
      frameCount++;
      setFrame(frameCount);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, mounted]);
  
  // Only render animation after mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <pre 
        className={`font-mono text-xs leading-none select-none pointer-events-none ${className}`}
        style={{
          color: 'transparent'
        }}
        aria-hidden="true"
      >
        {/* Empty space while loading */}
      </pre>
    );
  }
  
  return (
    <pre 
      className={`font-mono text-xs leading-none select-none pointer-events-none ${className}`}
      style={{
        color: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)',
        lineHeight: '1',
        letterSpacing: '0.01em',
        fontSize: '10px',
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0
      }}
      aria-hidden="true"
    >
      {generateFrame(frame)}
    </pre>
  );
}