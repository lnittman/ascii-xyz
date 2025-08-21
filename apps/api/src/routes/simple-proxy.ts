import { Hono } from 'hono';
import type { Env } from '../index';

const app = new Hono<{ Bindings: Env }>();

// Simple proxy to forward requests to the main app
app.all('/*', async (c) => {
  const url = new URL(c.req.url);
  const mainAppUrl = process.env.MAIN_APP_URL || 'http://localhost:3000';

  // Forward the request to the main app
  const proxyUrl = `${mainAppUrl}/api/orpc${url.pathname}`;

  const response = await fetch(proxyUrl, {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: c.req.raw.body,
  });

  return response;
});

export default app;
