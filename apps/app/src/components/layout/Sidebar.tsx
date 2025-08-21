'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Home, Activity, Archive, StatsReport, Code, Cloud, GraphUp, User, Suitcase, Plus, Search, NavArrowDown, Settings, LogOut } from 'iconoir-react';
import { cn } from '@repo/design/lib/utils';
import { GroupMenuModal } from './GroupMenuModal';

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

// Groups/workspaces - in the future this would come from the database
const groups = [
  { id: 'personal', name: 'Personal', icon: User },
  { id: 'work', name: 'Work', icon: Suitcase },
];

interface SidebarProps {
  onSearchClick?: () => void;
}

export function Sidebar({ onSearchClick }: SidebarProps = {}) {
  const pathname = usePathname();
  const [currentGroup, setCurrentGroup] = useState(groups[0]);
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const preventLongPress = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const sidebar = sidebarRef.current;
    if (sidebar) {
      const links = sidebar.querySelectorAll('a, button');
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
  }, [pathname, groupMenuOpen]);

  return (
    <>
    <aside ref={sidebarRef} className="flex h-full w-64 flex-col border-r border-border bg-background">
      {/* Group Selector with Search */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <button 
          onClick={() => setGroupMenuOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors duration-out-150 hover:duration-0"
        >
          <currentGroup.icon className="h-3.5 w-3.5" />
          <span>{currentGroup.name}</span>
          <NavArrowDown className="h-3 w-3 text-muted-foreground" />
        </button>
        {onSearchClick && (
          <button
            onClick={onSearchClick}
            className="text-muted-foreground hover:text-foreground transition-colors duration-out-150 hover:duration-0"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover-instant sidebar-link-touch no-ios-callout',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
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
              onClick={() => console.log('Add source')}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-1">
            {sources.map((source) => (
              <Link
                key={source.name}
                href={source.href}
                className={cn(
                  'flex items-center justify-between rounded-md px-3 py-2 text-sm hover-instant sidebar-link-touch no-ios-callout',
                  pathname === source.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <source.icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{source.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{source.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
    
    <GroupMenuModal
      open={groupMenuOpen}
      onClose={() => setGroupMenuOpen(false)}
      currentGroup={currentGroup}
      groups={groups}
      onSelectGroup={setCurrentGroup}
    />
    </>
  );
}