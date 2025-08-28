import type React from 'react';

interface UnauthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function UnauthenticatedLayout({
  children,
}: UnauthenticatedLayoutProps) {
  return (
    <div className="relative flex h-screen w-screen flex-col bg-background overflow-hidden">
      {/* Logo in top left */}
      <div className="absolute top-4 left-4 z-50">
        <span className="font-mono text-foreground text-lg font-bold">ascii</span>
      </div>

      {/* Children content */}
      {children}
    </div>
  );
}