'use client';

import type React from 'react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

/**
 * Simplified client-side layout component for ASCII art app
 */
export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}