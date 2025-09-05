'use client';

import type React from 'react';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { cn } from '@repo/design/lib/utils';
import { NavigationHeader } from '@/components/shared/layout/navigation-header';
import { PageGradientOverlay } from '@/components/shared/layout/page-gradient-overlay';
import { MobileUserMenuOverlay } from '@/components/shared/menu/user/mobile-user-menu-overlay';
import { mobileUserMenuOpenAtom } from '@/atoms/menus';

interface ClientLayoutProps {
  children: React.ReactNode;
}

/**
 * Client-side layout component with consistent header and mobile overlays
 */
export function ClientLayout({ children }: ClientLayoutProps) {
  const [mobileMenuOpen] = useAtom(mobileUserMenuOpenAtom);
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const previousHtmlOverflow = document.documentElement.style.overflow;
      const previousBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = previousHtmlOverflow;
        document.body.style.overflow = previousBodyOverflow;
      };
    }
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background antialiased">
      {/* Sticky navigation header */}
      <NavigationHeader />
      
      {/* Page edge gradient overlays */}
      <PageGradientOverlay />
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Mobile Menu Overlay */}
      <MobileUserMenuOverlay />
    </div>
  );
}