import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { verifyAuth } from './lib/auth';

export interface Env {
  DATABASE_URL?: string;
  CLERK_SECRET_KEY?: string;
  CLERK_JWT_PUBLIC_KEY?: string;
  CLERK_JWT_ISSUER?: string;
  CLERK_ISSUER?: string;
  AI_SERVICE_URL?: string;
  MASTRA_URL?: string;
  NEXT_PUBLIC_AI_URL?: string;
  OPENROUTER_API_KEY?: string;
  LOGS_CACHE: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3006',
      'http://localhost:3000',
      'http://localhost:4000',
      'https://logs-xyz.vercel.app',
      'https://*.vercel.app',
      'https://app.logs.xyz',
      'https://*.logs.xyz',
      'https://logs.xyz',
    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Clerk-Session-Id'],
  })
);

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'logs-api',
    version: '1.0.0',
    kv: c.env.LOGS_CACHE ? 'connected' : 'not connected',
  });
});

// Chat proxy to AI service
app.all('/api/chat/*', async (c) => {
  const aiServiceUrl =
    c.env.AI_SERVICE_URL ||
    c.env.MASTRA_URL ||
    'http://localhost:3002';
  const path = c.req.path.replace('/api/chat', '/api/agents/chat');

  // Verify Clerk auth if Authorization header present
  const authHeader = c.req.header('Authorization');
  const clerkId = await verifyAuth(authHeader, c.env);

  const headers = new Headers(c.req.raw.headers);
  if (clerkId) {
    headers.set('x-clerk-id', clerkId);
  }

  const response = await fetch(`${aiServiceUrl}${path}`, {
    method: c.req.method,
    headers,
    body: c.req.raw.body,
  });

  return response;
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    service: 'logs-api',
    version: '1.0.0',
    status: 'operational',
    environment: c.env.NODE_ENV || 'development',
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((_err, c) => {
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
