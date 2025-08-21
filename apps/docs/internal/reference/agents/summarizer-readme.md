# Summarizer Agent

The Summarizer agent fetches articles or text from a URL and returns a concise summary. It uses the Jina Reader tool to extract content and the lightweight **Gemini 2.5 Flash** model for summarization.

## Usage
```typescript
import { summarizerAgent } from '@/mastra/agents/summarizer';

const result = await summarizerAgent.generate({
  messages: [
    { role: 'user', content: 'Summarize https://example.com/article' }
  ]
});
console.log(result.text);
```
