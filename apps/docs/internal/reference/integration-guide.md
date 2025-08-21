# Integration Guide

The new Summarizer agent and URL Summary workflow can be used from any application via the Mastra client APIs.

## Accessing the Summarizer Agent
```
import { mastraAgentService } from '@repo/api';

const response = await mastraAgentService.sendMessage('summarizer', [
  { role: 'user', content: 'Summarize https://example.com' }
]);
console.log(response.text);
```

## Running the Workflow
```
import { mastraWorkflowService } from '@repo/api';

const runId = await mastraWorkflowService.triggerWorkflow({ url: 'https://example.com' });
const result = await mastraWorkflowService.getWorkflowResult('urlSummary', runId);
```

## In the Chat Interface

The `urlSummary` workflow is available as the `summarize_url` tool on the chat agent. When a user requests a page summary, the agent can invoke this tool to fetch and summarize the URL on the fly.
