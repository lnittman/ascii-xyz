import { openai } from '@ai-sdk/openai';
import { mastra } from '@repo/ai';
// Example: API route using AI package
import { streamText } from '@repo/ai/server';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Option 1: Direct AI SDK usage
  const result = streamText({
    model: openai('gpt-4'),
    messages,
  });

  return result.toDataStreamResponse();
}

// Option 2: With Mastra
export async function POST_WITH_MASTRA(req: Request) {
  const { messages } = await req.json();

  // Your app manages agents
  const agent = mastra.getAgent('chat');
  const stream = agent.stream(messages);

  return stream.toDataStreamResponse();
}
