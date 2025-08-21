export interface ToolCall {
  type: string;
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
}

export interface ToolResult {
  type: string;
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
  result: any;
}
