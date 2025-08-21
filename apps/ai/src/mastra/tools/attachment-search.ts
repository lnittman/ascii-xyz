import { createTool } from '@mastra/core';
import { z } from 'zod';
import { searchAttachments } from '../lib/attachments/rag';

/**
 * Tool for searching through attachments in the current chat
 * Uses mastra memory with fastembed for semantic search
 * Works when deployed to mastra cloud
 */
export const attachmentSearchTool = createTool({
  id: 'search-attachments',
  description:
    'Search through uploaded files and attachments in the current chat conversation to find relevant information',
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
      // Use threadId as chatId if not explicitly provided
      const chatId = context.chatId || threadId;

      if (!chatId) {
        return {
          results: [],
          message: 'No chat context available to search attachments',
        };
      }

      // Search attachments using the RAG service with fastembed
      const searchResults = await searchAttachments(
        chatId,
        context.query,
        context.topK || 5
      );

      // Transform results to match the expected output format
      const results = searchResults.map(
        (result: {
          content: string;
          metadata?: {
            name?: string;
            type?: string;
          };
          score: number;
        }) => ({
          text: result.content || '',
          attachmentName: result.metadata?.name || 'Unknown',
          attachmentType: result.metadata?.type || 'unknown',
          score: result.score,
          // Optional fields can be added later if needed
          keywords: undefined,
          summary: undefined,
        })
      );

      return {
        results,
        message:
          results.length > 0
            ? `Found ${results.length} relevant attachment(s)`
            : 'No relevant attachments found for your query',
      };
    } catch (_error) {
      return {
        results: [],
        message:
          'Failed to search attachments. The attachments may still be processing or there was an error.',
      };
    }
  },
});
