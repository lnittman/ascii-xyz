import { atom } from 'jotai';

// ============================================================================
// Types
// ============================================================================

export type Modifier = 'meta' | 'ctrl' | 'alt' | 'shift';

export interface KeyCombo {
  key: string;
  modifiers?: Modifier[];
}

export interface KeySequence {
  keys: KeyCombo[];
}

export type ShortcutTrigger = KeyCombo | KeySequence;

export interface KeyboardShortcut {
  id: string;
  label: string;
  description: string;
  trigger: ShortcutTrigger;
  action: string;
  group: 'general' | 'generation' | 'navigation' | 'gallery' | 'export';
  context?: ('input' | 'textarea' | 'contenteditable' | '!input' | '!textarea' | '!contenteditable')[];
  requiresLeader?: boolean;
  enabled?: boolean;
}

export interface ShortcutOverride {
  id: string;
  trigger?: ShortcutTrigger;
  enabled?: boolean;
}

export interface PendingSequence {
  keys: KeyCombo[];
  timestamp: number;
}

export interface LeaderKeyConfig {
  enabled: boolean;
  key: KeyCombo;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isKeyCombo(trigger: ShortcutTrigger): trigger is KeyCombo {
  return 'key' in trigger && !('keys' in trigger);
}

export function isKeySequence(trigger: ShortcutTrigger): trigger is KeySequence {
  return 'keys' in trigger;
}

export function shortcutRequiresLeader(shortcut: KeyboardShortcut): boolean {
  return shortcut.requiresLeader === true;
}

// ============================================================================
// Utilities
// ============================================================================

export function keyComboMatches(combo: KeyCombo, event: KeyboardEvent): boolean {
  const keyMatches = combo.key.toLowerCase() === event.key.toLowerCase();
  if (!keyMatches) return false;

  const modifiers = combo.modifiers || [];
  const metaRequired = modifiers.includes('meta');
  const ctrlRequired = modifiers.includes('ctrl');
  const altRequired = modifiers.includes('alt');
  const shiftRequired = modifiers.includes('shift');

  return (
    event.metaKey === metaRequired &&
    event.ctrlKey === ctrlRequired &&
    event.altKey === altRequired &&
    event.shiftKey === shiftRequired
  );
}

export function formatShortcut(trigger: ShortcutTrigger): string {
  if (isKeySequence(trigger)) {
    return trigger.keys.map(formatKeyCombo).join(' → ');
  }
  return formatKeyCombo(trigger);
}

export function formatKeyCombo(combo: KeyCombo): string {
  const parts: string[] = [];
  const modifiers = combo.modifiers || [];

  if (modifiers.includes('meta')) parts.push('⌘');
  if (modifiers.includes('ctrl')) parts.push('⌃');
  if (modifiers.includes('alt')) parts.push('⌥');
  if (modifiers.includes('shift')) parts.push('⇧');

  // Format special keys
  const keyDisplay = {
    ' ': 'Space',
    'Escape': 'Esc',
    'Enter': '↵',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Backspace': '⌫',
    'Delete': '⌦',
    'Tab': '⇥',
  }[combo.key] || combo.key.toUpperCase();

  parts.push(keyDisplay);
  return parts.join('');
}

// ============================================================================
// Atoms
// ============================================================================

export const leaderKeyConfigAtom = atom<LeaderKeyConfig>({
  enabled: true,
  key: { key: ' ', modifiers: [] }, // Space as leader
});

export const leaderModeActiveAtom = atom<boolean>(false);

export const leaderModeTimestampAtom = atom<number | null>(null);

export const pendingSequenceAtom = atom<PendingSequence | null>(null);

export const shortcutOverridesAtom = atom<ShortcutOverride[]>([]);

// Derived atom for showing leader mode indicator
export const showLeaderIndicatorAtom = atom((get) => {
  const active = get(leaderModeActiveAtom);
  const pending = get(pendingSequenceAtom);
  return active || pending !== null;
});
