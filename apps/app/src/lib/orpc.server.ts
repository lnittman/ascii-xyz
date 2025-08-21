import 'server-only';

import { auth } from '@repo/auth/server';
import { createServerClient } from '@repo/orpc/server';

// Create a client for each request with the appropriate context
export async function getServerClient() {
  const { userId } = await auth();
  return createServerClient({ clerkId: userId || undefined });
}
