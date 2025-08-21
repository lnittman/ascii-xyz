import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { CORSPlugin } from '@orpc/server/plugins';
import type { Context } from './context';
import { router } from './router';

// Create OpenAPI handler for the oRPC router
export const orpcHandler = new OpenAPIHandler(router, {
  plugins: [
    new CORSPlugin({
      origin: [
        'http://localhost:3000',
        'http://localhost:4000',
        'https://app.arbor.xyz',
        'https://*.arbor.xyz',
      ],
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Clerk-Session-Id'],
      exposeHeaders: ['Content-Length', 'X-Request-Id'],
      maxAge: 86400,
    }),
  ],
});

/**
 * Handle oRPC requests with context
 */
export async function handleORPCRequest(
  request: Request,
  context: Context
): Promise<Response | null> {
  const { matched, response } = await orpcHandler.handle(request, {
    prefix: '/api/orpc',
    context,
  });

  return matched ? response : null;
}
