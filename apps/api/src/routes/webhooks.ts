import { Hono } from 'hono';
import type { Env } from '../index';

export const webhookRoutes = new Hono<{ Bindings: Env }>();

webhookRoutes.post('/', async (c) => {
  return c.json({
    message: 'Webhooks endpoint - to be implemented',
    todo: [
      'Add webhook signature validation',
      'Process webhook events',
      'Integrate with services',
    ],
  });
});
