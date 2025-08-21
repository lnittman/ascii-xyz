import { useAtom } from 'jotai';
import { useEffect } from 'react';

import { mobileCommandMenuOpenAtom } from '@/atoms/mobile-menus';
import { useModals } from '@/hooks/use-modals';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';

/**
 * Hook for handling application-wide keyboard shortcuts
 */
export function useKeyboardShortcuts() {
  const { isMobile } = useIsMobile();
  const { modals, openCommandModal, closeCommandModal } = useModals();
  const [mobileCommandMenuOpen, setMobileCommandMenuOpen] = useAtom(
    mobileCommandMenuOpenAtom
  );

  // Register global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command+K to toggle command menu
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();

        if (isMobile) {
          // Handle mobile command menu
          setMobileCommandMenuOpen(!mobileCommandMenuOpen);
        } else {
          // Handle desktop command menu
          if (modals.command.open) {
            closeCommandModal();
          } else {
            openCommandModal();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isMobile,
    mobileCommandMenuOpen,
    setMobileCommandMenuOpen,
    modals.command.open,
    openCommandModal,
    closeCommandModal,
  ]);

  return {
    isCommandMenuOpen: isMobile ? mobileCommandMenuOpen : modals.command.open,
  };
}
