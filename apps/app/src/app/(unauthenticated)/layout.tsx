import type React from 'react';

interface UnauthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function UnauthenticatedLayout({
  children,
}: UnauthenticatedLayoutProps) {
  return (
    <div className="relative flex h-screen w-screen flex-col bg-background overflow-hidden">
      {/* Children content - no header text for full immersive experience */}
      {children}
    </div>
  );
}