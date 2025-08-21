'use client';

import { SignOutButton, useUser } from '@clerk/nextjs';
import {
  ChatCircle,
  Desktop,
  Gear,
  Moon,
  SignOut,
  Sun,
} from '@phosphor-icons/react';
import { useAtom } from 'jotai';
import { useTheme } from 'next-themes';
import { useTransitionRouter } from 'next-view-transitions';
import type React from 'react';

import { Tabs, TabsList, TabsTrigger } from '@repo/design/components/ui/tabs';
import { cn } from '@repo/design/lib/utils';

import { mobileCodeUserMenuOpenAtom } from '@/atoms/mobile-menus';
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

export function MobileCodeUserMenuSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileCodeUserMenuOpenAtom);
  const { user } = useUser();
  const { setTheme: setNextTheme, theme } = useTheme();
  const router = useTransitionRouter();

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || '?';

  const handleClose = () => setIsOpen(false);

  const handleAction = (action: () => void) => {
    handleClose();
    action();
  };

  const handleThemeChange = (value: string) => {
    setNextTheme(value);
  };

  const handleOpenCodeSettings = () => {
    router.push('/code/settings');
  };

  const handleOpenChatSettings = () => {
    window.open('/settings', '_blank');
  };

  return (
    <MobileSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="account"
      position="bottom"
    >
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
                {initials}
              </div>
            }
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground text-sm">
              {user?.fullName}
            </p>
            <p className="mt-0.5 truncate text-muted-foreground text-sm">
              {user?.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>
        </div>

        {/* Settings Options */}
        <div className="pt-1">
          <MenuItem
            icon={<Gear size={20} weight="duotone" />}
            label="code settings"
            onClick={() => handleAction(handleOpenCodeSettings)}
          />
          <MenuItem
            icon={<ChatCircle size={20} weight="duotone" />}
            label="chat settings"
            onClick={() => handleAction(handleOpenChatSettings)}
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
                className="z-10 flex h-full w-full items-center justify-center rounded-none transition-all duration-300 hover:bg-background/60 focus:outline-none data-[state=active]:bg-background data-[state=active]:shadow-sm"
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
                className="z-10 flex h-full w-full items-center justify-center rounded-none transition-all duration-300 hover:bg-background/60 focus:outline-none data-[state=active]:bg-background data-[state=active]:shadow-sm"
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
                className="z-10 flex h-full w-full items-center justify-center rounded-none transition-all duration-300 hover:bg-background/60 focus:outline-none data-[state=active]:bg-background data-[state=active]:shadow-sm"
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
        <SignOutButton>
          <div className="px-3 py-1 pt-3">
            <button className="flex w-full items-center gap-3 rounded-none px-3 py-3 text-left text-red-500/70 text-sm transition-all duration-300 hover:bg-red-500/10 hover:text-red-500">
              <SignOut size={20} weight="duotone" />
              <span>log out</span>
            </button>
          </div>
        </SignOutButton>
      </div>
    </MobileSheet>
  );
}
