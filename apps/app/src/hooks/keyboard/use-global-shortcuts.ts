'use client';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  type KeyboardShortcut,
  type KeyCombo,
  isKeyCombo,
  isKeySequence,
  keyComboMatches,
  leaderKeyConfigAtom,
  leaderModeActiveAtom,
  leaderModeTimestampAtom,
  pendingSequenceAtom,
  shortcutOverridesAtom,
  shortcutRequiresLeader,
} from '@/atoms/keyboard/shortcuts';
import { defaultShortcuts } from '@/lib/keyboard/default-shortcuts';

const SEQUENCE_TIMEOUT_MS = 1000;
const LEADER_MODE_TIMEOUT_MS = 2000;

interface UseGlobalShortcutsOptions {
  onOpenCommandPalette?: () => void;
  onOpenShortcutsModal?: () => void;
}

export function useGlobalShortcuts(options: UseGlobalShortcutsOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const overrides = useAtomValue(shortcutOverridesAtom);
  const [pendingSequence, setPendingSequence] = useAtom(pendingSequenceAtom);
  const leaderKeyConfig = useAtomValue(leaderKeyConfigAtom);
  const [leaderModeActive, setLeaderModeActive] = useAtom(leaderModeActiveAtom);
  const [leaderModeTimestamp, setLeaderModeTimestamp] = useAtom(leaderModeTimestampAtom);

  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const shortcuts = useMemo(() => {
    return defaultShortcuts
      .map((shortcut) => {
        const override = overrides.find((o) => o.id === shortcut.id);
        if (!override) {
          return shortcut;
        }
        return {
          ...shortcut,
          trigger: override.trigger ?? shortcut.trigger,
          enabled: override.enabled ?? shortcut.enabled,
        };
      })
      .filter((s) => s.enabled !== false);
  }, [overrides]);

  // Action handlers - these will be called when shortcuts are triggered
  const actions = useMemo<Record<string, () => void | Promise<void>>>(
    () => ({
      // General
      openCommandPalette: () => {
        options.onOpenCommandPalette?.();
      },
      viewShortcuts: () => {
        options.onOpenShortcutsModal?.();
      },
      closeModal: () => {
        // This will be handled by modal components themselves
      },

      // Generation
      generate: () => {
        // Trigger form submission - find and click generate button
        const generateBtn = document.querySelector('[data-generate-button]');
        if (generateBtn instanceof HTMLButtonElement) {
          generateBtn.click();
        }
      },
      newGeneration: () => {
        router.push('/');
      },
      regenerate: () => {
        const regenerateBtn = document.querySelector('[data-regenerate-button]');
        if (regenerateBtn instanceof HTMLButtonElement) {
          regenerateBtn.click();
        }
      },
      toggleAnimation: () => {
        const playPauseBtn = document.querySelector('[data-play-pause-button]');
        if (playPauseBtn instanceof HTMLButtonElement) {
          playPauseBtn.click();
        }
      },
      focusPrompt: () => {
        const promptInput = document.querySelector('[data-prompt-input]');
        if (promptInput instanceof HTMLTextAreaElement) {
          promptInput.focus();
        }
      },

      // Navigation
      goHome: () => router.push('/'),
      goGallery: () => router.push('/gallery'),
      goCollections: () => router.push('/collections'),
      goSettings: () => router.push('/settings'),

      // Gallery
      focusSearch: () => {
        if (pathname === '/gallery') {
          const searchInput = document.querySelector('[data-search-input]');
          if (searchInput instanceof HTMLInputElement) {
            searchInput.focus();
          }
        } else {
          router.push('/gallery');
        }
      },
      filterMyArt: () => {
        const myArtBtn = document.querySelector('[data-filter-my-art]');
        if (myArtBtn instanceof HTMLButtonElement) {
          myArtBtn.click();
        }
      },
      filterTrending: () => {
        const trendingBtn = document.querySelector('[data-filter-trending]');
        if (trendingBtn instanceof HTMLButtonElement) {
          trendingBtn.click();
        }
      },
      filterFeatured: () => {
        const featuredBtn = document.querySelector('[data-filter-featured]');
        if (featuredBtn instanceof HTMLButtonElement) {
          featuredBtn.click();
        }
      },
      filterPublic: () => {
        const publicBtn = document.querySelector('[data-filter-public]');
        if (publicBtn instanceof HTMLButtonElement) {
          publicBtn.click();
        }
      },

      // Export
      exportGif: () => {
        const exportGifBtn = document.querySelector('[data-export-gif]');
        if (exportGifBtn instanceof HTMLButtonElement) {
          exportGifBtn.click();
        }
      },
      exportVideo: () => {
        const exportVideoBtn = document.querySelector('[data-export-video]');
        if (exportVideoBtn instanceof HTMLButtonElement) {
          exportVideoBtn.click();
        }
      },
      exportCode: () => {
        const exportCodeBtn = document.querySelector('[data-export-code]');
        if (exportCodeBtn instanceof HTMLButtonElement) {
          exportCodeBtn.click();
        }
      },
      copyAscii: () => {
        const copyBtn = document.querySelector('[data-copy-ascii]');
        if (copyBtn instanceof HTMLButtonElement) {
          copyBtn.click();
        }
      },
    }),
    [router, pathname, options]
  );

  const matchesContext = useCallback(
    (shortcut: KeyboardShortcut, event: KeyboardEvent): boolean => {
      if (!shortcut.context || shortcut.context.length === 0) {
        return true;
      }

      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isInput = tagName === 'input';
      const isTextarea = tagName === 'textarea';
      const isContentEditable = target.isContentEditable;

      for (const ctx of shortcut.context) {
        if (ctx === '!input' && isInput) return false;
        if (ctx === '!textarea' && isTextarea) return false;
        if (ctx === 'input' && !isInput) return false;
        if (ctx === 'textarea' && !isTextarea) return false;
        if (ctx === 'contenteditable' && !isContentEditable) return false;
        if (ctx === '!contenteditable' && isContentEditable) return false;
      }

      return true;
    },
    []
  );

  const clearPendingSequence = useCallback(() => {
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
    setPendingSequence(null);
  }, [setPendingSequence]);

  const clearLeaderMode = useCallback(() => {
    if (leaderTimeoutRef.current) {
      clearTimeout(leaderTimeoutRef.current);
      leaderTimeoutRef.current = null;
    }
    setLeaderModeActive(false);
    setLeaderModeTimestamp(null);
  }, [setLeaderModeActive, setLeaderModeTimestamp]);

  const activateLeaderMode = useCallback(() => {
    setLeaderModeActive(true);
    setLeaderModeTimestamp(Date.now());

    if (leaderTimeoutRef.current) {
      clearTimeout(leaderTimeoutRef.current);
    }
    leaderTimeoutRef.current = setTimeout(clearLeaderMode, LEADER_MODE_TIMEOUT_MS);
  }, [setLeaderModeActive, setLeaderModeTimestamp, clearLeaderMode]);

  const isLeaderModeValid = useCallback(() => {
    if (!leaderModeActive) return false;
    if (!leaderModeTimestamp) return false;
    return Date.now() - leaderModeTimestamp < LEADER_MODE_TIMEOUT_MS;
  }, [leaderModeActive, leaderModeTimestamp]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore modifier-only keypresses
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) {
        return;
      }

      const currentCombo: KeyCombo = {
        key: event.key,
        modifiers: [
          ...(event.metaKey ? ['meta' as const] : []),
          ...(event.ctrlKey ? ['ctrl' as const] : []),
          ...(event.altKey ? ['alt' as const] : []),
          ...(event.shiftKey ? ['shift' as const] : []),
        ],
      };

      // Check for leader key activation
      if (leaderKeyConfig.enabled && keyComboMatches(leaderKeyConfig.key, event)) {
        // Don't activate leader mode if in input/textarea
        const target = event.target as HTMLElement;
        const tagName = target.tagName.toLowerCase();
        if (tagName !== 'input' && tagName !== 'textarea' && !target.isContentEditable) {
          event.preventDefault();
          activateLeaderMode();
          return;
        }
      }

      const leaderActive = isLeaderModeValid();

      // Handle pending sequences
      if (pendingSequence) {
        const now = Date.now();
        if (now - pendingSequence.timestamp > SEQUENCE_TIMEOUT_MS) {
          clearPendingSequence();
        } else {
          const newKeys = [...pendingSequence.keys, currentCombo];

          // Check for complete sequence match
          for (const shortcut of shortcuts) {
            if (!isKeySequence(shortcut.trigger)) continue;
            if (!matchesContext(shortcut, event)) continue;

            const sequence = shortcut.trigger;
            if (sequence.keys.length !== newKeys.length) continue;

            const matches = sequence.keys.every((combo, i) => {
              const pressed = newKeys[i];
              return (
                combo.key.toLowerCase() === pressed.key.toLowerCase() &&
                (combo.modifiers || []).every((m) => pressed.modifiers?.includes(m)) &&
                (pressed.modifiers || []).every((m) => combo.modifiers?.includes(m) || m === undefined)
              );
            });

            if (matches) {
              event.preventDefault();
              clearPendingSequence();
              clearLeaderMode();
              const action = actions[shortcut.action];
              if (action) action();
              return;
            }
          }

          // Check if this could still match a longer sequence
          const couldMatch = shortcuts.some((shortcut) => {
            if (!isKeySequence(shortcut.trigger)) return false;
            const sequence = shortcut.trigger;
            if (sequence.keys.length <= newKeys.length) return false;

            return sequence.keys.slice(0, newKeys.length).every((combo, i) => {
              const pressed = newKeys[i];
              return combo.key.toLowerCase() === pressed.key.toLowerCase();
            });
          });

          if (couldMatch) {
            event.preventDefault();
            setPendingSequence({ keys: newKeys, timestamp: now });
            if (sequenceTimeoutRef.current) {
              clearTimeout(sequenceTimeoutRef.current);
            }
            sequenceTimeoutRef.current = setTimeout(clearPendingSequence, SEQUENCE_TIMEOUT_MS);
            return;
          }
          clearPendingSequence();
        }
      }

      // Check for single key combo matches
      for (const shortcut of shortcuts) {
        if (!matchesContext(shortcut, event)) continue;

        const requiresLeader = shortcutRequiresLeader(shortcut);
        if (requiresLeader && leaderKeyConfig.enabled && !leaderActive) continue;

        if (isKeyCombo(shortcut.trigger)) {
          if (keyComboMatches(shortcut.trigger, event)) {
            event.preventDefault();
            if (requiresLeader) clearLeaderMode();
            const action = actions[shortcut.action];
            if (action) action();
            return;
          }
        } else if (isKeySequence(shortcut.trigger)) {
          // Start a new sequence
          const sequence = shortcut.trigger;
          const firstCombo = sequence.keys[0];

          if (firstCombo && keyComboMatches(firstCombo, event)) {
            event.preventDefault();
            setPendingSequence({ keys: [currentCombo], timestamp: Date.now() });
            if (sequenceTimeoutRef.current) {
              clearTimeout(sequenceTimeoutRef.current);
            }
            sequenceTimeoutRef.current = setTimeout(clearPendingSequence, SEQUENCE_TIMEOUT_MS);
            return;
          }
        }
      }
    },
    [
      shortcuts,
      actions,
      pendingSequence,
      setPendingSequence,
      clearPendingSequence,
      matchesContext,
      leaderKeyConfig,
      activateLeaderMode,
      isLeaderModeValid,
      clearLeaderMode,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
      if (leaderTimeoutRef.current) {
        clearTimeout(leaderTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  return {
    shortcuts,
    pendingSequence,
    leaderModeActive,
    leaderKeyConfig,
  };
}
