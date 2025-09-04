'use client';

import { useUser, useClerk } from '@repo/auth/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Gear, SignOut, Stack, Sun, Moon, Monitor } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design/components/ui/dropdown-menu';
import { cn } from '@repo/design/lib/utils';
import Link from 'next/link';

function ThemeOptions() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="flex items-center gap-1 px-3 py-1">
      <button
        onClick={() => setTheme('light')}
        className={cn(
          "flex items-center justify-center p-1.5 rounded-md transition-none",
          theme === 'light' ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
        title="Light mode"
      >
        <Sun className="w-3.5 h-3.5" weight="duotone" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          "flex items-center justify-center p-1.5 rounded-md transition-none",
          theme === 'dark' ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
        title="Dark mode"
      >
        <Moon className="w-3.5 h-3.5" weight="duotone" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          "flex items-center justify-center p-1.5 rounded-md transition-none",
          theme === 'system' ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
        title="System theme"
      >
        <Monitor className="w-3.5 h-3.5" weight="duotone" />
      </button>
    </div>
  );
}

export function UserMenu() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReduced = useReducedMotion();
  const [willChange, setWillChange] = useState<'auto' | string>('auto');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : user.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || '?';

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "h-8 w-8 bg-muted text-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 border border-border transition-all duration-300 rounded-lg overflow-hidden",
          "hover:bg-accent hover:border-foreground/20",
          "focus:outline-none select-none",
          menuOpen ? "bg-accent/80 border-foreground/30" : ""
        )}>
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium">{initials}</span>
          )}
        </button>
      </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className={cn(
              // Disable built-in menu animations for this instance
              'data-[state=open]:animate-none data-[state=closed]:animate-none',
              // Keep container lightweight; style the inner motion panel instead
              'p-0 m-0 bg-transparent border-0 shadow-none'
            )}
            forceMount
          >
        <motion.div
              style={{
                // Respect Radix transform origin for a from-trigger feel
                transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
                // GPU hint + will-change only during animation
                willChange,
                transform: 'translateZ(0)'
              }}
              variants={
                prefersReduced
                  ? {
                      open: { opacity: 1, transition: { duration: 0 } },
                      closed: { opacity: 0, transition: { duration: 0 } },
                    }
                  : {
                      // Mirrorable path for open/close
                      open: {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        scale: 1,
                        filter: 'blur(0px)',
                        transition: {
                          duration: 0.16,
                          ease: [0.2, 0.8, 0.2, 1], // smooth ease-out
                        },
                      },
                      closed: {
                        opacity: 0,
                        x: 2,
                        y: -4,
                        scale: 0.98,
                        filter: 'blur(6px)',
                        transition: {
                          duration: 0.14,
                          ease: [0.4, 0, 0.2, 1], // ease-in for reverse
                        },
                      },
                    }
              }
              initial={false}
              animate={menuOpen ? 'open' : 'closed'}
              onAnimationStart={() => setWillChange('transform, opacity, filter')}
              onAnimationComplete={() => setWillChange('auto')}
              className={cn('w-56 rounded-md border border-border/50 bg-popover')}
        >
              <div className="flex items-center justify-start gap-3 px-2 py-2 border-b border-border/50">
                <div className="flex-1">
                  {user.fullName && (
                    <p className="font-medium text-sm">{user.fullName}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">
                    {user.emailAddresses?.[0]?.emailAddress}
                  </p>
                </div>
              </div>

              <div className="py-1">
                <DropdownMenuItem
                  onClick={() => router.push('/')}
                  className="mx-1 px-2 py-1.5 rounded-[8px] hover:bg-muted/30 transition-none group cursor-pointer"
                >
                  <div className="flex items-center w-full">
                    <Stack className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="flex-1 text-sm">My Gallery</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push('/settings')}
                  className="mx-1 px-2 py-1.5 rounded-[8px] hover:bg-muted/30 transition-none group cursor-pointer"
                >
                  <div className="flex items-center w-full">
                    <Gear className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="flex-1 text-sm">Settings</span>
                  </div>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="my-1" />
              
              {/* Theme Switcher */}
              <div className="py-1">
                <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Theme</div>
                <ThemeOptions />
              </div>
              
              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                onClick={handleSignOut}
                className="mx-1 px-2 py-1.5 rounded-[8px] hover:bg-muted/30 transition-none group cursor-pointer"
              >
                <div className="flex items-center w-full">
                  <SignOut className="w-4 h-4 mr-2 text-red-500/70" />
                  <span className="flex-1 text-sm text-red-500/70">Sign out</span>
                </div>
              </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
