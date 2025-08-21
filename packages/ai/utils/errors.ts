/**
 * Custom error class for AI operations
 */
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * Create an error from an API response
 */
export async function createErrorFromResponse(
  response: Response
): Promise<AIError> {
  let message = `HTTP error! status: ${response.status}`;
  let details: any;

  try {
    const data = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };
    message = data.error?.message || data.message || message;
    details = data;
  } catch {
    // If response is not JSON, use status text
    message = response.statusText || message;
  }

  return new AIError(
    message,
    `HTTP_${response.status}`,
    response.status,
    details
  );
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof AIError) {
    // Retry on rate limits and server errors
    const { statusCode } = error;
    return (
      statusCode === 429 ||
      (statusCode !== undefined && statusCode >= 500 && statusCode < 600)
    );
  }

  // Retry on network errors
  return (
    error.message.includes('fetch failed') ||
    error.message.includes('network') ||
    error.message.includes('ECONNREFUSED')
  );
}

/**
 * Wrap an async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler?: (error: Error) => void
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const aiError =
        error instanceof AIError
          ? error
          : new AIError(
              error instanceof Error ? error.message : 'Unknown error',
              'UNKNOWN_ERROR'
            );

      errorHandler?.(aiError);
      throw aiError;
    }
  }) as T;
}
