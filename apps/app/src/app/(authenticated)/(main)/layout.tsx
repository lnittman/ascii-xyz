import type React from 'react';
import { LogsLayout } from './logs-layout';
import { unstable_cache } from 'next/cache';
import { auth } from '@repo/auth/server';
import { createServerClient } from '@repo/orpc/server';

interface MainLayoutProps {
  children: React.ReactNode;
}

// Cache user data with 5 minute revalidation
const getCachedUserData = unstable_cache(
  async (clerkId: string) => {
    const client = createServerClient({ clerkId });
    const user = await client.user.current();
    return { user };
  },
  ['user-data'],
  {
    revalidate: 300, // 5 minutes
    tags: ['user-data'],
  }
);

export default async function MainLayout({
  children,
}: MainLayoutProps) {
  const { userId: clerkId } = await auth();

  let initialUser;

  if (clerkId) {
    try {
      const cachedData = await getCachedUserData(clerkId);
      initialUser = cachedData.user;
    } catch (_error) {}
  }

  return (
    <LogsLayout initialUser={initialUser}>
      {children}
    </LogsLayout>
  );
}