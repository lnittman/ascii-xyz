'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AsciiMorph } from '@repo/ascii';
import { geometricMorphData } from '@repo/ascii/data';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const copiedTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const handleCopy = () => {
    const errorText = `Error: ${error.message || 'An unexpected error occurred'}${
      error.digest ? `\nID: ${error.digest}` : ''
    }${error.stack ? `\n\nStack:\n${error.stack}` : ''}`;

    navigator.clipboard.writeText(errorText);
    setCopied(true);

    if (copiedTimeout.current) {
      clearTimeout(copiedTimeout.current);
    }

    copiedTimeout.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

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
            characters: ['×', '✕', '✖', '⨯', '✗', '☓', '⊗', '⊘', '⊙'],
          }}
          className="absolute inset-0 flex items-center justify-center text-red-500/20 dark:text-red-400/10"
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

        {/* Error Message */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-mono text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm font-mono text-muted-foreground break-all px-4">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground">
              ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-4 py-2 text-sm font-mono border border-border rounded-md hover:bg-muted transition-colors"
          >
            ← Home
          </button>
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 text-sm font-mono bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>

        {/* Copy Error Button */}
        <div className="px-4">
          <button
            onClick={handleCopy}
            className="w-full px-4 py-2 text-sm font-mono border border-border rounded-md hover:bg-muted transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy Error Details'}
          </button>
        </div>

        {/* Stack trace in dev mode */}
        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="px-4">
            <summary className="text-xs font-mono text-muted-foreground cursor-pointer hover:text-foreground">
              Stack Trace
            </summary>
            <pre className="mt-2 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all max-h-40 overflow-y-auto p-2 bg-muted/30 rounded">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}