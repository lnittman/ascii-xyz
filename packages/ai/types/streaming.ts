/**
 * Stream data types
 */
export type StreamDataType =
  | 'text'
  | 'function_call'
  | 'tool_call'
  | 'data'
  | 'error'
  | 'finish';

/**
 * Stream chunk
 */
export interface StreamChunk {
  type: StreamDataType;
  data: any;
  id?: string;
  timestamp?: string;
}

/**
 * Stream options
 */
export interface StreamOptions {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onText?: (text: string) => void;
  onFunctionCall?: (functionCall: any) => void;
  onToolCall?: (toolCall: any) => void;
  onFinish?: (result: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Stream response
 */
export interface StreamResponse {
  stream: ReadableStream;
  headers?: Headers;
  status?: number;
}
