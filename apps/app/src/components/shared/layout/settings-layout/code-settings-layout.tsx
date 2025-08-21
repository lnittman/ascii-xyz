'use client';

import { cn } from '@repo/design/lib/utils';
import { usePathname } from 'next/navigation';
import type React from 'react';
import type { SettingsLayoutItem } from './index';

interface CodeSettingsLayoutProps {
  children: React.ReactNode;
  title?: string;
  items: SettingsLayoutItem[];
  onNavigate?: (href: string) => void;
}

export function CodeSettingsLayout({
  children,
  title = 'Settings',
  items,
  onNavigate,
}: CodeSettingsLayoutProps) {
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
    <div className="flex h-full w-full flex-col bg-background">
      {/* Fixed sidebar */}
      <aside className="fixed top-[calc(3rem+56px)] left-0 z-20 h-[calc(100vh-3rem-56px)] w-72 overflow-y-auto bg-background">
        <nav className="p-4">
          <ul className="space-y-2">
            {items.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      'group flex max-h-[32px] w-full items-center gap-3 rounded-none px-2 py-2 transition-all duration-200',
                      isActive
                        ? 'bg-accent text-foreground'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                    )}
                    style={{
                      fontSize: '12px',
                      fontWeight: isActive ? '700' : '500',
                      textShadow: isActive ? '0.3px 0 0 currentColor' : 'none',
                    }}
                  >
                    <span
                      className={cn(
                        'flex-shrink-0 transition-colors duration-200',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="font-mono uppercase">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-72 flex flex-1 flex-col">
        {/* Content area with scrolling */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
