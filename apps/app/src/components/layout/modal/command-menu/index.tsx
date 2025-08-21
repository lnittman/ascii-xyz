'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CaretRight, ChatDots, Plus } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useTransitionRouter } from 'next-view-transitions';
import { usePathname } from 'next/navigation';

import { Dialog } from '@repo/design/components/ui/dialog';
import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import { cn } from '@repo/design/lib/utils';

import { commandHoverAtom, commandMenuOpenAtom } from '@/atoms/layout/modal';
import { useChats } from '@/hooks/chat/queries';
import { useModals } from '@/hooks/use-modals';

import { RelativeScrollFadeContainer } from '@/components/shared/relative-scroll-fade-container';
import { ChatGroupList } from './components/ChatGroupList';
import { ChatPreview } from './components/ChatPreview';
import { SearchBar } from './components/SearchBar';

// Add custom styles for the modal
const customStyles = `
  .search-input::placeholder {
    color: var(--foreground);
    opacity: 0.6;
  }
  
  .preview-section {
    background-color: var(--accent);
    border-left: 1px solid var(--border);
  }
  
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Group chats by date - copied from Sidebar for consistency
const groupChatsByDate = (chats: any[] | undefined) => {
  // Handle undefined or empty chats array
  if (!chats || !Array.isArray(chats)) {
    // Return empty groups if chats is undefined
    return {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      'Previous 30 Days': [],
      Older: [],
    };
  }

  // Use all chats, not just those with messages
  const validChats = chats;

  const groups: Record<string, any[]> = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    'Previous 30 Days': [],
    Older: [],
  };

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(now);
  lastMonth.setDate(lastMonth.getDate() - 30);

  validChats.forEach((chat) => {
    const chatDate = new Date(chat.updatedAt);

    if (chatDate.toDateString() === now.toDateString()) {
      groups.Today.push(chat);
    } else if (chatDate.toDateString() === yesterday.toDateString()) {
      groups.Yesterday.push(chat);
    } else if (chatDate > lastWeek) {
      groups['Previous 7 Days'].push(chat);
    } else if (chatDate > lastMonth) {
      groups['Previous 30 Days'].push(chat);
    } else {
      groups.Older.push(chat);
    }
  });

  return groups;
};

export function CommandMenuModal() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const pathname = usePathname();
  const router = useTransitionRouter();

  // Fetch chats from API
  const { chats } = useChats();

  const {
    modals,
    closeCommandModal,
    setCommandActiveItem,
    setCommandSearchQuery,
    openCommandModal,
    setCommandHoveredItem,
    clearCommandHover,
  } = useModals();

  const { open, activeItemId, searchQuery } = modals.command;
  const { hoveredItemId, source } = modals.commandHover;

  const inputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');

  // Ref to track currently active index for keyboard navigation
  const [focusIndex, setFocusIndex] = useState(-1);

  // Track if keyboard navigation is active
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);

  // Group chats by date
  const chatGroups = useMemo(() => groupChatsByDate(chats), [chats]);

  // Filter chat groups based on search
  const filteredChatGroups = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(chatGroups).map(([group, groupChats]) => [
          group,
          groupChats.filter((chat) =>
            chat.title.toLowerCase().includes(search.toLowerCase())
          ),
        ])
      ),
    [chatGroups, search]
  );

  // Get all navigable items flattened into a single array
  const navigableItems = useMemo(() => {
    const items = ['new-chat'];

    Object.values(filteredChatGroups).forEach((group) => {
      group.forEach((chat) => {
        items.push(chat.id);
      });
    });

    return items;
  }, [filteredChatGroups]);

  // Navigate to selected chat - memoize to stabilize
  const handleSelectChat = useCallback(
    (chatId: string) => {
      closeCommandModal();
      router.push(`/c/${chatId}`);
    },
    [closeCommandModal, router]
  );

  // Handle creating a new chat - memoize to stabilize
  const handleNewChat = useCallback(() => {
    closeCommandModal();
    router.push('/');
  }, [closeCommandModal, router]);

  // When search changes, just reset focus index
  useEffect(() => {
    if (open && search.length > 0) {
      // Reset focus to allow keyboard navigation from the top
      setFocusIndex(-1);
    }
  }, [search, open]);

  // Update search in Jotai state when local state changes
  useEffect(() => {
    // Only update if the modal is open and searchQuery is different
    if (open && searchQuery !== search) {
      setCommandSearchQuery(search);
    }
  }, [search, open]); // Remove circular dependencies

  // Sync focus index with active item when navigableItems change
  useEffect(() => {
    if (activeItemId && navigableItems.includes(activeItemId)) {
      const index = navigableItems.indexOf(activeItemId);
      setFocusIndex(index);
    }
  }, [navigableItems, activeItemId]);

  // Initialize when opening/closing
  useEffect(() => {
    if (open) {
      // Reset search when opening
      setSearch('');

      // Focus on the input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    } else {
      // Clear active item when closing
      setCommandActiveItem(null);
      clearCommandHover();
      setFocusIndex(-1);
    }
  }, [open]);

  // Sync focus index with active item if they get out of sync
  useEffect(() => {
    if (activeItemId && navigableItems.includes(activeItemId)) {
      const index = navigableItems.indexOf(activeItemId);
      if (index !== focusIndex) {
        setFocusIndex(index);
      }
    }
  }, [activeItemId, navigableItems, focusIndex]);

  // Update active item based on hover state only when using mouse
  useEffect(() => {
    if (
      hoveredItemId &&
      source === 'mouse' &&
      !isKeyboardNav &&
      activeItemId !== hoveredItemId
    ) {
      setCommandActiveItem(hoveredItemId);
    }
  }, [hoveredItemId, source, isKeyboardNav, activeItemId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) {
        return; // Only handle keyboard navigation when the modal is open
      }

      switch (e.key) {
        case 'k':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            closeCommandModal();
          }
          break;

        case 'Escape': {
          e.preventDefault();
          closeCommandModal();
          break;
        }

        case 'ArrowDown':
        case 'ArrowUp': {
          e.preventDefault();
          setIsKeyboardNav(true);

          if (navigableItems.length > 0) {
            let newIndex;
            if (e.key === 'ArrowDown') {
              newIndex = (focusIndex + 1) % navigableItems.length;
            } else {
              newIndex =
                (focusIndex - 1 + navigableItems.length) %
                navigableItems.length;
            }

            setFocusIndex(newIndex);
            const newItem = navigableItems[newIndex];
            if (newItem) {
              setCommandActiveItem(newItem);
              // Clear hover state when using keyboard
              clearCommandHover();
            }
          }
          break;
        }

        case 'Enter': {
          e.preventDefault();
          if (activeItemId === 'new-chat') {
            handleNewChat();
          } else if (activeItemId) {
            handleSelectChat(activeItemId);
          }
          break;
        }
      }
    };

    // Reset keyboard nav flag on mouse move
    const handleMouseMove = () => {
      if (isKeyboardNav) {
        setIsKeyboardNav(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [
    open,
    closeCommandModal,
    navigableItems,
    activeItemId,
    handleNewChat,
    handleSelectChat,
    focusIndex,
    setCommandActiveItem,
    isKeyboardNav,
    clearCommandHover,
  ]);

  // Sync the jotai atom with the modals state
  const [openAtom, setOpenAtom] = useAtom(commandMenuOpenAtom);
  const [, setHoverState] = useAtom(commandHoverAtom);

  // Keep the two state sources in sync
  useEffect(() => {
    if (openAtom !== open) {
      setOpenAtom(open);
    }
  }, [open, openAtom, setOpenAtom]);

  const handleOpenChange = (newOpenState: boolean) => {
    setOpenAtom(newOpenState);

    // Also update the modals state
    if (newOpenState) {
      openCommandModal('');
    } else {
      closeCommandModal();
      // Clear hover state when the modal closes
      setHoverState({ hoveredItemId: null, source: null });
    }
  };

  // Only render if on desktop
  if (!isDesktop) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {open && (
          <>
            {/* Include custom styles */}
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />
            <div className="fixed inset-0 z-[600]">
              {/* Backdrop with blur */}
              <motion.div
                className="fixed inset-0 bg-background/60 backdrop-blur-md"
                onClick={closeCommandModal}
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />

              {/* Command dialog */}
              <motion.div
                className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 h-[70vh] max-h-[600px] w-full max-w-4xl transform rounded-none"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex h-full overflow-hidden rounded-none border border-border bg-background shadow-md">
                  {/* Left side - search and results */}
                  <div className="flex w-1/2 flex-col">
                    {/* Search bar */}
                    <SearchBar
                      search={search}
                      setSearch={setSearch}
                      closeCommandModal={closeCommandModal}
                      inputRef={inputRef}
                    />

                    {/* New chat button - fixed position */}
                    <div className="border-b bg-background px-2 py-2">
                      <button
                        onClick={handleNewChat}
                        onMouseEnter={() =>
                          !isKeyboardNav &&
                          setCommandHoveredItem('new-chat', 'mouse')
                        }
                        onFocus={() =>
                          setCommandHoveredItem('new-chat', 'keyboard')
                        }
                        className={cn(
                          'flex w-full items-center gap-2 rounded-none p-2 transition-colors',
                          activeItemId === 'new-chat'
                            ? 'bg-accent/70'
                            : 'bg-accent/30 hover:bg-accent/50'
                        )}
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-none bg-accent/40">
                          <Plus
                            weight="duotone"
                            className="h-4 w-4 text-foreground"
                          />
                        </div>
                        <span className="flex-1 font-medium text-foreground text-sm">
                          new chat
                        </span>
                        <CaretRight
                          weight="bold"
                          className="h-3 w-3 text-muted-foreground"
                        />
                      </button>
                    </div>

                    {/* Chat list with fade gradients */}
                    <RelativeScrollFadeContainer className="flex-1">
                      <div className="px-2 py-2 pb-8">
                        <ChatGroupList
                          filteredChatGroups={filteredChatGroups}
                          search={search}
                          chats={chats}
                          activeItemId={activeItemId}
                          pathname={pathname || ''}
                          handleSelectChat={handleSelectChat}
                          closeCommandModal={closeCommandModal}
                          isKeyboardNav={isKeyboardNav}
                        />
                      </div>
                    </RelativeScrollFadeContainer>
                  </div>

                  {/* Right side - preview */}
                  <div className="preview-section w-1/2 overflow-hidden">
                    {activeItemId === 'new-chat' ? (
                      <div className="flex h-full flex-col items-center justify-center p-6">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-none bg-accent/40">
                          <Plus
                            weight="duotone"
                            className="h-8 w-8 text-foreground/80"
                          />
                        </div>
                        <h3 className="mb-2 font-medium text-foreground text-xl">
                          start a new chat
                        </h3>
                        <p className="max-w-xs text-center text-muted-foreground">
                          Create a new thread with just a prompt. Your chat
                          history will be saved for later.
                        </p>
                      </div>
                    ) : activeItemId && activeItemId !== 'new-chat' ? (
                      // Show chat preview
                      <ChatPreview key={activeItemId} chatId={activeItemId} />
                    ) : (
                      // Default state when nothing is selected
                      <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                        <ChatDots
                          weight="duotone"
                          className="mb-4 h-10 w-10 opacity-50"
                        />
                        <p className="text-sm">select a chat to preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
