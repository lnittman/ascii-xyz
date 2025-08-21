import type { Message } from '@ai-sdk/ui-utils';

type TextPart = { type: 'text'; text: string };
type ToolCallPart = {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: any;
};
type DataPart = { type: string; data?: any };
type ErrorPart = { type: 'error'; error: { message: string } };

/**
 * Extract text content from a UI message
 */
export function extractTextFromUIMessage(message: Message): string {
  // Access content from message or use fallback
  const content = (message as any).content || (message as any).parts || '';

  if (!content) {
    return '';
  }

  // Handle array of parts (AI SDK v5 format)
  if (Array.isArray(content)) {
    return content
      .filter((part): part is TextPart => part.type === 'text')
      .map((part) => part.text)
      .join('');
  }

  // Handle string content
  return typeof content === 'string' ? content : '';
}

/**
 * Extract tool calls from a UI message
 */
export function extractToolCalls(message: Message): ToolCallPart[] {
  const content = (message as any).content || (message as any).parts || [];
  if (!Array.isArray(content)) {
    return [];
  }

  return content.filter(
    (part): part is ToolCallPart => part.type === 'tool-call'
  );
}

/**
 * Check if message has any tool calls
 */
export function hasToolCalls(message: Message): boolean {
  return extractToolCalls(message).length > 0;
}

/**
 * Extract data parts from a message (custom data streaming)
 */
export function extractDataParts(message: Message): DataPart[] {
  const content = (message as any).content || (message as any).parts || [];
  if (!Array.isArray(content)) {
    return [];
  }

  return content.filter((part): part is DataPart =>
    part.type.startsWith('data-')
  );
}

/**
 * Extract error parts from a message
 */
export function extractErrorParts(message: Message): ErrorPart[] {
  const content = (message as any).content || (message as any).parts || [];
  if (!Array.isArray(content)) {
    return [];
  }

  return content.filter((part): part is ErrorPart => part.type === 'error');
}

/**
 * Check if message is still streaming (has incomplete parts)
 */
export function isUIMessageStreaming(message: Message): boolean {
  const content = (message as any).content || (message as any).parts || [];
  if (!Array.isArray(content)) {
    return false;
  }

  return content.some(
    (part: any) => part.type === 'tool-call' && !('result' in part)
  );
}

/**
 * Convert legacy message format to AI SDK v5 format
 */
export function normalizeUIMessage(message: any): Message {
  // Return as-is since MessageItem expects the exact Message type
  return message;
}

/**
 * Get display text for a message (handles all part types)
 */
export function getUIMessageDisplayText(message: Message): string {
  const text = extractTextFromUIMessage(message);
  const toolCalls = extractToolCalls(message);
  const errors = extractErrorParts(message);

  let display = text;

  if (toolCalls.length > 0) {
    const toolNames = toolCalls.map((tc) => tc.toolName).join(', ');
    display += display
      ? `\n\n[Using tools: ${toolNames}]`
      : `[Using tools: ${toolNames}]`;
  }

  if (errors.length > 0) {
    const errorMessages = errors
      .map((e) => e.error?.message || 'Unknown error')
      .join(', ');
    display += display
      ? `\n\n[Error: ${errorMessages}]`
      : `[Error: ${errorMessages}]`;
  }

  return display || '[No content]';
}
