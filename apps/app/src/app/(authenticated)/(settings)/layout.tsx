'use client';

import type React from 'react';
import { useState, Fragment, useEffect, useRef } from 'react';
import { SidebarCollapse, ArrowLeft } from 'iconoir-react';
import { cn } from '@repo/design/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { Settings, User, Palette, Bell, Shield, CreditCard, Code, Database } from 'iconoir-react';

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

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preventLongPress = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const panel = panelRef.current;
    if (panel && sidebarOpen) {
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
  }, [pathname, sidebarOpen]);

  return (
    <div className="flex h-screen mobile-h-full overflow-hidden bg-background">
      {/* Desktop settings sidebar */}
      <aside className="hidden lg:flex h-full w-64 flex-col border-r border-border bg-background">
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

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Single row header */}
        <div className="border-b border-border bg-background">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
            {/* Mobile sidebar button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={cn(
                "p-1.5 rounded-md transition-none duration-0 touch-active lg:hidden",
                "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:text-foreground"
              )}
              aria-label="Open settings menu"
            >
              <SidebarCollapse className="h-3.5 w-3.5 rotate-180" />
            </button>

            {/* Back to home button */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-none duration-0"
            >
              <ArrowLeft className="h-3 w-3" />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Mobile Settings Sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
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
              <Dialog.Panel className="relative flex w-full max-w-[280px] sm:max-w-[320px] flex-1 mobile-h-full">
                <div ref={panelRef} className="flex grow flex-col overflow-y-auto bg-background border-r border-border mobile-h-full">
                  {/* Settings Navigation */}
                  <nav className="flex flex-1 flex-col px-3 py-4">
                    <h3 className="px-3 mb-3 text-xs font-medium text-muted-foreground uppercase">Settings</h3>
                    <div className="space-y-1">
                      {settingsNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-none duration-0 sidebar-link-touch no-ios-callout',
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
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}