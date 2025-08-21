import { createORPCClient } from '@repo/orpc/client';

// Simple client factory - no context needed
export function createORPCClientInstance(token?: string) {
  const baseURL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : '/api';

  return createORPCClient({
    baseURL,
    ...(token && {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  });
}

// Default client for anonymous access or cookie auth
export const orpcClient = createORPCClientInstance();

// For authenticated requests (get token from Clerk when needed)
export async function getAuthenticatedClient() {
  // Note: In components, you'll call this inside your hooks/data-fetching functions
  const { auth } = await import('@clerk/nextjs/server');
  const { getToken } = await auth();
  const token = await getToken();

  return createORPCClientInstance(token || undefined);
}
