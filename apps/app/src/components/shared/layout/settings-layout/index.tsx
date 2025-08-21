'use client';

import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import React from 'react';
import { CodeSettingsLayout } from './code-settings-layout';
import { DesktopSettingsLayout } from './desktop-settings-layout';
import { MobileSettingsLayout } from './mobile-settings-layout';

export interface SettingsLayoutItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface SettingsLayoutProps {
  children: React.ReactNode;
  title?: string;
  centerLayout?: boolean; // If true, centers the entire layout; if false, only centers content
  items: SettingsLayoutItem[];
  onSidebarChange?: (isOpen: boolean) => void;
}

export function SettingsLayout({
  children,
  title = 'Settings',
  centerLayout = true,
  items,
  onSidebarChange,
}: SettingsLayoutProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Notify parent about sidebar state changes
  React.useEffect(() => {
    if (!isDesktop && onSidebarChange) {
      // Close sidebar on mobile when component mounts
      const timer = setTimeout(() => {
        onSidebarChange(false);
      }, 300); // Wait for page transition to complete

      return () => clearTimeout(timer);
    }
  }, [isDesktop, onSidebarChange]);

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
