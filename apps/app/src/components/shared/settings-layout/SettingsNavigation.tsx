'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@repo/design/lib/utils';
import {
  User,
  Palette,
  Database,
  CreditCard,
  Cpu,
} from '@phosphor-icons/react';

type IconName = 'User' | 'Palette' | 'Database' | 'CreditCard' | 'Models';

export interface SettingsItem {
  id: string;
  label: string;
  href: string;
  iconName?: IconName;
}

function getIcon(icon?: IconName) {
  switch (icon) {
    case 'User':
      return <User className="h-4 w-4" />;
    case 'Palette':
      return <Palette className="h-4 w-4" />;
    case 'Database':
      return <Database className="h-4 w-4" />;
    case 'CreditCard':
      return <CreditCard className="h-4 w-4" />;
    case 'Models':
      return <Cpu className="h-4 w-4" />;
    default:
      return null;
  }
}

export function SettingsNavigation({
  items,
  children,
}: {
  items: SettingsItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Mobile: top tabs */}
      <div className="md:hidden sticky top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="relative">
          {/* Side gradient fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent" />
          <div className="overflow-x-auto no-scrollbar px-4">
            <ul className="flex gap-2 py-3 min-w-full">
              {items.map((item) => {
                const active = pathname?.startsWith(item.href) ?? false;
                return (
                  <li key={item.id} className="flex-shrink-0">
                    <Link
                      href={item.href}
                      className={cn(
                        'inline-flex h-9 items-center justify-center gap-2 px-4 rounded-md',
                        'font-mono text-[10px] uppercase tracking-widest whitespace-nowrap',
                        'border transition-all duration-200',
                        active
                          ? 'bg-foreground text-background border-foreground'
                          : 'border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border'
                      )}
                    >
                      {getIcon(item.iconName)}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              {/* End spacer */}
              <li className="shrink-0 w-4" aria-hidden />
            </ul>
          </div>
        </div>
      </div>

      {/* Desktop: sidebar + content */}
      <div className="px-6 py-8">
        <div className="max-w-5xl mx-auto md:grid md:grid-cols-[200px_1fr] gap-8">
          <aside className="hidden md:block">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider mb-6">
              SETTINGS
            </h2>
            <nav>
              <ul className="space-y-1">
                {items.map((item) => {
                  const active = pathname?.startsWith(item.href) ?? false;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md',
                          'font-mono text-xs uppercase tracking-wider',
                          'transition-all duration-200',
                          active
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        {getIcon(item.iconName)}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <section className="min-h-[60vh]">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}