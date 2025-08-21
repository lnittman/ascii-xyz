'use server';

import { createRouterClient } from '@orpc/server';
import { auth } from '@repo/auth/server';
import { router } from './router';

// Create server action client with proper context
export const serverAction = createRouterClient(router, {
  context: async () => {
    const { userId } = await auth();
    return {
      clerkId: userId || undefined,
      headers: {},
      env: process.env as any,
    };
  },
});

// Legacy wrapper for compatibility
export async function invokeServerAction<TInput, TOutput>(
  action: any,
  input: TInput
): Promise<TOutput> {
  try {
    const result = await action(input);

    // Handle ORPC server action tuple response [error, data]
    if (Array.isArray(result) && result.length === 2) {
      const [error, data] = result;
      if (error) {
        throw new Error(error.message || 'Server action failed');
      }
      return data;
    }

    // Direct return if not a tuple
    return result;
  } catch (error: any) {
    throw new Error(error.message || 'Server action failed');
  }
}
