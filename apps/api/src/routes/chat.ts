import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { stream } from 'hono/streaming';
import type { Env } from '../index';

const app = new Hono<{ Bindings: Env }>();

// CORS configuration
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://arbor.xyz'],
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);

// Verify Clerk bearer tokens; fall back to API token if configured
app.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401);
  }

  // Prefer Clerk verification
  try {
    const { verifyAuth } = await import('../lib/auth');
    const clerkId = await verifyAuth(authHeader, c.env as any);
    if (clerkId) {
      // Attach derived clerkId for downstream usage
      c.req.raw.headers.set('x-clerk-id', clerkId);
      return next();
    }
  } catch {}

  // Fallback: check static API token if provided
  const token = authHeader.substring(7);
  const authToken = c.env.API_TOKEN;
  if (authToken && token === authToken) {
    return next();
  }

  return c.json({ error: 'Unauthorized' }, 401);
});

// Proxy chat streaming to Mastra AI service
app.post('/stream', async (c) => {
  try {
    // Get authenticated user from verified header or Clerk token
    const authHeader = c.req.header('Authorization');
    let userId: string | undefined =
      c.req.raw.headers.get('x-clerk-id') || undefined;
    if (!userId && authHeader) {
      const { verifyAuth } = await import('../lib/auth');
      userId = (await verifyAuth(authHeader, c.env as any)) || undefined;
    }
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get request body
    const body = await c.req.json();

    // Forward to Mastra AI service
    const mastraUrl =
      c.env.MASTRA_URL || c.env.AI_SERVICE_URL || 'http://localhost:3999';
    const response = await fetch(`${mastraUrl}/api/agents/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add Mastra API key if configured
        ...(c.env.MASTRA_KEY && {
          'x-mastra-key': c.env.MASTRA_KEY,
        }),
      },
      body: JSON.stringify({
        ...body,
        // Ensure resourceId is set to the authenticated user
        resourceId: userId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return c.json(
        {
          error: 'AI service error',
          details: response.status === 500 ? 'Internal error' : error,
        },
        response.status as any
      );
    }

    // Set headers for SSE
    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');

    // Stream the response back to client
    return stream(c, async (stream) => {
      const reader = response.body?.getReader();
      if (!reader) {
        await stream.write('data: {"error":"No response body"}\n\n');
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          // Forward the chunk as-is
          await stream.write(value);
        }
      } catch (_error) {
        await stream.write(`data: {"error":"Stream interrupted"}\n\n`);
      } finally {
        reader.releaseLock();
      }
    });
  } catch (error: any) {
    return c.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      500
    );
  }
});

// Health check for chat service
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'chat-proxy' });
});

export default app;
