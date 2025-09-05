"use client";

import { useMemo } from 'react';
import { AsciiEngine } from '@/lib/ascii/engine';

export function MiniAsciiLoader() {
  const frames = useMemo(() => {
    function gen(w: number, h: number, n: number, d = 0.02) {
      const out: string[] = [];
      for (let f = 0; f < n; f++) {
        let frame = '';
        for (let y = 0; y < h; y++) {
          let row = '';
          for (let x = 0; x < w; x++) {
            const r = Math.random() + (Math.sin((x + f) * 0.41) + Math.cos((y - f) * 0.29)) * 0.12;
            row += r < d ? '*' : ' ';
          }
          frame += row + (y < h - 1 ? '\n' : '');
        }
        out.push(frame);
      }
      return out;
    }
    return gen(28, 6, 48, 0.03);
  }, []);

  return (
    <div className="flex items-center justify-center">
      <AsciiEngine
        frames={frames}
        fps={12}
        loop
        autoPlay
        style={{ fontSize: '10px', lineHeight: '10px', opacity: 0.8 }}
      />
    </div>
  );
}

