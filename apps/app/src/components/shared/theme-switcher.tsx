'use client';

import * as Icons from '@sargamdesign/icons-react/dist/line';
import { Button } from '@repo/design/components/ui/button';
import { useTheme } from 'next-themes';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-none"
    >
      {theme === 'dark' ? (
        <Icons.SiSun className="h-3.5 w-3.5" />
      ) : (
        <Icons.SiMoon className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}