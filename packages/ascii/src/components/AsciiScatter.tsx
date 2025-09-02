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
  const preRef = useRef<HTMLPreElement | null>(null);
  const [dims, setDims] = useState<{ cols: number; rows: number }>({ cols: 200, rows: 150 });
  
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
  
  // Create a grid based on available space and font metrics
  const generateFrame = (frameNum: number) => {
    // Use ceil to avoid undershoot gaps and raise caps for tall screens
    const width = Math.max(40, Math.min(240, Math.ceil(dims.cols)));
    const height = Math.max(20, Math.min(320, Math.ceil(dims.rows)));
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

  // Measure available space and estimate cols/rows
  useEffect(() => {
    if (!mounted) return;
    const measure = () => {
      const el = preRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const fontSizePx = parseFloat(style.fontSize || '10');
      const lineHeightPx = (() => {
        const lh = style.lineHeight;
        if (!lh || lh === 'normal') return fontSizePx * 1.1;
        const parsed = parseFloat(lh);
        return Number.isFinite(parsed) ? parsed : fontSizePx * 1.1;
      })();
      // Measure actual character width to avoid under/overshoot
      const measureCharWidth = () => {
        const span = document.createElement('span');
        span.textContent = 'M'.repeat(200);
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'pre';
        span.style.fontFamily = style.fontFamily;
        span.style.fontSize = style.fontSize;
        span.style.fontWeight = style.fontWeight as string;
        span.style.letterSpacing = style.letterSpacing;
        el.appendChild(span);
        const w = span.getBoundingClientRect().width / 200;
        el.removeChild(span);
        return w || fontSizePx * 0.6;
      };
      const charWidth = Math.max(1, measureCharWidth());
      const cols = Math.max(40, Math.floor(rect.width / charWidth));
      const rows = Math.max(20, Math.floor(rect.height / lineHeightPx));
      // Overscan by +1 row/col so content always overflows and gets neatly clipped
      setDims({ cols: cols + 1, rows: rows + 1 });
    };
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    const ro = ('ResizeObserver' in window)
      ? new ResizeObserver(() => measure())
      : null;
    if (ro && preRef.current) ro.observe(preRef.current);
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro && preRef.current) ro.unobserve(preRef.current);
    };
  }, [mounted]);
  
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
      ref={preRef}
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
