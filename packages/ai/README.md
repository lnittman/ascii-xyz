# @repo/ai

Project-agnostic AI package following the auth package pattern. Direct re-exports from AI SDK v5 with optional Mastra utilities.

## Installation

```bash
pnpm add @repo/ai
```

## Usage

### Client-side (React)
```typescript
import { useChat } from '@repo/ai/client';

const { messages, input, handleSubmit } = useChat({
  api: '/api/chat', // Your app defines the endpoint
});
```

### Server-side (API Routes)
```typescript
import { streamText } from '@repo/ai/server';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-4'),
  messages,
});

return result.toDataStreamResponse();
```

### With Mastra (Optional)
```typescript
import { mastra } from '@repo/ai';

const agent = mastra.getAgent('chat');
const stream = agent.stream(messages);
```

## Structure

Following the auth package pattern:
- `client.ts` - Re-exports from `@ai-sdk/react`
- `server.ts` - Re-exports from `ai`
- `mastra.ts` - Optional Mastra utilities
- No business logic, completely project-agnostic

## Environment Variables

```bash
# For Mastra integration (optional)
NEXT_PUBLIC_AI_URL=http://localhost:3999
MASTRA_KEY=your-api-key # Production only

# For OpenRouter (optional)
OPENROUTER_API_KEY=sk-or-...

# For OpenAI (optional)
OPENAI_API_KEY=sk-...
```

## Examples

See the [examples](./examples/) directory for usage patterns.