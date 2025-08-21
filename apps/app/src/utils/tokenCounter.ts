/**
 * token counting utilities for attachments
 * provides estimates for ui display
 */

/**
 * simple token estimation for quick display
 * roughly 4 characters per token for english text
 */
export function estimateTokens(text: string): number {
  if (!text) {
    return 0;
  }
  // gpt-4 averages ~3.5-4 chars per token
  return Math.ceil(text.length / 3.75);
}

/**
 * format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) {
    return `${tokens} tokens`;
  }
  if (tokens < 1000000) {
    return `${(tokens / 1000).toFixed(1)}k tokens`;
  }
  return `${(tokens / 1000000).toFixed(2)}M tokens`;
}

/**
 * estimate tokens for different file types
 */
export function estimateFileTokens(
  file: File | { size: number; type: string }
): number {
  const mimeType = file.type.toLowerCase();

  // images typically use ~85 tokens per 512x512 tile
  if (mimeType.startsWith('image/')) {
    // rough estimate based on file size
    return Math.ceil(file.size / 3000);
  }

  // pdfs and documents vary widely
  if (mimeType.includes('pdf') || mimeType.includes('document')) {
    // very rough: assume 1 page = 500 words = 375 tokens
    // average pdf page is ~3kb
    const estimatedPages = Math.ceil(file.size / 3000);
    return estimatedPages * 375;
  }

  // for text files, use character-based estimate
  // assumes utf-8 encoding where 1 char ≈ 1 byte for english
  return estimateTokens(file.size.toString());
}

/**
 * calculate total tokens for multiple attachments
 */
export function calculateTotalTokens(
  attachments: Array<{ content?: string; size?: number; type?: string }>
): number {
  return attachments.reduce((total, attachment) => {
    if (attachment.content) {
      return total + estimateTokens(attachment.content);
    }
    if (attachment.size && attachment.type) {
      return (
        total +
        estimateFileTokens({ size: attachment.size, type: attachment.type })
      );
    }
    return total;
  }, 0);
}
