'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { User, Suitcase, Search, NavArrowDown, Settings, Bell, Shield, CreditCard, Database, Palette, Code } from 'iconoir-react';
import { cn } from '@repo/design/lib/utils';
import { GroupMenuModal } from './GroupMenuModal';

const settingsNavigation = [
  { name: 'general', href: '/settings', icon: Settings },
  { name: 'profile', href: '/settings/profile', icon: User },
  { name: 'appearance', href: '/settings/appearance', icon: Palette },
  { name: 'notifications', href: '/settings/notifications', icon: Bell },
  { name: 'security', href: '/settings/security', icon: Shield },
  { name: 'billing', href: '/settings/billing', icon: CreditCard },
  { name: 'integrations', href: '/settings/integrations', icon: Code },
  { name: 'data', href: '/settings/data', icon: Database },
];

// Groups/workspaces - in the future this would come from the database
const groups = [
  { id: 'personal', name: 'Personal', icon: User },
  { id: 'work', name: 'Work', icon: Suitcase },
];

export function SettingsSidebar() {
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
      {/* Group Selector */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <button 
          onClick={() => setGroupMenuOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors duration-out-150 hover:duration-0"
        >
          <currentGroup.icon className="h-3.5 w-3.5" />
          <span>{currentGroup.name}</span>
          <NavArrowDown className="h-3 w-3 text-muted-foreground" />
        </button>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors duration-out-150 hover:duration-0"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Settings Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {settingsNavigation.map((item) => {
            const isActive = pathname === item.href;
            
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