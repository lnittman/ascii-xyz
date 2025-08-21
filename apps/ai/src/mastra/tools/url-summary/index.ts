import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { urlSummaryWorkflow } from '../../workflows/url-summary';

/**
 * Tool that runs the URL Summary workflow and returns a short summary
 */
export const summarizeUrlTool = createTool({
  id: 'summarize_url',
  description: 'Fetch a web page and return a concise summary',
  inputSchema: z.object({ url: z.string().url() }),
  outputSchema: z.object({ summary: z.string() }),
  async execute({ context }) {
    const run = urlSummaryWorkflow.createRun();
    const result = await run.start({ inputData: { url: context.url } });
    if (result.status === 'success') {
      return { summary: result.result.summary };
    }
    const errorMessage =
      'error' in result && result.error
        ? result.error.message
        : 'Workflow failed';
    throw new Error(errorMessage);
  },
});
