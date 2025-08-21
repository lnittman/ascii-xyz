import type { UIMessage } from 'ai';

/**
 * Format messages for display
 */
export function formatMessages(messages: UIMessage[]): string {
  return messages.map((m) => `${m.role}: ${extractTextContent(m)}`).join('\n');
}

/**
 * Extract text content from a message
 */
export function extractTextContent(message: UIMessage): string {
  if (!message) {
    return '';
  }

  // AI SDK v5 uses parts array
  if (message.parts && Array.isArray(message.parts)) {
    return message.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text || '')
      .join('');
  }

  // Fallback for legacy content property
  if ('content' in message && typeof (message as any).content === 'string') {
    return (message as any).content;
  }

  return '';
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
