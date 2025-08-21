import type { RuntimeContext } from '../types/runtime';

/**
 * Create a runtime context from request data
 */
export function createRuntimeContext(
  data: Record<string, any>
): RuntimeContext {
  return {
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...data,
  };
}

/**
 * Extract runtime context from a request
 */
export async function extractRuntimeContext(
  request: Request
): Promise<RuntimeContext> {
  try {
    const body = (await request.json()) as {
      data?: Record<string, any>;
      [key: string]: any;
    };
    const { data = {}, ...rest } = body;

    // Extract headers that might be useful
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (key.startsWith('x-') || key === 'user-agent') {
        headers[key] = value;
      }
    });

    return createRuntimeContext({
      ...data,
      headers,
      method: request.method,
      url: request.url,
    });
  } catch (_error) {
    return createRuntimeContext({});
  }
}

/**
 * Merge multiple runtime contexts
 */
export function mergeRuntimeContexts(
  ...contexts: RuntimeContext[]
): RuntimeContext {
  return contexts.reduce(
    (merged, context) => ({
      ...merged,
      ...context,
      metadata: {
        ...merged.metadata,
        ...context.metadata,
      },
    }),
    {} as RuntimeContext
  );
}
