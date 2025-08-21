'use client';

import { useCallback, useRef, useState } from 'react';

export interface UseStreamingOptions {
  onData?: (data: any) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export interface StreamingState {
  isStreaming: boolean;
  error: Error | null;
}

/**
 * Hook for handling streaming responses from Mastra
 */
export function useStreaming({
  onData,
  onError,
  onComplete,
}: UseStreamingOptions = {}) {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async (url: string, body: any, options?: RequestInit) => {
      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState({
        isStreaming: true,
        error: null,
      });

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
          ...options,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                onData?.(data);
              } catch (_e) {
                // Ignore parse errors
              }
            }
          }
        }

        onComplete?.();
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setState((prev) => ({ ...prev, error: err }));
          onError?.(err);
        }
      } finally {
        setState((prev) => ({ ...prev, isStreaming: false }));
        abortControllerRef.current = null;
      }
    },
    [onData, onError, onComplete]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setState((prev) => ({ ...prev, isStreaming: false }));
    }
  }, []);

  return {
    stream,
    cancel,
    ...state,
  };
}
