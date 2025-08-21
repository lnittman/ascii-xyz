'use client';

import { cn } from '@repo/design/lib/utils';
import { useTransitionRouter } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import type React from 'react';

interface CodeSettingsLayoutProps {
  children: React.ReactNode;
  title?: string;
  items: {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
  }[];
}

export function CodeSettingsLayout({
  children,
  title = 'Settings',
  items,
}: CodeSettingsLayoutProps) {
  const pathname = usePathname();
  const router = useTransitionRouter();

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
                    onClick={() => router.push(item.href)}
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
                    <span className="text-left font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Header */}
      <div className="sticky top-0 z-10 flex h-14 items-center px-6">
        <h1 className="font-medium text-foreground text-lg">{title}</h1>
      </div>

      {/* Main content - centered with max-width in remaining space, with left margin */}
      <main className="ml-72 flex-1 overflow-y-auto">
        <div className="flex h-full justify-center">
          <div className="w-full max-w-4xl p-4">{children}</div>
        </div>
      </main>
    </div>
  );
}
