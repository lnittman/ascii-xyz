/**
 * Example: Mastra structured output API route
 * Works with useObject hook for typed responses
 */

import { extractRuntimeContext, mastraAgentsService } from '@repo/ai';
import { withAuthenticatedUser } from '@repo/api';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

// Example schema for weather data
const weatherSchema = z.object({
  location: z.string(),
  temperature: z.number(),
  conditions: z.string(),
  humidity: z.number().optional(),
  windSpeed: z.number().optional(),
});

export const POST = withAuthenticatedUser(async function handleObject(
  request: NextRequest,
  context: { user: { clerkId: string } }
) {
  const { messages, agentId = 'chat', data, schema } = await request.json();

  // Build runtime context
  const runtimeContext = extractRuntimeContext(data);

  // Stream with structured output
  const stream = await mastraAgentsService.streamMessage(agentId, {
    messages,
    resourceId: context.user.clerkId,
    runtimeContext,
    output: schema || weatherSchema, // Use provided schema or default
  });

  // For structured output, use toTextStreamResponse()
  // The useObject hook expects text stream format
  return stream.toTextStreamResponse();
});
