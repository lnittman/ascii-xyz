'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { Plus, Filter, ControlSlider, ArrowDown, SidebarCollapse, StatsReport, ViewColumns2 } from 'iconoir-react';
import { cn } from '@repo/design/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design/components/ui/dropdown-menu-enhanced';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { FiltersModal } from '@/components/layout/FiltersModal';
import { ViewOptionsModal } from '@/components/layout/ViewOptionsModal';
import { NewViewModal } from '@/components/layout/NewViewModal';
import { SearchOverlay } from '@/components/layout/SearchOverlay';
import { Modals } from '@/components/layout/GlobalModals';
import { ORPCProvider } from '@/providers/orpc-provider';
import { useSetAtom, useAtom } from 'jotai';
import { initialUserAtom } from '@/atoms/user';
import { activeRightSidebarAtom } from '@/atoms/layout/sidebar';

interface LogsLayoutProps {
  children: React.ReactNode;
  initialUser?: any;
}

export function LogsLayout({ children, initialUser }: LogsLayoutProps) {
  const setInitialUser = useSetAtom(initialUserAtom);
  const initializedRef = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRightSidebar, setActiveRightSidebar] = useAtom(activeRightSidebarAtom);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false);
  const [newViewOpen, setNewViewOpen] = useState(false);
  const [viewSettingsOpen, setViewSettingsOpen] = useState(false);

  if (!initializedRef.current && initialUser) {
    initializedRef.current = true;
    setInitialUser(initialUser);
  }

  return (
    <ORPCProvider>
      <div className="flex h-screen mobile-h-full overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar onSearchClick={() => setSearchOpen(true)} />
        </div>

        {/* Mobile sidebar */}
        <MobileSidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onSearchClick={() => setSearchOpen(true)}
        />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Fixed 3-row header */}
          <div className="border-b border-border bg-background">
            {/* Row 1: Mobile menu + sidebar buttons */}
            <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className={cn(
                  "p-1.5 rounded-md transition-none duration-0 touch-active",
                  "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:text-foreground"
                )}
                aria-label="Open sidebar"
              >
                <SidebarCollapse className="h-3.5 w-3.5 rotate-180" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveRightSidebar(activeRightSidebar === 'stats' ? null : 'stats')}
                  className={cn(
                    "p-1.5 rounded-md transition-none duration-0 touch-active",
                    activeRightSidebar === 'stats' 
                      ? "bg-accent text-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:text-foreground"
                  )}
                  aria-label="Group Stats"
                >
                  <StatsReport className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setActiveRightSidebar(activeRightSidebar === 'details' ? null : 'details')}
                  className={cn(
                    "p-1.5 rounded-md transition-none duration-0 touch-active",
                    activeRightSidebar === 'details' 
                      ? "bg-accent text-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:text-foreground"
                  )}
                  aria-label="Group Details"
                >
                  <ViewColumns2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            
            {/* Desktop Row 1: Sidebar buttons only */}
            <div className="hidden lg:flex h-12 items-center justify-end px-4 sm:px-6 lg:px-8 border-b border-border">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveRightSidebar(activeRightSidebar === 'stats' ? null : 'stats')}
                  className={cn(
                    "p-1.5 rounded-md transition-none duration-0 touch-active",
                    activeRightSidebar === 'stats' 
                      ? "bg-accent text-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:text-foreground"
                  )}
                  aria-label="Group Stats"
                >
                  <StatsReport className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setActiveRightSidebar(activeRightSidebar === 'details' ? null : 'details')}
                  className={cn(
                    "p-1.5 rounded-md transition-none duration-0 touch-active",
                    activeRightSidebar === 'details' 
                      ? "bg-accent text-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:text-foreground"
                  )}
                  aria-label="Group Details"
                >
                  <ViewColumns2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            
            {/* Row 2: View controls with tiles, divider, more button, and plus */}
            <div className="px-4 sm:px-6 lg:px-8 py-2 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-xs bg-accent text-foreground rounded-md transition-none duration-0 hover:bg-accent/80 touch-active active:text-foreground">
                    today
                  </button>
                  <button className="px-3 py-1 text-xs text-muted-foreground rounded-md transition-none duration-0 hover:bg-accent/50 hover:text-foreground touch-active active:text-foreground">
                    week
                  </button>
                  <button className="px-3 py-1 text-xs text-muted-foreground rounded-md transition-none duration-0 hover:bg-accent/50 hover:text-foreground touch-active active:text-foreground">
                    month
                  </button>
                  <div className="h-4 w-px bg-border mx-2" />
                  <button 
                    onClick={() => setViewOptionsOpen(true)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-none duration-0 touch-active active:text-foreground"
                  >
                    3 more...
                  </button>
                </div>
                <button 
                  onClick={() => setNewViewOpen(true)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-none duration-0 touch-active active:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            
            {/* Row 3: Filters and settings */}
            <div className="px-4 sm:px-6 lg:px-8 py-2">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setFiltersOpen(true)}
                  className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground rounded-md hover:bg-accent/50 hover:text-foreground transition-none duration-0 touch-active active:text-foreground"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>filters</span>
                </button>
                <DropdownMenu open={viewSettingsOpen} onOpenChange={setViewSettingsOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "p-1.5 rounded-md transition-none duration-0 touch-active",
                        viewSettingsOpen
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:text-foreground"
                      )}
                      aria-label="View Settings"
                    >
                      <ControlSlider className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem index={0}>
                      <span className="text-sm">group by repository</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem index={1}>
                      <span className="text-sm">group by day</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem index={2}>
                      <span className="text-sm">group by type</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem index={3}>
                      <span className="text-sm">show timestamps</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem index={4}>
                      <span className="text-sm">show avatars</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem index={5}>
                      <span className="text-sm">compact view</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Main content area with sidebar */}
          <div className="flex-1 overflow-hidden relative">
            <main className="h-full overflow-auto">
              {children}
            </main>
            
            {/* Single Right Sidebar with switchable content */}
            <RightSidebar />
          </div>
        </div>

        <Modals />
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
        <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} />
        <ViewOptionsModal open={viewOptionsOpen} onClose={() => setViewOptionsOpen(false)} />
        <NewViewModal open={newViewOpen} onClose={() => setNewViewOpen(false)} />
      </div>
    </ORPCProvider>
  );
}