'use client';

import React, { useEffect, Suspense } from 'react';
import { SignOutButton, useAuth, useUser } from '@repo/auth/client';
import { 
  SignOut, 
  House, 
  Gear, 
  GithubLogo, 
  TwitterLogo,
  CaretRight 
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@repo/design/lib/utils';
import { mobileUserMenuOpenAtom } from '@/atoms/menus';
import { ModeToggle } from '@/components/shared/mode-toggle';

// Hook to auto-close mobile overlays when transitioning to desktop
function useAutoCloseOnDesktop(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      // Close immediately if screen becomes larger than mobile breakpoint (640px)
      if (window.innerWidth >= 640) {
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);

    // Check immediately in case we're already on desktop
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, onClose]);
}

// Main mobile user menu overlay content component
function MobileUserMenuOverlayContent() {
  const { isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useAtom(mobileUserMenuOpenAtom);

  // Auto-close when transitioning to desktop
  useAutoCloseOnDesktop(isOpen, setIsOpen.bind(null, false));

  // Close overlay when navigating to a new page
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [pathname]);

  // Get user initials for avatar fallback
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || '?';

  // Navigate to settings page
  const handleOpenSettings = () => {
    setIsOpen(false);
    router.push('/settings');
  };

  // Navigate to dashboard
  const handleOpenDashboard = () => {
    setIsOpen(false);
    router.push('/');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full page solid overlay - positioned below header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-x-0 bottom-0 top-14 z-[70] bg-background"
            onClick={handleBackdropClick}
          />

          {/* Menu content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.23, 1, 0.32, 1],
              delay: 0.1
            }}
            className="fixed left-4 right-4 top-14 bottom-4 z-[71] font-mono overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full w-full overflow-y-auto overscroll-contain">
              <div className="space-y-4 p-1 pt-3">
                {/* User info */}
                <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl">
                  <span className="text-sm text-foreground truncate">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </span>
                  <div className="h-8 w-8 bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium rounded-full flex-shrink-0 ml-3">
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt="User avatar"
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-[10px] font-medium">{initials}</span>
                    )}
                  </div>
                </div>

                {/* Menu list items */}
                <div className="space-y-0.5">
                  <button
                    onClick={handleOpenDashboard}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 hover:bg-muted/30 text-sm group"
                  >
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                      Gallery
                    </span>
                    <House className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                  </button>

                  <button
                    onClick={handleOpenSettings}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 hover:bg-muted/30 text-sm group"
                  >
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                      Settings
                    </span>
                    <Gear className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                  </button>

                  {/* Theme selector */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group">
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                      Theme
                    </span>
                    <ModeToggle />
                  </div>

                  {/* Sign out button */}
                  <SignOutButton>
                    <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-500/10 text-sm group">
                      <span className="text-red-500/70 group-hover:text-red-600 transition-colors duration-200">
                        Log Out
                      </span>
                      <SignOut className="w-4 h-4 text-red-500/70 group-hover:text-red-600 transition-colors duration-200" />
                    </button>
                  </SignOutButton>
                </div>

                {/* External links */}
                <div className="space-y-0.5 pt-2 border-t border-border/30">
                  <a
                    href="https://github.com/yourusername/ascii-xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 hover:bg-muted/30 text-sm group"
                  >
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                      GitHub
                    </span>
                    <GithubLogo className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                  </a>

                  <a
                    href="https://twitter.com/yourusername"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 hover:bg-muted/30 text-sm group"
                  >
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                      Twitter
                    </span>
                    <TwitterLogo className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Main exported component with Suspense wrapper
export function MobileUserMenuOverlay() {
  return (
    <Suspense fallback={null}>
      <MobileUserMenuOverlayContent />
    </Suspense>
  );
}