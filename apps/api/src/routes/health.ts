import { Hono } from 'hono';
import type { Env } from '../index';

export const healthRoutes = new Hono<{ Bindings: Env }>();

healthRoutes.get('/', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.NODE_ENV || 'development',
    services: {
      database: !!c.env.DATABASE_URL,
      cache: !!c.env.CACHE_KV,
      clerk: !!c.env.CLERK_SECRET_KEY,
    },
  });
});

healthRoutes.get('/detailed', async (c) => {
  const checks = {
    database: false,
    cache: false,
    clerk: false,
  };

  // Check database connection
  try {
    if (c.env.DB) {
      await c.env.DB.prepare('SELECT 1').first();
      checks.database = true;
    }
  } catch (_error) {}

  // Check cache connection
  try {
    if (c.env.CACHE_KV) {
      await c.env.CACHE_KV.get('health-check');
      checks.cache = true;
    }
  } catch (_error) {}

  // Check if Clerk is configured
  checks.clerk = !!c.env.CLERK_SECRET_KEY;

  const allHealthy = Object.values(checks).every(Boolean);

  return c.json(
    {
      status: allHealthy ? 'ok' : 'partial',
      timestamp: new Date().toISOString(),
      checks,
    },
    allHealthy ? 200 : 503
  );
});
