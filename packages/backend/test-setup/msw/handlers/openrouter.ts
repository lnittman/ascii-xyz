import { http, HttpResponse } from 'msw';

// Default mock response for OpenRouter chat completions
const defaultChatResponse = {
  id: 'chatcmpl-mock',
  object: 'chat.completion',
  created: Date.now(),
  model: 'openai/gpt-4o',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: JSON.stringify({
          interpretation: 'A simple test animation',
          style: 'geometric',
          movement: 'pulsing',
          frameCount: 3,
          width: 40,
          height: 10,
          fps: 12,
          characters: ['*', '.', ' ', '#'],
          metadata: {
            mood: 'calm',
            complexity: 'simple',
            dynamism: 'slow',
          },
        }),
      },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 100,
    completion_tokens: 50,
    total_tokens: 150,
  },
};

// Default mock frame response
const defaultFrameResponse = {
  id: 'chatcmpl-frame-mock',
  object: 'chat.completion',
  created: Date.now(),
  model: 'openai/gpt-4o',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: Array(10)
          .fill(null)
          .map(() => '*'.repeat(40))
          .join('\n'),
      },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 200,
    completion_tokens: 100,
    total_tokens: 300,
  },
};

export const openrouterHandlers = [
  // OpenRouter chat completions endpoint
  http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
    const body = await request.json() as { messages?: Array<{ content: string }> };
    const messages = body.messages || [];
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage?.content || '';

    // Determine response type based on prompt content
    if (content.includes('frame') && content.includes('ASCII')) {
      // Frame generation request
      return HttpResponse.json(defaultFrameResponse);
    }

    // Plan generation request (default)
    return HttpResponse.json(defaultChatResponse);
  }),
];

// Helper to create custom plan response
export function createOpenRouterPlanResponse(plan: {
  interpretation: string;
  style: string;
  movement: string;
  frameCount: number;
  width: number;
  height: number;
  fps: number;
  characters: string[];
}) {
  return http.post('https://openrouter.ai/api/v1/chat/completions', () => {
    return HttpResponse.json({
      ...defaultChatResponse,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify(plan),
          },
          finish_reason: 'stop',
        },
      ],
    });
  });
}

// Helper to create custom frame response
export function createOpenRouterFrameResponse(frame: string) {
  return http.post('https://openrouter.ai/api/v1/chat/completions', () => {
    return HttpResponse.json({
      ...defaultFrameResponse,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: frame,
          },
          finish_reason: 'stop',
        },
      ],
    });
  });
}

// Helper to create error response
export function createOpenRouterErrorResponse(message: string, status = 500) {
  return http.post('https://openrouter.ai/api/v1/chat/completions', () => {
    return HttpResponse.json(
      {
        error: {
          message,
          type: 'api_error',
          code: status === 429 ? 'rate_limit_exceeded' : 'internal_error',
        },
      },
      { status }
    );
  });
}

// Helper to create rate limit response
export function createOpenRouterRateLimitResponse() {
  return createOpenRouterErrorResponse('Rate limit exceeded', 429);
}

// Helper to create invalid API key response
export function createOpenRouterAuthErrorResponse() {
  return http.post('https://openrouter.ai/api/v1/chat/completions', () => {
    return HttpResponse.json(
      {
        error: {
          message: 'Invalid API key',
          type: 'authentication_error',
          code: 'invalid_api_key',
        },
      },
      { status: 401 }
    );
  });
}

// Helper to create streaming response (for future use)
export function createOpenRouterStreamingResponse(chunks: string[]) {
  return http.post('https://openrouter.ai/api/v1/chat/completions', () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          const data = {
            id: 'chatcmpl-stream',
            object: 'chat.completion.chunk',
            created: Date.now(),
            model: 'openai/gpt-4o',
            choices: [
              {
                index: 0,
                delta: { content: chunk },
                finish_reason: null,
              },
            ],
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
      },
    });
  });
}
