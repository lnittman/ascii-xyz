'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@repo/auth/client';
import { cn } from '@repo/design/lib/utils';
import { Sparkle, Layers } from 'lucide-react';
import { UserMenu } from '../menu/user/user-menu';
import { MobileUserMenu } from '../menu/user/mobile-user-menu';

export function NavigationHeader() {
  const { user } = useUser();
  const pathname = usePathname();

  // Determine active section based on pathname
  const isGallery = pathname === '/' || pathname.includes('/art/');
  const isGenerate = pathname === '/generate';

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b border-border">
      <div className="flex h-16 items-center justify-between px-4 relative">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="font-mono text-2xl font-bold text-foreground">ASCII</span>
        </Link>

        {/* Center Navigation Toggle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-muted border border-border rounded-lg h-9 p-1 flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 px-3 h-full text-sm font-medium rounded-md transition-all duration-200",
                isGallery
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Gallery</span>
            </Link>
            <Link
              href="/generate"
              className={cn(
                "flex items-center gap-2 px-3 h-full text-sm font-medium rounded-md transition-all duration-200",
                isGenerate
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkle className="w-4 h-4" />
              <span className="hidden sm:inline">Generate</span>
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
    </header>
  );
}