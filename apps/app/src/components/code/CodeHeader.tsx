'use client';

import { useTransitionRouter } from 'next-view-transitions';
import type React from 'react';

import { ArborAsciiLogo } from '@/components/code/ArborAsciiLogo';
import { CodeUserMenu } from '@/components/code/CodeUserMenu';

export function CodeHeader(): React.ReactElement {
  const router = useTransitionRouter();

  return (
    <header className="fixed top-0 right-0 left-0 z-50 h-16 bg-background">
      <div className="mx-4 flex h-full items-center justify-between">
        {/* Left side - ASCII arbor logo */}
        <div className="flex items-center">
          <ArborAsciiLogo size="xs" onClick={() => router.push('/code')} />
        </div>

        {/* Right side - User menu */}
        <CodeUserMenu />
      </div>
    </header>
  );
}
