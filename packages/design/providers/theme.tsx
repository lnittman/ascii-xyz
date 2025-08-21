'use client';

import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes';
import { useEffect } from 'react';

// Theme color updater component that updates mobile browser chrome
function ThemeColorUpdater() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    // Theme colors that match globals.css CSS variables
    const lightBg = '#faf9f7'; // oklch(0.98 0.005 85)
    const darkBg = '#0a0a0a'; // proper dark gray

    const updateMetaThemeColor = (color: string) => {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', color);
      }
    };

    const updateDocumentBackground = (color: string) => {
      // Update document background immediately to prevent flash
      document.documentElement.style.backgroundColor = color;

      // Force background on mobile by also updating body
      if (document.body) {
        document.body.style.backgroundColor = color;
      }
    };

    // Determine the actual theme being used
    let resolvedTheme: 'light' | 'dark';
    if (theme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      resolvedTheme = (theme as 'light' | 'dark') || 'light';
    }

    // Update theme color for mobile browser chrome
    const themeColor = resolvedTheme === 'dark' ? darkBg : lightBg;
    updateMetaThemeColor(themeColor);
    updateDocumentBackground(themeColor);
  }, [theme, systemTheme]);

  return null;
}

export const ThemeProvider = ({
  children,
  ...properties
}: ThemeProviderProps) => {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange
      storageKey="next-themes-theme"
      enableColorScheme={false}
      {...properties}
    >
      {children}
      <ThemeColorUpdater />
    </NextThemeProvider>
  );
};
