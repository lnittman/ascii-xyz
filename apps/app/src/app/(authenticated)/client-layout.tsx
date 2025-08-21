'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';

import { motion } from 'framer-motion';
import { useAtom, useSetAtom } from 'jotai';
import { usePathname } from 'next/navigation';

import { useIsMobile } from '@repo/design/hooks/use-is-mobile';

import { outputPanelOpenAtom } from '@/atoms/layout/output';
import { sidebarOpenAtom } from '@/atoms/layout/sidebar';
import { initialModelsAtom, selectedModelIdAtom } from '@/atoms/models';
import { initialUserAtom } from '@/atoms/user';
import { MobileCodeUserMenuSheet } from '@/components/code/mobile/MobileCodeUserMenuSheet';
import { MobileModelPickerSheet } from '@/components/code/mobile/MobileModelPickerSheet';
import { MobileWorkspaceSheet } from '@/components/code/mobile/MobileWorkspaceSheet';
import { CommandMenuPrefetcher } from '@/components/layout/CommandMenuPrefetcher';
import { Modals } from '@/components/layout/GlobalModals';
import { MobileBlurOverlay } from '@/components/layout/MobileBlurOverlay';
import { MobileCommandSheet } from '@/components/layout/modal/command-menu/MobileCommandSheet';
import {
  MobileArchiveSheet,
  MobileDeleteSheet,
  MobileProjectFilesSheet,
  MobileProjectInstructionsSheet,
  MobileProjectSheet,
  MobileRenameSheet,
  MobileShareSheet,
} from '@/components/layout/modal/mobile';
import { MobileAvatarUploadSheet } from '@/components/layout/modal/mobile/MobileAvatarUploadSheet';
import { MobileFilePreviewSheet } from '@/components/layout/modal/mobile/MobileFilePreviewSheet';
import { MobileImagePreviewSheet } from '@/components/layout/modal/mobile/MobileImagePreviewSheet';
import { MobileProviderModelsSheet } from '@/components/layout/modal/mobile/MobileProviderModelsSheet';
import { OutputPanel } from '@/components/layout/output-panel/OutputPanel';
import { Sidebar } from '@/components/layout/sidebar/Sidebar';
import { MobileUserMenuSheet } from '@/components/layout/sidebar/components/user-menu/MobileUserMenuSheet';
import {
  MobileChatMenuSheet,
  MobileProjectMenuSheet,
} from '@/components/shared/menu/mobile';
import { MobilePlusMenuSheet } from '@/components/shared/prompt-bar/components/plus-menu/mobile/MobilePlusMenuSheet';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard';

import { Header } from '@/components/layout/Header';
import { ORPCProvider } from '@/providers/orpc-provider';
import { CodeHeader } from '@/components/code/CodeHeader';

import type { Chat, Project } from '@repo/database/types';

interface ClientLayoutProps {
  children: React.ReactNode;
  showSidebarPadding?: boolean;
  initialProjects?: Project[];
  initialChats?: Chat[];
  initialModels?: any; // ModelsResponse type from API
  initialUser?: any; // User type from database
}

/**
 * Client-side layout component for authenticated routes
 * This can be used to wrap components that need client-side layout features
 * without all the modals and sidebar components of the main layout
 */
export function ClientLayout({
  children,
  showSidebarPadding = true,
  initialProjects,
  initialChats,
  initialModels,
  initialUser,
}: ClientLayoutProps) {
  const { isMobile, ready } = useIsMobile();
  const pathname = usePathname();
  const isCodePage = pathname?.startsWith('/code') || false;

  useKeyboardShortcuts();

  const [isSidebarOpen] = useAtom(sidebarOpenAtom);
  const [isOutputPanelOpen] = useAtom(outputPanelOpenAtom);
  const setOutputPanelOpen = useSetAtom(outputPanelOpenAtom);
  const setInitialModels = useSetAtom(initialModelsAtom);
  const setInitialUser = useSetAtom(initialUserAtom);
  const setSelectedModelId = useSetAtom(selectedModelIdAtom);

  // Set initial data from server-side
  // Use a ref to track if we've already initialized to prevent re-runs
  const initializedRef = useRef(false);

  if (!initializedRef.current) {
    initializedRef.current = true;

    if (initialModels) {
      setInitialModels(initialModels);
    }
    if (initialUser) {
      setInitialUser(initialUser);
      // Set the user's active model as the selected model
      if (initialUser.activeModel) {
        setSelectedModelId(initialUser.activeModel);
      }
    }
  }

  // Close output panel when navigating away from chat pages
  useEffect(() => {
    // Check if current path is a chat page
    const isChatPage =
      pathname?.match(/^\/c\/[^/]+$/) ||
      pathname?.match(/^\/p\/[^/]+\/c\/[^/]+$/);

    if (!isChatPage) {
      // Immediately close output panel when not on a chat page
      setOutputPanelOpen(false);
    }
  }, [pathname, setOutputPanelOpen]);

  // Determine if this is a chat page and extract chat info for header
  const chatPageMatch =
    pathname?.match(/^\/c\/([^/]+)$/) ||
    pathname?.match(/^\/p\/[^/]+\/c\/([^/]+)$/);
  const isChatPage = !!chatPageMatch;
  const chatId = chatPageMatch?.[1];
  const isProjectChat = pathname?.includes('/p/') || false;
  const isSettingsPage = pathname?.startsWith('/settings') || false;

  if (!ready) {
    return null;
  }

  // Code page layout without sidebar
  if (isCodePage) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <CodeHeader />
        <main className="flex flex-1 flex-col overflow-hidden bg-background pt-16">
          {children}
        </main>

        {/* All global modals available on code pages */}
        <Modals />

        {/* Mobile-specific Sheets and Overlays for code pages */}
        <MobileBlurOverlay />
        <MobileModelPickerSheet />
        <MobileCodeUserMenuSheet />
        <MobileWorkspaceSheet />
      </div>
    );
  }

  // Regular layout with sidebar and output panel
  return (
    <ORPCProvider>
      <div className="min-h-screen bg-background">
        {/* Top border that stays above sidebar */}
        <div className="fixed top-0 right-0 left-0 z-[246] h-px bg-border lg:z-[180]" />

        {/* Unified Header with SidebarToggle and ChatTitle */}
        <Header
          chatId={isChatPage ? chatId : undefined}
          isProject={isProjectChat}
          title={isSettingsPage ? 'Settings' : undefined}
        />

        <Sidebar
          initialProjects={initialProjects}
          initialChats={initialChats}
        />
        <OutputPanel />

        <motion.main
          className="min-h-screen flex-1 bg-background lg:h-screen"
          style={{ paddingTop: '48px' }} // Account for fixed header
          initial={false}
          animate={{
            marginLeft:
              !isMobile && showSidebarPadding ? (isSidebarOpen ? 280 : 48) : 0,
            marginRight: !isMobile && isOutputPanelOpen ? 480 : 0,
          }}
          transition={{
            duration: 0.3,
            ease: [0.32, 0.72, 0, 1],
          }}
        >
          {children}
        </motion.main>

        {/* All global modals available on regular pages */}
        <Modals />

        {/* Pre-fetch command menu data for instant loading */}
        {!isMobile && <CommandMenuPrefetcher />}

        {/* Mobile-specific Sheets and Overlays */}
        <MobileBlurOverlay />
        <MobileChatMenuSheet />
        <MobileProjectMenuSheet />
        <MobileRenameSheet />
        <MobileDeleteSheet />
        <MobileArchiveSheet />
        <MobileShareSheet />
        <MobileProjectSheet />
        <MobileProjectFilesSheet />
        <MobileProjectInstructionsSheet />
        <MobileProviderModelsSheet />
        <MobilePlusMenuSheet />
        <MobileModelPickerSheet />
        <MobileCommandSheet />
        <MobileUserMenuSheet />
        <MobileAvatarUploadSheet />
        <MobileImagePreviewSheet />
        <MobileFilePreviewSheet />
      </div>
    </ORPCProvider>
  );
}
