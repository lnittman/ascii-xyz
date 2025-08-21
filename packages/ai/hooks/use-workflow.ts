'use client';

import { useCallback, useState } from 'react';
import { mastra } from '../mastra';

export interface UseWorkflowOptions {
  workflowId: string;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: any) => void;
}

export interface WorkflowState {
  isLoading: boolean;
  data: any;
  error: Error | null;
  progress: any;
}

/**
 * Hook for executing Mastra workflows with progress tracking
 */
export function useWorkflow({
  workflowId,
  onSuccess,
  onError,
  onProgress,
}: UseWorkflowOptions) {
  const [state, setState] = useState<WorkflowState>({
    isLoading: false,
    data: null,
    error: null,
    progress: null,
  });

  const execute = useCallback(
    async (input: any) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        // Stream workflow execution
        const stream = await mastra.workflows.stream({
          id: workflowId,
          input,
        });

        for await (const chunk of stream) {
          if (chunk.type === 'progress') {
            setState((prev) => ({ ...prev, progress: chunk.data }));
            onProgress?.(chunk.data);
          } else if (chunk.type === 'result') {
            setState((prev) => ({
              ...prev,
              data: chunk.data,
              isLoading: false,
            }));
            onSuccess?.(chunk.data);
          }
        }
      } catch (err) {
        const error = err as Error;
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false,
        }));
        onError?.(error);
      }
    },
    [workflowId, onSuccess, onError, onProgress]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      data: null,
      error: null,
      progress: null,
    });
  }, []);

  return {
    execute,
    reset,
    ...state,
  };
}
