import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { createSummarizerAgent } from '../../agents/summarizer/index';

export const summarizeContent = createStep({
  id: 'summarize_content',
  description: 'Summarize fetched content using the summarizer agent',
  inputSchema: z.object({
    content: z.string(),
    title: z.string().optional(),
    url: z.string(),
  }),
  outputSchema: z.object({ summary: z.string() }),
  async execute({ inputData }) {
    // Create agent inline since we don't have env at module level
    const summarizerAgent = createSummarizerAgent();
    const response = await summarizerAgent.generate([
      {
        role: 'user',
        content: `Summarize the following content:\n\n${inputData.content}`,
      },
    ]);
    return { summary: response.text };
  },
});
