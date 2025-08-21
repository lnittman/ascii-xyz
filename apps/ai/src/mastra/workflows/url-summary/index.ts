import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { fetchContent } from '../steps/fetchContent';
import { summarizeContent } from '../steps/summarizeContent';

export const urlSummaryWorkflow = createWorkflow({
  id: 'url-summary',
  inputSchema: z.object({ url: z.string() }),
  outputSchema: z.object({ summary: z.string() }),
  steps: [fetchContent, summarizeContent],
})
  .then(fetchContent)
  .then(summarizeContent)
  .commit();

export default urlSummaryWorkflow;
