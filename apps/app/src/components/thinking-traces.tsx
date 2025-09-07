'use client';

import { useEffect, useState } from 'react';
import { cn } from '@repo/design/lib/utils';

interface ThinkingTrace {
  trace: string;
  type: 'system' | 'planning' | 'frame';
  metadata?: any;
  timestamp: number;
}

interface ThinkingTracesProps {
  traces?: ThinkingTrace[];
  className?: string;
}

export function ThinkingTraces({ traces = [], className }: ThinkingTracesProps) {
  const [visibleTraces, setVisibleTraces] = useState<number[]>([]);
  const [scrambledTraces, setScrambledTraces] = useState<Map<number, string>>(new Map());

  // Animate traces appearing one by one
  useEffect(() => {
    if (!traces.length) return;

    const timeouts: NodeJS.Timeout[] = [];
    
    traces.forEach((trace, index) => {
      // Stagger the appearance of traces
      const delay = index * 150; // 150ms between traces
      
      timeouts.push(
        setTimeout(() => {
          setVisibleTraces(prev => [...prev, index]);
          
          // Start with scrambled text
          setScrambledTraces(prev => {
            const next = new Map(prev);
            next.set(index, scrambleText(trace.trace));
            return next;
          });
          
          // Animate to real text
          animateTextReveal(trace.trace, (text) => {
            setScrambledTraces(prev => {
              const next = new Map(prev);
              next.set(index, text);
              return next;
            });
          });
        }, delay)
      );
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [traces]);

  // Scramble text effect
  function scrambleText(text: string): string {
    const chars = '█▓▒░';
    return text.split('').map(() => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  // Animate text reveal
  function animateTextReveal(target: string, onUpdate: (text: string) => void) {
    const duration = 300; // 300ms animation
    const steps = 20;
    const stepDuration = duration / steps;
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      
      // Reveal text progressively
      const revealedLength = Math.floor(target.length * progress);
      const revealed = target.slice(0, revealedLength);
      const scrambled = scrambleText(target.slice(revealedLength));
      
      onUpdate(revealed + scrambled);
      
      if (step >= steps) {
        clearInterval(interval);
        onUpdate(target);
      }
    }, stepDuration);
  }

  if (!traces.length) return null;

  return (
    <div className={cn("space-y-1", className)}>
      {traces.map((trace, index) => {
        const isVisible = visibleTraces.includes(index);
        const displayText = scrambledTraces.get(index) || trace.trace;
        
        return (
          <div
            key={`${trace.timestamp}-${index}`}
            className={cn(
              "text-xs font-mono transition-all duration-300",
              !isVisible && "opacity-0 translate-y-1",
              isVisible && "opacity-100 translate-y-0",
              trace.type === 'system' && "text-muted-foreground/70",
              trace.type === 'planning' && "text-primary/80",
              trace.type === 'frame' && "text-foreground/60"
            )}
          >
            <span className={cn(
              "inline-block mr-2",
              trace.type === 'system' && "text-muted-foreground/50",
              trace.type === 'planning' && "text-primary/60",
              trace.type === 'frame' && "text-foreground/40"
            )}>
              {trace.type === 'system' && '◌'}
              {trace.type === 'planning' && '◎'}
              {trace.type === 'frame' && '○'}
            </span>
            <span className="break-words">
              {displayText}
            </span>
            {trace.metadata?.frameIndex !== undefined && (
              <span className="ml-2 text-muted-foreground/50">
                (frame {trace.metadata.frameIndex + 1})
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Simplified version for inline display
export function InlineThinkingTrace({ text, className }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start invisible
    setIsVisible(false);
    setDisplayText(scrambleText(text));
    
    // Fade in after a moment
    const fadeInTimeout = setTimeout(() => {
      setIsVisible(true);
      
      // Animate text reveal
      animateTextReveal(text, setDisplayText);
    }, 100);

    return () => clearTimeout(fadeInTimeout);
  }, [text]);

  function scrambleText(text: string): string {
    const chars = '█▓▒░·';
    return text.split('').map(() => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  function animateTextReveal(target: string, onUpdate: (text: string) => void) {
    const duration = 400;
    const steps = 20;
    const stepDuration = duration / steps;
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      
      const revealedLength = Math.floor(target.length * progress);
      const revealed = target.slice(0, revealedLength);
      const scrambled = scrambleText(target.slice(revealedLength));
      
      onUpdate(revealed + scrambled);
      
      if (step >= steps) {
        clearInterval(interval);
        onUpdate(target);
      }
    }, stepDuration);
  }

  return (
    <span className={cn(
      "inline-block transition-all duration-300 font-mono text-sm",
      !isVisible && "opacity-0",
      isVisible && "opacity-100",
      className
    )}>
      {displayText}
    </span>
  );
}