import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { jinaReaderTool } from '../../tools/jina/index';

export const fetchContent = createStep({
  id: 'fetch_content',
  description: 'Fetch article content from a URL',
  inputSchema: z.object({ url: z.string() }),
  outputSchema: z.object({
    content: z.string(),
    title: z.string().optional(),
    url: z.string(),
  }),
  async execute({ inputData }) {
    const result = await jinaReaderTool.execute({
      context: { url: inputData.url, format: 'markdown' },
      runtimeContext: new (await import('@mastra/core/di')).RuntimeContext(),
    });
    return {
      content: result.content,
      title: result.title,
      url: result.url,
    };
  },
});
