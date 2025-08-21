import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Jina Reader tool for extracting clean content from URLs
 */
export const jinaReaderTool = createTool({
  id: 'jina_reader',
  description:
    'Extract clean, LLM-ready content from any URL using Jina Reader',
  inputSchema: z.object({
    url: z.string().describe('The URL to read and extract content from'),
    format: z
      .enum(['markdown', 'text', 'html'])
      .default('markdown')
      .describe('Output format for the extracted content'),
  }),
  outputSchema: z.object({
    content: z.string().describe('The extracted content from the URL'),
    title: z.string().describe('The page title'),
    url: z.string().describe('The original URL'),
    length: z.number().describe('Content length in characters'),
  }),
  execute: async ({ context }) => {
    const { url, format = 'markdown' } = context;
    try {
      // Construct Jina Reader URL
      const jinaUrl = `https://r.jina.ai/${url}`;

      // Add format parameter if specified
      const params = new URLSearchParams();
      if (format === 'text') {
        params.append('format', 'text');
      } else if (format === 'html') {
        params.append('format', 'html');
      }
      // Default is markdown, no parameter needed

      const finalUrl = params.toString() ? `${jinaUrl}?${params}` : jinaUrl;

      const response = await fetch(finalUrl, {
        headers: {
          'User-Agent': 'Mastra-JinaReader/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Jina Reader failed: ${response.status} ${response.statusText}`
        );
      }

      const content = await response.text();

      // Extract title from content if markdown format
      let title = '';
      if (format === 'markdown') {
        const titleMatch = content.match(/^# (.+)$/m);
        title = titleMatch ? titleMatch[1] : '';
      }

      return {
        content,
        title,
        url,
        length: content.length,
      };
    } catch (error) {
      throw new Error(
        `Failed to read URL ${url}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});
