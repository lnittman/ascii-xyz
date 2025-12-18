'use client';

import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { useGlobalShortcuts } from '@/hooks/keyboard/use-global-shortcuts';
import { commandPaletteStateAtom } from '@/atoms/command-palette/registry';
import { keyboardShortcutsModalOpenAtom } from '@/components/layout/modal/KeyboardShortcutsModal';
import { CommandPalette } from '@/components/layout/command-palette/CommandPalette';
import { KeyboardShortcutsModal } from '@/components/layout/modal/KeyboardShortcutsModal';
import { LeaderKeyIndicator } from '@/components/layout/LeaderKeyIndicator';

interface GlobalShortcutsProviderProps {
  children: React.ReactNode;
}

export function GlobalShortcutsProvider({ children }: GlobalShortcutsProviderProps) {
  const setCommandPaletteState = useSetAtom(commandPaletteStateAtom);
  const setShortcutsModalOpen = useSetAtom(keyboardShortcutsModalOpenAtom);

  const handleOpenCommandPalette = useCallback(() => {
    setCommandPaletteState((prev) => ({ ...prev, open: !prev.open }));
  }, [setCommandPaletteState]);

  const handleOpenShortcutsModal = useCallback(() => {
    setShortcutsModalOpen(true);
  }, [setShortcutsModalOpen]);

  // Initialize global shortcuts
  useGlobalShortcuts({
    onOpenCommandPalette: handleOpenCommandPalette,
    onOpenShortcutsModal: handleOpenShortcutsModal,
  });

  return (
    <>
      {children}
      <CommandPalette />
      <KeyboardShortcutsModal />
      <LeaderKeyIndicator />
    </>
  );
}
