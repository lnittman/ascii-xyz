import { handleORPCRequest } from '@repo/orpc';
import { Hono } from 'hono';
import type { Env } from '../index';
import { verifyAuth } from '../lib/auth';

const app = new Hono<{ Bindings: Env }>();

// Handle all oRPC requests
app.all('/*', async (c) => {
  // Verify Clerk token and extract user ID
  const authHeader = c.req.header('Authorization');
  const clerkId = (await verifyAuth(authHeader, c.env)) || undefined;

  // Create context for oRPC
  const context = {
    clerkId,
    headers: c.req.raw.headers,
    env: c.env,
  };

  // Handle the oRPC request
  const response = await handleORPCRequest(c.req.raw, context);

  if (response) {
    return response;
  }

  return c.json(
    {
      error: 'Not Found',
      message: 'The requested oRPC procedure does not exist',
    },
    404
  );
});

export default app;
