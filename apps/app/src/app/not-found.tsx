'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AsciiMorph } from '@repo/ascii';
import { geometricMorphData } from '@repo/ascii/data';

export default function NotFound() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
  }, []);

  // Memoize the ASCII animation section
  const asciiSection = useMemo(
    () => (
      <div className="relative h-64 md:h-80">
        <AsciiMorph
          frames={geometricMorphData}
          speed={200}
          interactive={true}
          rippleConfig={{
            enabled: true,
            radius: 0.15,
            characters: ['?', '¿', '‽', '⁇', '⁈', '⁉', '¡', '!', '‼'],
          }}
          className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 dark:text-muted-foreground/20"
        />
      </div>
    ),
    [],
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* ASCII Animation */}
        {asciiSection}

        {/* 404 Message */}
        <div className="text-center space-y-4">
          <h1 
            className={`text-6xl font-mono text-foreground transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            404
          </h1>
          <p 
            className={`text-sm font-mono text-muted-foreground transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            This page could not be found
          </p>
        </div>

        {/* Back to home button */}
        <div 
          className={`px-4 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-3 text-sm font-mono border border-border rounded-md hover:bg-muted transition-colors group"
          >
            <span className="inline-block transition-transform group-hover:-translate-x-1">←</span>
            <span className="ml-2">Back to Home</span>
          </button>
        </div>

        {/* ASCII art decoration */}
        <div className="text-center pt-8">
          <pre className="text-xs font-mono text-muted-foreground/40 inline-block">
{`    ___   _____ _____ _____ _____ 
   / _ \\ /  ___/  __ \\_   _|_   _|
  / /_\\ \\\\ \`--.|  /  \\ | |   | |  
  |  _  | \`--. \\ |    || |   | |  
  | | | |/\\__/ / \\__/\\| |_ _| |_ 
  \\_| |_/\\____/ \\____/\\___/ \\___/`}
          </pre>
        </div>
      </div>
    </div>
  );
}
