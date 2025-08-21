/**
 * Tool execution input
 */
export interface ToolInput {
  name: string;
  input: any;
  agentId?: string;
  runtimeContext?: Record<string, any>;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  name: string;
  output: any;
  metadata?: ToolMetadata;
}

/**
 * Tool metadata
 */
export interface ToolMetadata {
  executionTime: number;
  version?: string;
  [key: string]: any;
}

/**
 * Tool definition
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema?: any;
  outputSchema?: any;
  parameters?: ToolParameter[];
}

/**
 * Tool parameter
 */
export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  required?: boolean;
  default?: any;
}
