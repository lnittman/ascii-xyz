/**
 * Runtime context for passing data to agents/workflows/tools
 */
export interface RuntimeContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

/**
 * Runtime options
 */
export interface RuntimeOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  debug?: boolean;
}
