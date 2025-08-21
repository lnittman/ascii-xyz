/**
 * Example: Mastra completion API route for single-turn interactions
 * Works with useCompletion hook
 */

import { extractRuntimeContext, mastraAgentsService } from '@repo/ai';
import { withAuthenticatedUser } from '@repo/api';
import type { NextRequest } from 'next/server';

export const POST = withAuthenticatedUser(async function handleCompletion(
  request: NextRequest,
  context: { user: { clerkId: string } }
) {
  const {
    prompt,
    agentId = 'chat',
    data,
    runtimeContext: customContext,
  } = await request.json();

  // Build runtime context
  const runtimeContext = extractRuntimeContext(data, undefined, customContext);

  // Convert prompt to message format
  const messages = [{ role: 'user' as const, content: prompt }];

  // Stream the completion
  const stream = await mastraAgentsService.streamMessage(agentId, {
    messages,
    resourceId: context.user.clerkId,
    runtimeContext,
  });

  // Return data stream response
  return stream;
});
