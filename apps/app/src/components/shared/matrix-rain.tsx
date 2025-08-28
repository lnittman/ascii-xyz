'use client';

import { useEffect, useState, useRef } from 'react';

export function MatrixRain() {
  const [drops, setDrops] = useState<number[]>([]);
  const frameRef = useRef(0);
  const [display, setDisplay] = useState('');

  // Mix of characters: binary, katakana, and special symbols
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン@#$%^&*()_+-=[]{}|;:<>?';
  const width = 93;
  const height = 31;

  // Initialize drops
  useEffect(() => {
    const initialDrops = Array(width).fill(0).map(() => Math.floor(Math.random() * height));
    setDrops(initialDrops);
  }, []);

  const generateFrame = () => {
    const lines: string[] = [];
    const newDrops = [...drops];

    // Create empty grid
    const grid: string[][] = Array(height).fill(null).map(() => Array(width).fill(' '));

    // Place drops and trails
    for (let x = 0; x < width; x++) {
      const dropY = newDrops[x];

      // Draw the trail with fading effect
      for (let trail = 0; trail < 8; trail++) {
        const y = dropY - trail;
        if (y >= 0 && y < height) {
          // Brighter characters near the drop head
          const intensity = trail === 0 ? 1 : trail === 1 ? 0.9 : trail === 2 ? 0.7 : 0.3;
          if (Math.random() < intensity) {
            grid[y][x] = chars[Math.floor(Math.random() * chars.length)];
          }
        }
      }

      // Move drop down
      newDrops[x] = (dropY + 1) % (height + Math.floor(Math.random() * 10));

      // Random chance to reset drop to top
      if (Math.random() > 0.98) {
        newDrops[x] = 0;
      }
    }

    // Convert grid to string
    for (let y = 0; y < height; y++) {
      lines.push(grid[y].join(''));
    }

    setDrops(newDrops);
    return lines.join('\n');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      frameRef.current += 1;
      setDisplay(generateFrame());
    }, 100); // Faster for smoother animation

    return () => clearInterval(interval);
  }, [drops]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <pre className="font-mono text-[11px] leading-[1.2] text-foreground/60 select-none whitespace-pre">
        {display}
      </pre>
    </div>
  );
}
