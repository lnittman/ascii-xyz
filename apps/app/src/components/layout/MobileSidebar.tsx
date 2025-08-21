'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { Home, Activity, Archive, StatsReport, Code, Cloud, GraphUp, User, Suitcase, Plus, Search, NavArrowDown } from 'iconoir-react';
import { cn } from '@repo/design/lib/utils';
import { GroupMenuModal } from './GroupMenuModal';

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  onSearchClick?: () => void;
}

// Groups/workspaces - in the future this would come from the database
const groups = [
  { id: 'personal', name: 'Personal', icon: User },
  { id: 'work', name: 'Work', icon: Suitcase },
];

const navigation = [
  { name: 'overview', href: '/', icon: Home },
  { name: 'activity', href: '/activity', icon: Activity },
  { name: 'drains', href: '/drains', icon: Archive },
  { name: 'insights', href: '/insights', icon: StatsReport },
];

const sources = [
  { name: 'github', href: '/logs?source=github', icon: Code, count: 42 },
  { name: 'vercel', href: '/logs?source=vercel', icon: Cloud, count: 8 },
  { name: 'posthog', href: '/logs?source=posthog', icon: GraphUp, count: 15 },
];


export function MobileSidebar({ open, onClose, onSearchClick }: MobileSidebarProps) {
  const pathname = usePathname();
  const [currentGroup, setCurrentGroup] = useState(groups[0]);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preventLongPress = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const panel = panelRef.current;
    if (panel && open) {
      const links = panel.querySelectorAll('a, button');
      links.forEach(link => {
        link.addEventListener('contextmenu', preventLongPress);
        link.addEventListener('touchstart', (e) => {
          const touch = e as TouchEvent;
          if (touch.touches.length > 1) {
            preventLongPress(e);
          }
        });
      });

      return () => {
        links.forEach(link => {
          link.removeEventListener('contextmenu', preventLongPress);
        });
      };
    }
  }, [pathname, groupModalOpen, open]);

  return (
    <>
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 mobile-overlay" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-[280px] sm:w-[320px] md:w-80 mobile-h-full">
              <div ref={panelRef} className="flex grow flex-col overflow-y-auto bg-background border-r border-border mobile-h-full">
                {/* Header with Group Selector and Search */}
                <div className="flex h-14 items-center justify-between border-b border-border px-4">
                  <button 
                    onClick={() => setGroupModalOpen(true)}
                    className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-none duration-0"
                  >
                    <currentGroup.icon className="h-3.5 w-3.5" />
                    <span>{currentGroup.name}</span>
                    <NavArrowDown className="h-3 w-3 text-muted-foreground" />
                  </button>
                  {onSearchClick && (
                    <button
                      onClick={() => {
                        onSearchClick();
                        onClose();
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-out-150 hover:duration-0"
                      aria-label="Search"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col px-3 py-4">
                  <div className="space-y-1">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href || 
                        (item.href !== '/' && pathname?.startsWith(item.href));
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-none duration-0 sidebar-link-touch no-ios-callout',
                            isActive
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                          )}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Sources */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-2 px-3">
                      <h3 className="text-xs font-medium text-muted-foreground">
                        sources
                      </h3>
                      <button
                        className="text-muted-foreground hover:text-foreground transition-colors duration-out-150 hover:duration-0"
                        onClick={() => {
                          console.log('Add source');
                          onClose();
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {sources.map((source) => (
                        <Link
                          key={source.name}
                          href={source.href}
                          className={cn(
                            'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-none duration-0 sidebar-link-touch no-ios-callout',
                            pathname === source.href
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <source.icon className="h-4 w-4 flex-shrink-0" />
                            <span>{source.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{source.count}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
    
    <GroupMenuModal
      open={groupModalOpen}
      onClose={() => setGroupModalOpen(false)}
      currentGroup={currentGroup}
      groups={groups}
      onSelectGroup={setCurrentGroup}
    />
    </>
  );
}