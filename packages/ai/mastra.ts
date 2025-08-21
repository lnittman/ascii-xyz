import { MastraClient } from '@mastra/client-js';

// Simple factory function - no business logic
export function createMastraClient(config?: {
  baseUrl?: string;
  apiKey?: string;
}) {
  const headers: Record<string, string> = {};

  if (config?.apiKey || process.env.MASTRA_KEY) {
    headers['x-mastra-key'] = config?.apiKey || process.env.MASTRA_KEY!;
  }

  return new MastraClient({
    baseUrl:
      config?.baseUrl ||
      process.env.NEXT_PUBLIC_AI_URL ||
      'http://localhost:3999',
    headers,
  });
}

// Default singleton instance for convenience
export const mastra = createMastraClient();
