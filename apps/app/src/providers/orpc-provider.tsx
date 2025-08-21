'use client';

import { createContext, useContext, useMemo } from 'react';
import { type ORPCClient, createORPCClient } from '@repo/orpc/client';

const ORPCContext = createContext<ORPCClient | null>(null);

export function ORPCProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    return createORPCClient({
      baseURL: process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api`
        : '/api',
    });
  }, []);

  return (
    <ORPCContext.Provider value={client}>
      {children}
    </ORPCContext.Provider>
  );
}

export function useORPC() {
  const client = useContext(ORPCContext);
  if (!client) {
    throw new Error('useORPC must be used within ORPCProvider');
  }
  return client;
}

// Alias for authenticated calls (same client, auth handled server-side via cookies)
export function useAuthenticatedORPC() {
  return useORPC();
}
