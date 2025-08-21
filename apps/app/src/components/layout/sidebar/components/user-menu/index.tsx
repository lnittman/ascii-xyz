'use client';

import React, { useState } from 'react';

import { useAuth, useUser } from '@clerk/nextjs';
import {
  CaretDown,
  CaretUp,
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

import { TransitionAvatar } from '@/components/shared/avatar/TransitionAvatar';
import { Tabs, TabsList, TabsTrigger } from '@repo/design/components/ui/tabs';
import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import { cn } from '@repo/design/lib/utils';

import { sidebarOpenAtom } from '@/atoms/layout/sidebar';
import { mobileUserMenuOpenAtom } from '@/atoms/mobile-menus';

export function UserMenu() {
  const { isLoaded, signOut } = useAuth();
  const { setTheme: setNextTheme, theme } = useTheme();
  const { user } = useUser();

  const router = useTransitionRouter();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [isOpen] = useAtom(sidebarOpenAtom);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useAtom(
    mobileUserMenuOpenAtom
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userDataSnapshot, setUserDataSnapshot] = useState<{
    fullName: string | null | undefined;
    firstName: string | null | undefined;
    emailAddress: string | undefined;
    initials: string;
  } | null>(null);

  // Capture user data snapshot when user is available and not signing out
  React.useEffect(() => {
    if (user && !isSigningOut) {
      const initials = user.fullName
        ? user.fullName
            .split(' ')
            .map((name) => name[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
        : user.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() ||
          '?';

      setUserDataSnapshot({
        fullName: user.fullName,
        firstName: user.firstName,
        emailAddress: user.emailAddresses?.[0]?.emailAddress,
        initials,
      });
    }
  }, [user, isSigningOut]);

  // Use snapshot data during sign out, otherwise use live user data
  const displayData =
    isSigningOut && userDataSnapshot
      ? userDataSnapshot
      : {
          fullName: user?.fullName,
          firstName: user?.firstName,
          emailAddress: user?.emailAddresses?.[0]?.emailAddress,
          initials: user?.fullName
            ? user.fullName
                .split(' ')
                .map((name) => name[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)
            : user?.emailAddresses?.[0]?.emailAddress
                ?.charAt(0)
                .toUpperCase() || '?',
        };

  const handleThemeChange = (value: string) => {
    setNextTheme(value);
  };

  // Navigate to settings page
  const handleOpenSettings = () => {
    setMenuOpen(false);
    router.push('/settings');
  };

  // Handle mobile user menu click
  const handleUserMenuClick = () => {
    if (isDesktop) {
      setMenuOpen(!menuOpen);
    } else {
      setMobileUserMenuOpen(true);
    }
  };

  // Handle sign out with smooth transition
  const handleSignOut = async () => {
    setIsSigningOut(true);
    setMenuOpen(false);

    try {
      // Small delay to let the UI settle
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Navigate first, then sign out
      router.push('/signin');

      // Small delay before clearing auth state
      await new Promise((resolve) => setTimeout(resolve, 100));

      await signOut();
    } catch (_error) {
      setIsSigningOut(false);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isDesktop ? 1 : isOpen ? 1 : 0,
        pointerEvents: isDesktop || isOpen ? 'auto' : 'none',
      }}
      transition={{ duration: 0.3 }}
      className="select-none"
      style={{ width: 264 }}
    >
      <DropdownMenuPrimitive.Root
        open={isDesktop ? menuOpen : false}
        onOpenChange={isDesktop ? setMenuOpen : undefined}
      >
        <DropdownMenuPrimitive.Trigger asChild>
          <button
            onClick={isDesktop ? undefined : handleUserMenuClick}
            className={cn(
              'group relative flex h-8 w-full items-center rounded-none transition-all duration-150',
              // Only show tile hover when sidebar is open
              isOpen && 'hover:bg-accent/50',
              menuOpen && isOpen && 'bg-accent/40'
            )}
          >
            <div className="flex w-8 flex-none items-center justify-center">
              <div className="relative">
                <TransitionAvatar
                  src={user?.imageUrl}
                  alt={user?.fullName || 'Avatar'}
                  className="h-6 w-6 rounded-none"
                  imageClassName="h-6 w-6 object-cover"
                  fallback={
                    <motion.div
                      className={cn(
                        'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-none border border-accent/40 bg-background font-medium text-foreground text-xs transition-all duration-150',
                        // Border hover when sidebar is open
                        isOpen && 'group-hover:border-accent'
                      )}
                    >
                      {displayData.initials}
                    </motion.div>
                  }
                />
                {!isOpen && (
                  <div
                    className={cn(
                      'pointer-events-none absolute inset-0 z-10 rounded-none bg-background/60 backdrop-blur-sm transition-opacity duration-200',
                      menuOpen || mobileUserMenuOpen
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    )}
                  />
                )}
              </div>
            </div>

            <AnimatePresence>
              <div
                style={{
                  opacity: isOpen ? 1 : 0,
                  transition: 'opacity 0.15s ease-in-out',
                }}
                className={cn(
                  'opacity-0 transition-opacity duration-150',
                  isOpen && 'opacity-100'
                )}
              >
                <motion.span
                  className={cn(
                    'pl-1 text-muted-foreground text-sm transition-colors duration-150 group-hover:text-foreground',
                    menuOpen && 'text-foreground'
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                >
                  {displayData.firstName || 'User'}
                </motion.span>

                <div className="-translate-y-1/2 absolute top-1/2 right-2">
                  <AnimatePresence mode="wait" initial={false}>
                    {menuOpen ? (
                      <motion.div
                        key="up"
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        transition={{ duration: 0.15 }}
                      >
                        <CaretUp
                          weight="duotone"
                          className="h-4 w-4 text-muted-foreground group-hover:text-foreground"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="down"
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 2 }}
                        transition={{ duration: 0.15 }}
                      >
                        <CaretDown
                          weight="duotone"
                          className="h-4 w-4 text-muted-foreground group-hover:text-foreground"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </AnimatePresence>
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
                align={isOpen ? 'center' : 'start'}
                side="top"
                sideOffset={8}
              >
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
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
                          {displayData.initials}
                        </div>
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground text-sm">
                        {displayData.fullName}
                      </p>
                      <p className="mt-0.5 truncate text-muted-foreground text-xs">
                        {displayData.emailAddress}
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
                    <span>settings</span>
                  </DropdownMenuPrimitive.Item>

                  {/* Divider before theme switcher */}
                  <div className="my-1.5 border-slate-500/10 border-t" />

                  {/* Theme selector using Tabs component - no title */}
                  <Tabs
                    defaultValue={theme}
                    value={theme}
                    onValueChange={handleThemeChange}
                    className="flex flex-col"
                  >
                    <TabsList className="relative grid h-9 w-full grid-cols-3 gap-1 rounded-none bg-accent/30 p-1">
                      {/* Tab triggers with static icons (no animations) */}
                      <TabsTrigger
                        value="light"
                        className="z-10 flex h-full w-full items-center justify-center rounded-none transition-all duration-300 hover:bg-background/60 focus:outline-none"
                      >
                        <Sun
                          weight="duotone"
                          className={cn(
                            'h-4 w-4 transition-colors duration-300',
                            theme === 'light'
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          )}
                        />
                      </TabsTrigger>
                      <TabsTrigger
                        value="dark"
                        className="z-10 flex h-full w-full items-center justify-center rounded-none transition-all duration-300 hover:bg-background/60 focus:outline-none"
                      >
                        <Moon
                          weight="duotone"
                          className={cn(
                            'h-4 w-4 transition-colors duration-300',
                            theme === 'dark'
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          )}
                        />
                      </TabsTrigger>
                      <TabsTrigger
                        value="system"
                        className="z-10 flex h-full w-full items-center justify-center rounded-none transition-all duration-300 hover:bg-background/60 focus:outline-none"
                      >
                        <Desktop
                          weight="duotone"
                          className={cn(
                            'h-4 w-4 transition-colors duration-300',
                            theme === 'system'
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          )}
                        />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Divider after theme switcher */}
                  <div className="my-1.5 border-slate-500/10 border-t" />

                  <DropdownMenuPrimitive.Item
                    className={cn(
                      'relative flex cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none transition-all duration-300',
                      'mt-1 rounded-none text-red-500/70 hover:bg-red-500/10 hover:text-red-500',
                      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                    )}
                    onClick={handleSignOut}
                  >
                    <SignOut className="mr-2 h-4 w-4" weight="duotone" />
                    <span>log out</span>
                  </DropdownMenuPrimitive.Item>
                </motion.div>
              </DropdownMenuPrimitive.Content>
            </DropdownMenuPrimitive.Portal>
          )}
        </AnimatePresence>
      </DropdownMenuPrimitive.Root>
    </motion.div>
  );
}
