'use client';

import { Plus } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import type React from 'react';

import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import { cn } from '@repo/design/lib/utils';

import { sidebarOpenAtom } from '@/atoms/layout/sidebar';

export function NewChatButton(): React.ReactElement {
  const [isOpen] = useAtom(sidebarOpenAtom);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const pathname = usePathname();

  return (
    <div className="px-2">
      <motion.div
        className="select-none"
        initial={false}
        animate={{
          opacity: isDesktop ? 1 : isOpen ? 1 : 0,
          width: isOpen ? 264 : 32,
          pointerEvents: isDesktop || isOpen ? 'auto' : 'none',
        }}
        transition={{
          duration: 0.3,
          ease: [0.32, 0.72, 0, 1],
        }}
      >
        <Link
          href="/"
          className={cn(
            'relative flex h-8 items-center transition-colors duration-300',
            'group hover:bg-accent/60 active:bg-accent',
            'rounded-none text-muted-foreground group-hover:text-foreground/80 group-active:text-foreground',
            pathname === '/' ? 'bg-accent text-foreground hover:bg-accent' : ''
          )}
        >
          <div className="flex w-8 flex-none items-center justify-center">
            <Plus weight="duotone" className="h-4 w-4" />
          </div>

          <div className="flex h-full items-center justify-start overflow-hidden">
            <motion.span
              className={cn('whitespace-nowrap pl-1 text-sm')}
              animate={{ opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              new chat
            </motion.span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
