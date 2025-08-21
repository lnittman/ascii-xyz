/**
 * Example: Proper Mastra chat API route with AI SDK integration
 * This demonstrates best practices according to Mastra documentation
 */

import { extractRuntimeContext, mastraAgentsService } from '@repo/ai';
import { withAuthenticatedUser } from '@repo/api';
import type { NextRequest } from 'next/server';

export const POST = withAuthenticatedUser(async function handleChat(
  request: NextRequest,
  context: { user: { clerkId: string } }
) {
  const { messages, threadId, data, selectedModelId } = await request.json();

  // Extract runtime context from sendExtraMessageFields data
  const runtimeContext = extractRuntimeContext(
    data, // From sendExtraMessageFields
    selectedModelId, // Model selection
    {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      // Add user's custom keys here if needed
    }
  );

  // Method 1: Simple streaming (recommended for most cases)
  const stream = await mastraAgentsService.streamMessage('chat', {
    messages,
    threadId,
    resourceId: context.user.clerkId, // Always use clerkId as resourceId
    runtimeContext,
  });

  // The agent.stream() returns a Response with proper .toDataStreamResponse()
  return stream;

  // Method 2: Custom data stream with annotations (advanced)
  /*
  return createMastraDataStreamResponse({
    async execute(dataStream) {
      // Write initial status
      dataStream.writeData({ 
        type: 'status', 
        message: 'Initializing chat...' 
      });
      
      // Get agent stream
      const agentStream = await mastraAgentsService.streamMessage('chat', {
        messages,
        threadId,
        resourceId: context.user.clerkId,
        runtimeContext
      });
      
      // Merge agent stream into data stream
      agentStream.mergeIntoDataStream(dataStream);
      
      // Write completion status
      dataStream.writeMessageAnnotation({
        type: 'completed',
        timestamp: new Date().toISOString()
      });
    }
  });
  */
});
