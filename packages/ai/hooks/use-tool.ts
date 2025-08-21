'use client';

import { useCallback, useState } from 'react';
import { mastra } from '../mastra';

export interface UseToolOptions {
  toolName: string;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export interface ToolState {
  isLoading: boolean;
  data: any;
  error: Error | null;
}

/**
 * Hook for executing Mastra tools
 */
export function useTool({ toolName, onSuccess, onError }: UseToolOptions) {
  const [state, setState] = useState<ToolState>({
    isLoading: false,
    data: null,
    error: null,
  });

  const execute = useCallback(
    async (input: any) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await mastra.tools.execute({
          name: toolName,
          input,
        });

        setState((prev) => ({
          ...prev,
          data: result,
          isLoading: false,
        }));

        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false,
        }));
        onError?.(error);
        throw error;
      }
    },
    [toolName, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      data: null,
      error: null,
    });
  }, []);

  return {
    execute,
    reset,
    ...state,
  };
}
