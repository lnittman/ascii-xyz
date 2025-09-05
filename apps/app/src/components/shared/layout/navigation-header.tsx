'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@repo/auth/client';
import { cn } from '@repo/design/lib/utils';
import { Sparkle, Stack } from '@phosphor-icons/react';
import { UserMenu } from '../menu/user/user-menu';
import { MobileUserMenu } from '../menu/user/mobile-user-menu';

export function NavigationHeader() {
  const { user } = useUser();
  const pathname = usePathname();

  // Determine active section based on pathname
  const isGallery = pathname === '/gallery' || pathname?.includes('/art/');
  const isCreate = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-6 relative">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="font-mono text-2xl font-bold text-foreground">ASCII</span>
        </Link>

        {/* Center Navigation Toggle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-muted/30 border border-border/60 rounded-md h-10 p-0.5 flex items-center gap-0.5">
            <Link
              href="/gallery"
              className={cn(
                "flex items-center gap-2 h-full text-sm font-medium rounded-[8px] hover-bg px-3.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
                isGallery
                  ? "bg-background text-foreground"
                  : "text-muted-foreground/80 hover:text-foreground hover:bg-background/40"
              )}
            >
              <Stack className="w-4 h-4" />
              <span className="hidden sm:inline">gallery</span>
            </Link>
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 h-full text-sm font-medium rounded-[8px] hover-bg px-3.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
                isCreate
                  ? "bg-background text-foreground"
                  : "text-muted-foreground/80 hover:text-foreground hover:bg-background/40"
              )}
            >
              <Sparkle className="w-4 h-4" />
              <span className="hidden sm:inline">create</span>
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
