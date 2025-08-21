'use client';

import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { Xmark } from 'iconoir-react';
import { cn } from '@repo/design/lib/utils';
import { useAtom } from 'jotai';
import { activeRightSidebarAtom, type RightSidebarType } from '@/atoms/layout/sidebar';

// Content components for each sidebar type
function GroupStatsContent() {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">activity overview</h4>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-foreground">total commits</span>
            <span className="font-mono text-foreground">1,234</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">pull requests</span>
            <span className="font-mono text-foreground">45</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">issues closed</span>
            <span className="font-mono text-foreground">23</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">repositories</h4>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-foreground">arbor-xyz</span>
            <span className="text-muted-foreground">340 commits</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">logs-xyz</span>
            <span className="text-muted-foreground">894 commits</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">time distribution</h4>
        <div className="h-32 bg-accent/20 rounded-md flex items-center justify-center text-xs text-muted-foreground">
          activity heatmap
        </div>
      </div>
    </div>
  );
}

function GroupDetailsContent() {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">view settings</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded border-border" defaultChecked />
            <span className="text-foreground">show repositories</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded border-border" defaultChecked />
            <span className="text-foreground">show timestamps</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded border-border" />
            <span className="text-foreground">compact mode</span>
          </label>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">grouping</h4>
        <select className="w-full px-3 py-1.5 text-sm text-foreground bg-background border border-border rounded-md">
          <option>by day</option>
          <option>by week</option>
          <option>by repository</option>
          <option>by type</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">display density</h4>
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-1.5 text-xs text-foreground bg-accent rounded-md">comfortable</button>
          <button className="flex-1 px-3 py-1.5 text-xs text-foreground rounded-md hover:bg-accent/50">compact</button>
        </div>
      </div>
    </div>
  );
}

export function RightSidebar() {
  const [activeRightSidebar, setActiveRightSidebar] = useAtom(activeRightSidebarAtom);
  const isOpen = activeRightSidebar !== null;

  const handleClose = () => {
    setActiveRightSidebar(null);
  };

  // Determine title and content based on active sidebar
  const title = activeRightSidebar === 'stats' ? 'group stats' : 
                activeRightSidebar === 'details' ? 'group details' : '';
  
  const content = activeRightSidebar === 'stats' ? <GroupStatsContent /> : 
                  activeRightSidebar === 'details' ? <GroupDetailsContent /> : null;

  return (
    <>
      {/* Overlay - only shows when sidebar is open, only affects content area */}
      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition-opacity ease-linear duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div 
          className="absolute inset-0 bg-black/30 z-10 mobile-overlay"
          onClick={handleClose}
          aria-hidden="true"
        />
      </Transition>

      {/* Single Sidebar with dynamic content */}
      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-in-out duration-300 transform"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transition ease-in-out duration-300 transform"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        <div className="absolute right-0 top-0 bottom-0 w-full max-w-[280px] sm:max-w-[320px] md:w-80 border-l border-border bg-background z-20">
          <div className="flex h-12 items-center justify-between border-b border-border px-4">
            <h3 className="text-sm font-medium">{title}</h3>
            <button
              onClick={handleClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-none duration-0"
            >
              <Xmark className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="h-[calc(100%-3rem)] overflow-y-auto">
            {content}
          </div>
        </div>
      </Transition>
    </>
  );
}