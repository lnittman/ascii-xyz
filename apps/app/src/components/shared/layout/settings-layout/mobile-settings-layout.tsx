'use client';

import { cn } from '@repo/design/lib/utils';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { SettingsLayoutItem } from './index';

interface MobileSettingsLayoutProps {
  children: React.ReactNode;
  items: SettingsLayoutItem[];
  onNavigate?: (href: string) => void;
  sidebarOpen?: boolean;
}

export function MobileSettingsLayout({
  children,
  items,
  onNavigate,
  sidebarOpen = false,
}: MobileSettingsLayoutProps) {
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else {
      // Default to window.location for basic navigation
      window.location.href = href;
    }
  };

  // Check scroll state for mobile carousel
  const checkScrollState = () => {
    if (!scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    checkScrollState();
    container.addEventListener('scroll', checkScrollState, { passive: true });

    return () => container.removeEventListener('scroll', checkScrollState);
  }, []);

  useEffect(() => {
    // Recheck scroll state when items change
    checkScrollState();
  }, [items]);

  // Calculate margins based on sidebar state
  const sidebarWidth = sidebarOpen ? 280 : 0;

  return (
    <div className="flex flex-1 flex-col lg:hidden">
      {/* Mobile horizontal tab list with scroll indicators */}
      <div className="relative border-border border-b bg-background">
        {/* Left fade indicator */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-12 bg-gradient-to-r from-background to-transparent" />
        )}

        {/* Right fade indicator */}
        {canScrollRight && (
          <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-12 bg-gradient-to-l from-background to-transparent" />
        )}

        {/* Scrollable tabs container */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="scrollbar-none flex overflow-x-auto py-2"
            style={{
              marginLeft: sidebarWidth,
              scrollBehavior: 'smooth',
            }}
          >
            {/* Spacer for fade effect */}
            <div className="w-3 flex-shrink-0" />

            {items.map((item) => {
              const isActive = pathname === item.href;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    'mx-1 flex items-center gap-2 whitespace-nowrap rounded-none px-3 py-2 transition-all duration-200',
                    isActive
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'transition-colors duration-200',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}

            {/* Spacer for fade effect */}
            <div className="w-3 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Mobile content with sidebar awareness */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
