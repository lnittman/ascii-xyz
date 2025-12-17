import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

export function setupMswServer() {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
}

export { handlers };
export {
  openrouterHandlers,
  createOpenRouterPlanResponse,
  createOpenRouterFrameResponse,
  createOpenRouterErrorResponse,
  createOpenRouterRateLimitResponse,
  createOpenRouterAuthErrorResponse,
  createOpenRouterStreamingResponse,
} from './handlers';
export type { HttpHandler } from 'msw';
