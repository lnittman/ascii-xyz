# URL Summary Workflow

This workflow fetches content from a URL using the Jina Reader tool and generates a concise summary with the Summarizer agent. The agent uses the economical **Gemini 2.5 Flash** model for fast summaries.

## Steps
1. **fetch_content** – Extracts text from the provided URL.
2. **summarize_content** – Uses the Summarizer agent to create a summary.

## Usage
```typescript
import { urlSummaryWorkflow } from '@/mastra/workflows/url-summary';

const result = await urlSummaryWorkflow.createRun().start({ inputData: { url: 'https://example.com' } });
if (result.status === 'success') {
  console.log(result.result.summary);
}
```
