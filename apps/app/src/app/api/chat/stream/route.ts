import { auth } from '@repo/auth/server';
import { userService } from '@repo/services';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get user to get internal ID
    const _user = await userService.getUserByClerkId(clerkId);

    // Parse request body
    const body = await req.json();
    const { messages, threadId, selectedModelId } = body;

    if (!messages || !threadId) {
      return new Response('Bad Request: messages and threadId required', {
        status: 400,
      });
    }

    // Get the last message (the user's prompt)
    const lastMessage = messages.at(-1);
    if (!lastMessage) {
      return new Response('Bad Request: no message to process', {
        status: 400,
      });
    }

    // Convert message content to string if it's an array
    let promptText = '';
    if (typeof lastMessage.content === 'string') {
      promptText = lastMessage.content;
    } else if (Array.isArray(lastMessage.content)) {
      // Extract text from content parts
      promptText = lastMessage.content
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('');
    }

    // Get AI service URL - default to local for development
    const aiServiceUrl =
      process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:3999';

    // Forward the request to the AI service
    const response = await fetch(`${aiServiceUrl}/api/agents/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: lastMessage.role,
            content: promptText,
          },
        ],
        threadId,
        resourceId: clerkId, // Use clerkId as resourceId for Mastra
        // Pass runtime context for dynamic model selection
        runtimeContext: selectedModelId
          ? {
              'chat-model': selectedModelId,
            }
          : undefined,
        memoryOptions: {
          lastMessages: 20,
          semanticRecall: {
            topK: 3,
            messageRange: {
              before: 1,
              after: 1,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    // Return the streaming response directly
    return new Response(response.body, {
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') || 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
