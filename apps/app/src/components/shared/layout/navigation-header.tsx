'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@repo/auth/client';
import { cn } from '@repo/design/lib/utils';
import { Plus, Stack } from '@phosphor-icons/react';
import { UserMenu } from '../menu/user/user-menu';
import { MobileUserMenu } from '../menu/user/mobile-user-menu';

export function NavigationHeader() {
  const { user } = useUser();
  const pathname = usePathname();

  // Determine active section based on pathname
  const isGallery = pathname === '/gallery' || pathname?.includes('/art/');
  const isCreate = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border/30">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-12 items-center justify-between px-6 relative">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="font-mono text-sm font-medium text-foreground">ascii</span>
        </Link>

        {/* Center Navigation Toggle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-muted/30 border border-border/50 rounded-sm h-8 p-0.5 flex items-center gap-0.5">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-1.5 h-full text-xs font-medium rounded-sm px-2.5 transition-colors duration-0 cursor-default",
                isCreate
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              )}
            >
              <Plus className="w-3.5 h-3.5" weight={isCreate ? 'duotone' : 'regular'} />
              <span className="hidden sm:inline">create</span>
            </Link>
            <Link
              href="/gallery"
              className={cn(
                "flex items-center gap-1.5 h-full text-xs font-medium rounded-sm px-2.5 transition-colors duration-0 cursor-default",
                isGallery
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              )}
            >
              <Stack className="w-3.5 h-3.5" weight={isGallery ? 'duotone' : 'regular'} />
              <span className="hidden sm:inline">gallery</span>
            </Link>
          </div>
        </div>

        {/* User Menu - Right */}
        <div className="flex items-center gap-2">
          {/* Desktop user menu */}
          <div className="hidden md:block">
            {user && <UserMenu />}
          </div>
          {/* Mobile user menu */}
          <div className="md:hidden">
            {user && <MobileUserMenu />}
          </div>
        </div>
      </div>
      </div>
    </header>
  );
}
