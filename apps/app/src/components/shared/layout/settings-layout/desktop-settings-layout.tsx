'use client';

import { cn } from '@repo/design/lib/utils';
import { usePathname } from 'next/navigation';
import type React from 'react';
import type { SettingsLayoutItem } from './index';

interface DesktopSettingsLayoutProps {
  children: React.ReactNode;
  items: SettingsLayoutItem[];
  onNavigate?: (href: string) => void;
}

export function DesktopSettingsLayout({
  children,
  items,
  onNavigate,
}: DesktopSettingsLayoutProps) {
  const pathname = usePathname();

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else {
      // Default to window.location for basic navigation
      window.location.href = href;
    }
  };

  return (
    <div className="relative hidden min-h-0 flex-1 lg:flex">
      {/* Scrollable container for both sidebar and content - extends into header area */}
      <div className="scrollbar-none -mt-[48px] flex flex-1 overflow-y-auto">
        {/* Sidebar wrapper */}
        <div className="relative w-64 pt-[48px]">
          {/* Settings Title that scrolls up */}
          <div className="px-3 pt-8 pb-4">
            <h1 className="font-medium text-foreground text-xl">Settings</h1>
          </div>

          {/* Sidebar navigation that sticks when it reaches the header */}
          <aside className="sticky top-[56px] w-64 bg-background">
            <nav className="p-3">
              <ul className="space-y-1">
                {items.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavigation(item.href)}
                        className={cn(
                          'group flex max-h-[32px] w-full items-center gap-3 rounded-none px-2 py-6 menu-item',
                          isActive
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                        )}
                      >
                        <span
                          className={cn(
                            'transition-none',
                            isActive
                              ? 'text-foreground'
                              : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        >
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>

        {/* Main content that scrolls with sidebar */}
        <main className="min-h-0 flex-1 pt-[48px] pl-8">
          <div className="px-4 pt-8 pb-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
