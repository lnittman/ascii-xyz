'use client';

import { useEffect, useState } from 'react';

import { SignOutButton, useAuth, useUser } from '@clerk/nextjs';
import {
  ChatCircle,
  Desktop,
  Gear,
  Moon,
  SignOut,
  Sun,
} from '@phosphor-icons/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useTheme } from 'next-themes';
import { useTransitionRouter } from 'next-view-transitions';

import { mobileCodeUserMenuOpenAtom } from '@/atoms/mobile-menus';
import { TransitionAvatar } from '@/components/shared/avatar/TransitionAvatar';
import { Tabs, TabsList, TabsTrigger } from '@repo/design/components/ui/tabs';
import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import { cn } from '@repo/design/lib/utils';

export function CodeUserMenu() {
  const { isLoaded } = useAuth();
  const { setTheme: setNextTheme, theme, systemTheme } = useTheme();
  const { user } = useUser();
  const router = useTransitionRouter();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [mobileCodeUserMenuOpen, setMobileCodeUserMenuOpen] = useAtom(
    mobileCodeUserMenuOpenAtom
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before showing theme to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get user initials for avatar fallback
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || '?';

  const handleThemeChange = (value: string) => {
    setNextTheme(value);
  };

  // Navigate to settings page
  const handleOpenSettings = () => {
    setMenuOpen(false);
    router.push('/code/settings');
  };

  // Handle user menu click - open mobile sheet on mobile
  const handleUserMenuClick = () => {
    if (isDesktop) {
      setMenuOpen(!menuOpen);
    } else {
      setMobileCodeUserMenuOpen(true);
    }
  };

  if (!isLoaded) {
    return null;
  }

  // Use system as default if theme is not yet loaded
  const currentTheme = mounted ? theme || 'system' : 'system';

  return (
    <DropdownMenuPrimitive.Root
      open={isDesktop ? menuOpen : false}
      onOpenChange={isDesktop ? setMenuOpen : undefined}
    >
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          onClick={isDesktop ? undefined : handleUserMenuClick}
          className={cn(
            'group relative flex h-8 w-8 select-none items-center justify-center rounded-none',
            'transition-all duration-150'
          )}
        >
          <div className="relative">
            <TransitionAvatar
              src={user?.imageUrl}
              alt={user?.fullName || 'Avatar'}
              className="h-8 w-8 rounded-none"
              imageClassName="h-8 w-8 object-cover"
              fallback={
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-none border border-accent/40 bg-background font-medium text-foreground text-xs transition-all duration-150',
                    'group-hover:border-accent'
                  )}
                >
                  {initials}
                </div>
              }
            />
            <div
              className={cn(
                'pointer-events-none absolute inset-0 z-10 rounded-none bg-background/60 backdrop-blur-sm transition-opacity duration-200',
                menuOpen || mobileCodeUserMenuOpen
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100'
              )}
            />
          </div>
        </button>
      </DropdownMenuPrimitive.Trigger>

      <AnimatePresence>
        {menuOpen && (
          <DropdownMenuPrimitive.Portal forceMount>
            <DropdownMenuPrimitive.Content
              asChild
              className={cn(
                'z-[500] min-w-[262px] overflow-hidden rounded-none border border-border/20 bg-popover/95 p-1.5 shadow-sm backdrop-blur-sm',
                'data-[side=bottom]:origin-top data-[side=top]:origin-bottom'
              )}
              align="end"
              side="bottom"
              sideOffset={8}
            >
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                  mass: 0.8,
                }}
              >
                <div className="mb-1 flex items-center gap-3 border-slate-500/10 border-b px-2 py-1.5">
                  <TransitionAvatar
                    src={user?.imageUrl}
                    alt={user?.fullName || 'Avatar'}
                    className="h-10 w-10 flex-shrink-0 rounded-none"
                    imageClassName="h-10 w-10 object-cover"
                    skipInitialAnimation
                    fallback={
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-none border border-accent/40 bg-background font-medium text-foreground text-sm">
                        {initials}
                      </div>
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground text-sm">
                      {user?.fullName}
                    </p>
                    <p className="mt-0.5 truncate text-muted-foreground text-xs">
                      {user?.emailAddresses?.[0]?.emailAddress}
                    </p>
                  </div>
                </div>

                <DropdownMenuPrimitive.Item
                  className={cn(
                    'relative flex cursor-pointer select-none items-center px-2 py-1.5 text-foreground/90 text-sm outline-none transition-colors duration-300 focus:text-foreground',
                    'mt-1 rounded-none transition-colors duration-300 focus:bg-accent focus:text-accent-foreground',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                  )}
                  onClick={handleOpenSettings}
                >
                  <Gear className="mr-2 h-4 w-4" weight="duotone" />
                  <span>code settings</span>
                </DropdownMenuPrimitive.Item>

                <DropdownMenuPrimitive.Item
                  className={cn(
                    'relative flex cursor-pointer select-none items-center px-2 py-1.5 text-foreground/90 text-sm outline-none transition-colors duration-300 focus:text-foreground',
                    'mt-1 rounded-none transition-colors duration-300 focus:bg-accent focus:text-accent-foreground',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                  )}
                  onClick={() => {
                    setMenuOpen(false);
                    window.open('/settings', '_blank');
                  }}
                >
                  <ChatCircle className="mr-2 h-4 w-4" weight="duotone" />
                  <span>chat settings</span>
                </DropdownMenuPrimitive.Item>

                {/* Divider before theme switcher */}
                <div className="my-1.5 border-slate-500/10 border-t" />

                {/* Theme selector using Tabs component */}
                <Tabs
                  value={currentTheme}
                  onValueChange={handleThemeChange}
                  className="flex flex-col"
                >
                  <TabsList className="relative grid h-9 w-full grid-cols-3 gap-1 rounded-none bg-accent/30 p-1">
                    <TabsTrigger
                      value="light"
                      className="z-10 flex h-full w-full items-center justify-center rounded-none transition-all duration-300 hover:bg-background/60 focus:outline-none data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <Sun
                        weight="duotone"
                        className={cn(
                          'h-4 w-4 transition-colors duration-300',
                          currentTheme === 'light'
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        )}
                      />
                    </TabsTrigger>
                    <TabsTrigger
                      value="dark"
                      className="z-10 flex h-full w-full items-center justify-center rounded-none transition-all duration-300 hover:bg-background/60 focus:outline-none data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <Moon
                        weight="duotone"
                        className={cn(
                          'h-4 w-4 transition-colors duration-300',
                          currentTheme === 'dark'
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        )}
                      />
                    </TabsTrigger>
                    <TabsTrigger
                      value="system"
                      className="z-10 flex h-full w-full items-center justify-center rounded-none transition-all duration-300 hover:bg-background/60 focus:outline-none data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <Desktop
                        weight="duotone"
                        className={cn(
                          'h-4 w-4 transition-colors duration-300',
                          currentTheme === 'system'
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        )}
                      />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Divider after theme switcher */}
                <div className="my-1.5 border-slate-500/10 border-t" />

                <SignOutButton>
                  <DropdownMenuPrimitive.Item
                    className={cn(
                      'relative flex cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none transition-all duration-300',
                      'mt-1 rounded-none text-red-500/70 hover:bg-red-500/10 hover:text-red-500',
                      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                    )}
                  >
                    <SignOut className="mr-2 h-4 w-4" weight="duotone" />
                    <span>log out</span>
                  </DropdownMenuPrimitive.Item>
                </SignOutButton>
              </motion.div>
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        )}
      </AnimatePresence>
    </DropdownMenuPrimitive.Root>
  );
}
