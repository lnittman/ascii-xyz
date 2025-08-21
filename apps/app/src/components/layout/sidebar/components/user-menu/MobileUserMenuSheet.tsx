'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { Desktop, Gear, Moon, SignOut, Sun } from '@phosphor-icons/react';
import { useAtom } from 'jotai';
import { useTheme } from 'next-themes';
import { useTransitionRouter } from 'next-view-transitions';
import React from 'react';

import { Tabs, TabsList, TabsTrigger } from '@repo/design/components/ui/tabs';
import { cn } from '@repo/design/lib/utils';

import { mobileUserMenuOpenAtom } from '@/atoms/mobile-menus';
import { TransitionAvatar } from '@/components/shared/avatar/TransitionAvatar';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';

const MenuItem = ({
  icon,
  label,
  onClick,
  isDanger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isDanger?: boolean;
}) => (
  <div className="px-3 py-1">
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-none px-3 py-3 text-left text-sm transition-colors hover:bg-accent ${
        isDanger ? 'text-destructive' : 'text-foreground'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  </div>
);

export function MobileUserMenuSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileUserMenuOpenAtom);
  const { user } = useUser();
  const { signOut } = useAuth();
  const { setTheme: setNextTheme, theme } = useTheme();
  const router = useTransitionRouter();

  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [userDataSnapshot, setUserDataSnapshot] = React.useState<{
    fullName: string | null | undefined;
    emailAddress: string | undefined;
    initials: string;
  } | null>(null);

  // Capture user data snapshot when user is available and not signing out
  React.useEffect(() => {
    if (user && !isSigningOut) {
      const initials = user.fullName
        ? user.fullName
            .split(' ')
            .map((name: string) => name[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
        : user.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() ||
          '?';

      setUserDataSnapshot({
        fullName: user.fullName,
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
          emailAddress: user?.emailAddresses?.[0]?.emailAddress,
          initials: user?.fullName
            ? user.fullName
                .split(' ')
                .map((name: string) => name[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)
            : user?.emailAddresses?.[0]?.emailAddress
                ?.charAt(0)
                .toUpperCase() || '?',
        };

  const handleClose = () => setIsOpen(false);

  const handleAction = (action: () => void) => {
    handleClose();
    action();
  };

  const handleThemeChange = (value: string) => {
    setNextTheme(value);
  };

  const handleOpenSettings = () => {
    router.push('/settings');
  };

  // Handle sign out with smooth transition
  const handleSignOut = async () => {
    setIsSigningOut(true);
    // Don't close the sheet - let it stay open during sign out process

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

  return (
    <MobileSheet isOpen={isOpen} onClose={handleClose} title="account">
      <div className="py-2">
        {/* User Info */}
        <div className="flex items-center gap-3 border-border/50 border-b px-6 py-4 pb-5">
          <TransitionAvatar
            src={user?.imageUrl}
            alt={user?.fullName || 'Avatar'}
            className="h-10 w-10 rounded-none"
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
            <p className="mt-0.5 truncate text-muted-foreground text-sm">
              {displayData.emailAddress}
            </p>
          </div>
        </div>

        {/* Settings */}
        <div className="pt-1">
          <MenuItem
            icon={<Gear size={20} weight="duotone" />}
            label="settings"
            onClick={() => handleAction(handleOpenSettings)}
          />
        </div>

        {/* Theme Selector */}
        <div className="border-border/50 border-b px-6 py-4">
          <p className="mb-3 text-muted-foreground text-sm">theme</p>
          <Tabs
            defaultValue={theme}
            value={theme}
            onValueChange={handleThemeChange}
            className="flex flex-col"
          >
            <TabsList className="relative grid h-10 w-full grid-cols-3 gap-1 rounded-none bg-accent/30 p-1">
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
        </div>

        {/* Sign Out */}
        <div className="px-3 py-1 pt-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-none px-3 py-3 text-left text-red-500/70 text-sm transition-all duration-300 hover:bg-red-500/10 hover:text-red-500"
          >
            <SignOut size={20} weight="duotone" />
            <span>sign out</span>
          </button>
        </div>
      </div>
    </MobileSheet>
  );
}
