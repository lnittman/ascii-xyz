import type React from 'react';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { auth } from '@repo/auth/server';
import { redirect } from 'next/navigation';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/signin');
  }
  
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}