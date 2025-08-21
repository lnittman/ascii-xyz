import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const createOutputTool = createTool({
  id: 'create-output',
  description: `Create a structured output/artifact that will be displayed in a separate panel.
  
  This tool signals the creation of substantial content that should be rendered separately from the chat:
  - Documents, articles, reports, essays
  - Code implementations, scripts, configurations
  - Structured data (JSON, CSV, tables)
  - Diagrams, charts, visualizations
  - Any content that forms a complete, standalone piece
  
  After calling this tool, you MUST immediately stream the content using OUTPUT_START/OUTPUT_END markers:
  <OUTPUT_START id="[ID_FROM_RESULT]"/>
  ... your content here ...
  <OUTPUT_END id="[ID_FROM_RESULT]"/>
  
  The content will be intercepted and rendered in the output panel, not in the chat.`,
  inputSchema: z.object({
    title: z
      .string()
      .min(1)
      .max(200)
      .describe('A clear, descriptive title for the output'),
    type: z
      .enum([
        'document',
        'code',
        'markdown',
        'html',
        'json',
        'text',
        'diagram',
        'table',
      ])
      .describe('The primary content type for proper rendering'),
    metadata: z
      .object({
        language: z
          .string()
          .optional()
          .describe('Programming language for code outputs'),
        description: z
          .string()
          .optional()
          .describe('Brief description of the content'),
        format: z
          .string()
          .optional()
          .describe("Specific format details (e.g., 'csv', 'yaml')"),
        version: z
          .string()
          .optional()
          .describe('Version identifier for this output'),
      })
      .optional(),
  }),
  outputSchema: z.object({
    id: z.string().describe('Unique identifier for this output'),
    title: z.string().describe('The title of the output'),
    type: z.string().describe('The content type'),
    metadata: z.record(z.any()).optional().describe('Additional metadata'),
    created: z
      .boolean()
      .describe('Whether the output was successfully created'),
    streamingRequired: z
      .boolean()
      .describe('Whether content must be streamed using OUTPUT markers'),
  }),
  execute: async ({ context }) => {
    // Generate a unique ID for this output with timestamp and random component
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const outputId = `output-${timestamp}-${randomId}`;

    return {
      id: outputId,
      title: context.title,
      type: context.type,
      metadata: {
        ...context.metadata,
        createdAt: new Date().toISOString(),
        version: context.metadata?.version || '1.0',
      },
      created: true,
      streamingRequired: true,
    };
  },
});
