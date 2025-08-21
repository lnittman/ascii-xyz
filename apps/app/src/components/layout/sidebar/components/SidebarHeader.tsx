'use client';

import { MagnifyingGlass } from '@phosphor-icons/react';
import { cn } from '@repo/design/lib/utils';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';

import { sidebarOpenAtom } from '@/atoms/layout/sidebar';
import { mobileCommandMenuOpenAtom } from '@/atoms/mobile-menus';
import { useModals } from '@/hooks/use-modals';
import { safariGPUAcceleration, useIsIOSSafari } from '@/lib/safari-utils';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
//import { ArborAsciiLogo } from '@/components/code/ArborAsciiLogo';

export function SidebarHeader() {
  const { isMobile } = useIsMobile();
  const [isOpen] = useAtom(sidebarOpenAtom);
  const [, setMobileCommandMenuOpen] = useAtom(mobileCommandMenuOpenAtom);
  const { openCommandModal } = useModals();
  const isIOSSafari = useIsIOSSafari();

  const handleSearchClick = () => {
    if (isMobile) {
      setMobileCommandMenuOpen(true);
    } else {
      openCommandModal();
    }
  };

  return (
    <div className="relative h-14 overflow-hidden" style={{ width: 280 }}>
      <div className="flex h-full items-center justify-between px-2">
        {/* Button spacer to maintain layout when toggle button is outside */}
        <div className="h-8 w-8" />

        {/* Centered ASCII Logo with fade animation */}
        <motion.div
          className="flex flex-1 items-center justify-center"
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
          }}
          transition={{
            duration: 0.3,
            ease: [0.32, 0.72, 0, 1],
          }}
        >
          {/*<ArborAsciiLogo size="xs" />*/}
        </motion.div>

        {/* Search button - always in DOM but fades in/out */}
        {isIOSSafari ? (
          <button
            onClick={handleSearchClick}
            className={cn(
              'group flex h-8 w-8 items-center justify-center rounded-none transition-all duration-300 hover:bg-accent/60 active:bg-accent',
              'safari-gpu-accelerated safari-transition-opacity',
              isOpen ? 'opacity-100' : 'opacity-0'
            )}
            aria-label="Search"
            style={{
              pointerEvents: isOpen ? 'auto' : 'none',
              ...safariGPUAcceleration,
            }}
          >
            <MagnifyingGlass
              weight="duotone"
              className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:text-foreground/75 group-active:text-foreground"
            />
          </button>
        ) : (
          <motion.button
            onClick={handleSearchClick}
            className="group flex h-8 w-8 items-center justify-center rounded-none transition-all duration-300 hover:bg-accent/60 active:bg-accent"
            aria-label="Search"
            initial={false}
            animate={{
              opacity: isOpen ? 1 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: [0.32, 0.72, 0, 1],
            }}
            style={{
              pointerEvents: isOpen ? 'auto' : 'none',
            }}
          >
            <MagnifyingGlass
              weight="duotone"
              className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:text-foreground/75 group-active:text-foreground"
            />
          </motion.button>
        )}
      </div>
    </div>
  );
}
