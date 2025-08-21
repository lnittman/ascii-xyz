'use client';

import {
  CaretLeft,
  CaretRight,
  Sidebar as SidebarIcon,
} from '@phosphor-icons/react';
import { useAtom } from 'jotai';
import { useState } from 'react';

import { Button } from '@repo/design/components/ui/button';

import { sidebarOpenAtom } from '@/atoms/layout/sidebar';

export function SidebarToggle() {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  const [isHovered, setIsHovered] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="pointer-events-auto fixed top-3 left-2 z-[248]">
      <Button
        onClick={toggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group flex h-8 w-8 items-center justify-center rounded-none border border-border bg-background/80 text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-accent/60 hover:text-foreground/75 active:bg-accent active:text-foreground"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        variant="ghost"
      >
        {isOpen ? (
          <CaretLeft weight="duotone" className="h-5 w-5" />
        ) : isHovered ? (
          <CaretRight weight="duotone" className="h-5 w-5" />
        ) : (
          <SidebarIcon weight="duotone" className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
