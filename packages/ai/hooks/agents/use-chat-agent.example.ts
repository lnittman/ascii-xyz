'use client';

import { useAgent } from '../use-agent';
import type { UseAgentOptions } from '../use-agent';

interface UseChatAgentOptions extends Omit<UseAgentOptions, 'agentId'> {
  // Add agent-specific options
  enableTools?: boolean;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Example: Hook for a specific chat agent
 * Replace 'chat-agent' with your actual agent ID
 */
export function useChatAgent(options: UseChatAgentOptions = {}) {
  const {
    enableTools = true,
    temperature,
    maxTokens,
    ...agentOptions
  } = options;

  const agent = useAgent({
    ...agentOptions,
    agentId: 'chat-agent', // Replace with your agent ID
    sendExtraMessageFields: true,
    body: {
      enableTools,
      temperature,
      maxTokens,
    },
  });

  // Add agent-specific methods
  const summarize = async (content: string) => {
    return agent.executeWorkflow('summarization', { content });
  };

  const search = async (query: string) => {
    return agent.useTool('web-search', { query });
  };

  const analyze = async (data: any) => {
    return agent.executeWorkflow('data-analysis', { data });
  };

  return {
    ...agent,
    summarize,
    search,
    analyze,
  };
}
