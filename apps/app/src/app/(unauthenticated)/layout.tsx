'use client';

import type React from 'react';
import { useEffect } from 'react';

import { ThemeSwitcher } from '@/components/auth/ThemeSwitcher';
import { ScrollFadeContainer } from '@/components/shared/scroll-fade-container';
import { ForestScene, TreeType } from '@/lib/ascii';

interface UnauthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function UnauthenticatedLayout({
  children,
}: UnauthenticatedLayoutProps) {
  // Disable global page scroll to prevent iOS Safari elastic scrolling
  useEffect(() => {
    document.body.classList.remove('allow-scroll');
    // Prevent iOS Safari rubber band scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.classList.add('allow-scroll');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="relative flex h-screen flex-col bg-background"
      style={{
        touchAction: 'none', // Prevent iOS Safari gesture interactions
      }}
    >
      {/* Background Forest Animation */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <ForestScene
          width={120}
          height={40}
          fps={15}
          animated={true}
          windEffect={true}
          perspective="3d"
          treeTypes={[TreeType.PINE, TreeType.OAK, TreeType.BIRCH]}
          density={0.2}
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            transform: 'scale(1.2)',
            filter: 'blur(0.5px)',
          }}
        />
      </div>

      {/* Logo in top left - fixed position with higher z-index */}
      <div
        className="fixed z-50"
        style={{
          top: 'max(1rem, env(safe-area-inset-top, 1rem))',
          left: 'max(1rem, env(safe-area-inset-left, 1rem))',
        }}
      >
        <span className="font-medium text-foreground text-lg">logs</span>
      </div>

      {/* Theme switcher in top right - fixed position with higher z-index */}
      <div
        className="fixed z-50"
        style={{
          top: 'max(1rem, env(safe-area-inset-top, 1rem))',
          right: 'max(1rem, env(safe-area-inset-right, 1rem))',
        }}
      >
        <ThemeSwitcher />
      </div>

      {/* Scrollable main content with fade effects */}
      <ScrollFadeContainer
        showTop={true}
        showBottom={true}
        fadeSize={40}
        fadeColor="var(--background)"
        className="flex-1 overflow-hidden"
        scrollableClassName="h-full overflow-y-auto hide-scrollbar"
      >
        {/* Content wrapper that allows proper height calculation for centering and overflow */}
        <div
          className="flex min-h-full flex-col bg-background px-4"
          style={{
            touchAction: 'pan-y', // Allow vertical scrolling within this container
          }}
        >
          {/* Top spacer - grows to center content when short, with space for theme switcher */}
          <div
            className="flex-1"
            style={{
              minHeight: 'calc(env(safe-area-inset-top, 1rem) + 3rem)',
            }}
          />

          {/* Content container */}
          <div className="mx-auto w-full max-w-sm flex-shrink-0 py-4">
            {children}
          </div>

          {/* Bottom spacer - grows to center content, minimal bottom padding */}
          <div
            className="flex-1 pb-16"
            style={{
              minHeight: 'calc(env(safe-area-inset-bottom, 1rem) + 1rem)',
            }}
          />
        </div>
      </ScrollFadeContainer>
    </div>
  );
}
