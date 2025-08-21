'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { useCallback } from 'react';
import { mastra } from '../mastra';

export interface UseAgentOptions {
  agentId: string;
  api?: string;
  initialMessages?: UIMessage[];
  onFinish?: (message: UIMessage) => void;
  onError?: (error: Error) => void;
  body?: Record<string, any>;
}

/**
 * Generic hook for interacting with Mastra agents
 * Wraps useChat with agent-specific functionality
 */
export function useAgent({
  agentId,
  api = '/api/chat',
  body = {},
  ...options
}: UseAgentOptions) {
  const chat = useChat({
    api,
    ...options,
    body: {
      ...body,
      agentId,
    },
  });

  // Execute a workflow through this agent
  const executeWorkflow = useCallback(
    async (workflowId: string, input: any) => {
      try {
        const result = await mastra.workflows.execute({
          id: workflowId,
          input,
          agentId,
        });
        return result;
      } catch (error) {
        options.onError?.(error as Error);
        throw error;
      }
    },
    [agentId, options.onError]
  );

  // Use a tool through this agent
  const useTool = useCallback(
    async (toolName: string, input: any) => {
      try {
        const result = await mastra.tools.execute({
          name: toolName,
          input,
          agentId,
        });
        return result;
      } catch (error) {
        options.onError?.(error as Error);
        throw error;
      }
    },
    [agentId, options.onError]
  );

  return {
    ...chat,
    agentId,
    executeWorkflow,
    useTool,
  };
}
