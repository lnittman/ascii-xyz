'use client';

import { useEffect, useState } from 'react';

import { Desktop, Moon, Sun } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';

import { Tabs, TabsList, TabsTrigger } from '@repo/design/components/ui/tabs';
import { cn } from '@repo/design/lib/utils';

interface ThemeSwitcherProps {
  lightColor?: string;
  darkColor?: string;
  className?: string;
}

export function ThemeSwitcher({
  lightColor = '#faf9f7',
  darkColor = '#0a0a0a',
  className,
}: ThemeSwitcherProps = {}) {
  const { setTheme: setNextTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before showing theme to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      updateMeta(theme || 'system');

      // Set up system theme change listener if using system theme
      if ((theme || 'system') === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => updateMeta('system');
        mediaQuery.addEventListener('change', handleSystemChange);

        return () => {
          mediaQuery.removeEventListener('change', handleSystemChange);
        };
      }
    }
  }, [theme, mounted, lightColor, darkColor]);

  const updateMeta = (value: string) => {
    const resolved =
      value === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : value;

    const themeColor = resolved === 'dark' ? darkColor : lightColor;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', themeColor);
    }

    // Also update the document background immediately to prevent flash
    document.documentElement.style.backgroundColor = themeColor;

    // Force background on mobile by also updating body
    if (document.body) {
      document.body.style.backgroundColor = themeColor;
    }

    // Also force on main element for extra safety on mobile
    const main = document.querySelector('main');
    if (main) {
      main.style.backgroundColor = themeColor;
    }
  };

  const handleThemeChange = (value: string) => {
    setNextTheme(value);
    updateMeta(value);
  };

  // Use system as default if theme is not yet loaded
  const currentTheme = mounted ? theme || 'system' : 'system';

  if (!mounted) {
    return (
      <div
        className={cn(
          'h-9 w-[120px] rounded-none border border-border bg-accent/30',
          className
        )}
      />
    );
  }

  return (
    <Tabs
      value={currentTheme}
      onValueChange={handleThemeChange}
      className={cn('flex flex-col', className)}
    >
      <TabsList className="relative grid h-9 w-[120px] grid-cols-3 gap-1 rounded-none border border-border bg-accent/30 p-1">
        <TabsTrigger
          value="light"
          className="z-10 flex h-full w-full items-center justify-center rounded-none hover-bg hover:bg-background/60 focus:outline-none data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          <Sun
            weight="duotone"
            className={cn(
              'h-4 w-4 hover-bg',
              currentTheme === 'light'
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          />
        </TabsTrigger>
        <TabsTrigger
          value="dark"
          className="z-10 flex h-full w-full items-center justify-center rounded-none hover-bg hover:bg-background/60 focus:outline-none data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          <Moon
            weight="duotone"
            className={cn(
              'h-4 w-4 hover-bg',
              currentTheme === 'dark'
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          />
        </TabsTrigger>
        <TabsTrigger
          value="system"
          className="z-10 flex h-full w-full items-center justify-center rounded-none hover-bg hover:bg-background/60 focus:outline-none data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          <Desktop
            weight="duotone"
            className={cn(
              'h-4 w-4 hover-bg',
              currentTheme === 'system'
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
