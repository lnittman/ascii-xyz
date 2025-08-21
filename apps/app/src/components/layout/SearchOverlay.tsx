'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import * as Icons from '@sargamdesign/icons-react/dist/line';
import { cn } from '@repo/design/lib/utils';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="min-h-full">
              <div className="mx-auto max-w-3xl p-4">
                {/* Search input */}
                <div className="relative mt-8">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icons.SiSearch className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search logs..."
                    className="block w-full rounded-md border border-border bg-background pl-10 pr-3 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <button
                    onClick={onClose}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <span className="text-xs text-muted-foreground">ESC</span>
                  </button>
                </div>

                {/* Filter controls */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={cn(
                      'px-3 py-1 text-xs rounded-md transition-colors duration-out-150 hover:duration-0',
                      filter === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-accent-foreground hover:bg-accent/80'
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('github')}
                    className={cn(
                      'px-3 py-1 text-xs rounded-md transition-colors duration-out-150 hover:duration-0',
                      filter === 'github'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-accent-foreground hover:bg-accent/80'
                    )}
                  >
                    GitHub
                  </button>
                  <button
                    onClick={() => setFilter('deployments')}
                    className={cn(
                      'px-3 py-1 text-xs rounded-md transition-colors duration-out-150 hover:duration-0',
                      filter === 'deployments'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-accent-foreground hover:bg-accent/80'
                    )}
                  >
                    Deployments
                  </button>
                  <button
                    onClick={() => setFilter('analytics')}
                    className={cn(
                      'px-3 py-1 text-xs rounded-md transition-colors duration-out-150 hover:duration-0',
                      filter === 'analytics'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-accent-foreground hover:bg-accent/80'
                    )}
                  >
                    Analytics
                  </button>
                </div>

                {/* Search results */}
                <div className="mt-6 space-y-2">
                  {query && (
                    <>
                      <div className="text-xs text-muted-foreground mb-2">
                        Search results for "{query}"
                      </div>
                      {/* Mock results */}
                      <div className="space-y-2">
                        <div className="p-3 rounded-md bg-accent/50 hover:bg-accent cursor-pointer transition-colors duration-out-150 hover:duration-0">
                          <div className="flex items-center gap-2">
                            <Icons.SiCodeMuted className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">Deployed main branch</div>
                              <div className="text-xs text-muted-foreground">2 hours ago</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 rounded-md bg-accent/50 hover:bg-accent cursor-pointer transition-colors duration-out-150 hover:duration-0">
                          <div className="flex items-center gap-2">
                            <Icons.SiCode className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">Fixed TypeScript errors</div>
                              <div className="text-xs text-muted-foreground">4 hours ago</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {!query && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icons.SiSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Type to search logs</p>
                    </div>
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}