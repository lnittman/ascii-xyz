'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-mono mb-4">404</h1>
      <p className="text-muted-foreground mb-8">Page not found</p>
      <Link href="/" className="text-primary hover:underline">
        Return home
      </Link>
    </div>
  );
}
