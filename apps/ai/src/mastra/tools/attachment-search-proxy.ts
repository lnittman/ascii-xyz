import { createTool } from '@mastra/core';
import { z } from 'zod';

/**
 * Proxy tool for searching attachments via the main application's API
 * This avoids workspace dependencies while maintaining functionality
 */
export const attachmentSearchProxy = createTool({
  id: 'search-attachments-proxy',
  description:
    'Search through uploaded files and attachments in the current chat conversation via API',
  inputSchema: z.object({
    query: z
      .string()
      .describe('The search query to find relevant content in attachments'),
    chatId: z.string().describe('The chat ID to search within').optional(),
    topK: z
      .number()
      .min(1)
      .max(10)
      .default(5)
      .describe('Number of results to return')
      .optional(),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        text: z
          .string()
          .describe('The relevant text chunk from the attachment'),
        attachmentName: z.string().describe('Name of the source attachment'),
        attachmentType: z
          .string()
          .describe('Type of the attachment (text, image, code, etc)'),
        score: z.number().describe('Relevance score'),
        keywords: z
          .string()
          .optional()
          .describe('Keywords extracted from this chunk'),
        summary: z.string().optional().describe('Summary of this chunk'),
      })
    ),
    message: z
      .string()
      .optional()
      .describe('Additional context or error message'),
  }),
  execute: async ({ context, threadId }) => {
    try {
      const chatId = context.chatId || threadId;

      if (!chatId) {
        return {
          results: [],
          message: 'No chat context available to search attachments',
        };
      }

      // Call the main app's API to search attachments
      const apiUrl = process.env.MAIN_APP_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/attachments/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if needed
          'X-Internal-Request': 'true',
        },
        body: JSON.stringify({
          chatId,
          query: context.query,
          topK: context.topK || 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        return {
          results: [],
          message: 'No attachments found for this chat',
        };
      }

      return {
        results: data.data.results || [],
        message: data.data.message,
      };
    } catch (_error) {
      return {
        results: [],
        message:
          'Failed to search attachments. Please ensure attachments are uploaded through the chat interface.',
      };
    }
  },
});
