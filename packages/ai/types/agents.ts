import type { UIMessage } from 'ai';

/**
 * Agent response with metadata
 */
export interface AgentResponse {
  message: UIMessage;
  usage?: TokenUsage;
  metadata?: Record<string, any>;
}

/**
 * Token usage information
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Agent streaming response
 */
export interface AgentStreamResponse {
  stream: ReadableStream;
  toDataStreamResponse: () => Response;
  toTextStreamResponse: () => Response;
  toUIMessageStreamResponse: () => Response;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  systemPrompt?: string;
}

/**
 * Agent execution options
 */
export interface AgentExecutionOptions {
  runtimeContext?: Record<string, any>;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
}
