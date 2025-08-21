import type React from 'react';
import { ErrorBoundary } from '@/components/shared/error-boundary';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}