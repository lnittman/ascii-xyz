import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import chatRoutes from './routes/chat';
import { healthRoutes } from './routes/health';
import openapiRoutes from './routes/openapi';
import orpcRoutes from './routes/orpc';
import { webhookRoutes } from './routes/webhooks';

export interface Env {
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
  REDIS_URL: string;
  AI_SERVICE_URL: string;
  API_TOKEN: string;
  SENTRY_DSN?: string;
  NODE_ENV?: string;
  CACHE_KV?: KVNamespace;
  DB?: D1Database;
  MASTRA_URL?: string;
  MASTRA_KEY?: string;
  NEXT_PUBLIC_AI_URL?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use('*', compress());
app.use('*', prettyJSON());

app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000',
      'https://app.arbor.xyz',
      'https://*.arbor.xyz',
    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Clerk-Session-Id'],
  })
);

app.use('/api/*', async (c, next) => {
  const publicRoutes = ['/api/health', '/api/webhooks', '/api/openapi'];
  const isPublicRoute = publicRoutes.some((route) =>
    c.req.path.startsWith(route)
  );

  if (isPublicRoute) {
    return next();
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return next();
});

// Mount core service routes
app.route('/api/health', healthRoutes);
app.route('/api/webhooks', webhookRoutes);

// Chat proxy routes
app.route('/api/chat', chatRoutes);

// All API functionality is handled through oRPC
app.route('/api', orpcRoutes);

// OpenAPI documentation
app.route('/api/openapi', openapiRoutes);

app.get('/', (c) => {
  return c.json({
    service: 'arbor-api',
    version: '1.0.0',
    status: 'operational',
  });
});

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

app.onError((_err, c) => {
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
