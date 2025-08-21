'use client';

import { sidebarOpenAtom } from '@/atoms/layout/sidebar';
import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import { useAtom } from 'jotai';
import type React from 'react';
import { useEffect } from 'react';
import { CodeSettingsLayout } from './CodeSettingsLayout';
import { DesktopSettingsLayout } from './DesktopSettingsLayout';
import { MobileSettingsLayout } from './MobileSettingsLayout';

interface SettingsLayoutProps {
  children: React.ReactNode;
  title?: string;
  centerLayout?: boolean; // If true, centers the entire layout; if false, only centers content
  items: {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
  }[];
}

export function SettingsLayout({
  children,
  title = 'Settings',
  centerLayout = true,
  items,
}: SettingsLayoutProps) {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Close sidebar on mobile when component mounts (same logic as chat pages)
  useEffect(() => {
    if (!isDesktop && isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 300); // Wait for page transition to complete

      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array - only run on mount

  if (centerLayout) {
    // Default layout: everything centered, responsive to main sidebar
    return (
      <div className="flex h-full w-full flex-col bg-background">
        {/* Content area with equal padding from main sidebar and screen edge */}
        <div className="min-h-0 flex-1 lg:px-12">
          {/* Max-width container centered within the available space */}
          <div className="mx-auto flex h-full max-w-6xl flex-col">
            <MobileSettingsLayout items={items}>
              {children}
            </MobileSettingsLayout>

            <DesktopSettingsLayout items={items}>
              {children}
            </DesktopSettingsLayout>
          </div>
        </div>
      </div>
    );
  }

  // Alternative layout: sidebar left-aligned, content centered (for code settings)
  return (
    <CodeSettingsLayout title={title} items={items}>
      {children}
    </CodeSettingsLayout>
  );
}
