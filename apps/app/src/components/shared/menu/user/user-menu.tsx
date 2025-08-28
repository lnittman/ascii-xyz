'use client';

import { useUser, useClerk } from '@repo/auth/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, Layers, MessageCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design/components/ui/dropdown-menu';
import { cn } from '@repo/design/lib/utils';
import Link from 'next/link';

export function UserMenu() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

      <AnimatePresence>
        {menuOpen && (
          <DropdownMenuContent align="end" className="w-56 bg-popover border-border/50" forceMount>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.32, 0.72, 0, 1]
              }}
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
                  className="mx-1 px-2 py-1.5 rounded-md hover:bg-muted/30 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center w-full">
                    <Layers className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-foreground transition-all duration-300" />
                    <span className="flex-1 text-sm">My Gallery</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push('/settings')}
                  className="mx-1 px-2 py-1.5 rounded-md hover:bg-muted/30 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center w-full">
                    <Settings className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-foreground transition-all duration-300" />
                    <span className="flex-1 text-sm">Settings</span>
                  </div>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                onClick={handleSignOut}
                className="mx-1 px-2 py-1.5 rounded-md hover:bg-muted/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center w-full">
                  <LogOut className="w-4 h-4 mr-2 text-red-500/70 group-hover:text-red-600 transition-all duration-300" />
                  <span className="flex-1 text-sm text-red-500/70 group-hover:text-red-600 transition-all duration-300">Sign out</span>
                </div>
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
}