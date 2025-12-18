import type { KeyboardShortcut } from '@/atoms/keyboard/shortcuts';

export const defaultShortcuts: KeyboardShortcut[] = [
  // ============================================================================
  // General
  // ============================================================================
  {
    id: 'open-command-palette',
    label: 'open command palette',
    description: 'search and execute commands',
    trigger: { key: 'k', modifiers: ['meta'] },
    action: 'openCommandPalette',
    group: 'general',
    requiresLeader: false,
  },
  {
    id: 'view-shortcuts',
    label: 'view keyboard shortcuts',
    description: 'show all available shortcuts',
    trigger: { key: '/', modifiers: ['meta'] },
    action: 'viewShortcuts',
    group: 'general',
    requiresLeader: false,
  },
  {
    id: 'close-modal',
    label: 'close / back',
    description: 'close modal or go back',
    trigger: { key: 'Escape', modifiers: [] },
    action: 'closeModal',
    group: 'general',
    context: ['!input', '!textarea'],
    requiresLeader: false,
  },

  // ============================================================================
  // Generation
  // ============================================================================
  {
    id: 'generate',
    label: 'generate',
    description: 'start generating ASCII art',
    trigger: { key: 'Enter', modifiers: ['meta'] },
    action: 'generate',
    group: 'generation',
    requiresLeader: false,
  },
  {
    id: 'new-generation',
    label: 'new generation',
    description: 'clear and start fresh',
    trigger: { key: 'n', modifiers: ['meta'] },
    action: 'newGeneration',
    group: 'generation',
    context: ['!input', '!textarea'],
    requiresLeader: false,
  },
  {
    id: 'regenerate',
    label: 'regenerate',
    description: 'regenerate current artwork',
    trigger: { key: 'r', modifiers: ['meta', 'shift'] },
    action: 'regenerate',
    group: 'generation',
    requiresLeader: false,
  },
  {
    id: 'toggle-animation',
    label: 'toggle animation',
    description: 'play or pause animation',
    trigger: { key: ' ', modifiers: ['meta'] },
    action: 'toggleAnimation',
    group: 'generation',
    requiresLeader: false,
  },
  {
    id: 'focus-prompt',
    label: 'focus prompt',
    description: 'move focus to prompt input',
    trigger: { key: 'i', modifiers: [] },
    action: 'focusPrompt',
    group: 'generation',
    context: ['!input', '!textarea'],
    requiresLeader: true,
  },

  // ============================================================================
  // Navigation (leader key sequences)
  // ============================================================================
  {
    id: 'go-home',
    label: 'go to create',
    description: 'navigate to create page',
    trigger: { keys: [{ key: 'g' }, { key: 'h' }] },
    action: 'goHome',
    group: 'navigation',
    requiresLeader: true,
  },
  {
    id: 'go-gallery',
    label: 'go to gallery',
    description: 'navigate to gallery',
    trigger: { keys: [{ key: 'g' }, { key: 'g' }] },
    action: 'goGallery',
    group: 'navigation',
    requiresLeader: true,
  },
  {
    id: 'go-collections',
    label: 'go to collections',
    description: 'navigate to collections',
    trigger: { keys: [{ key: 'g' }, { key: 'c' }] },
    action: 'goCollections',
    group: 'navigation',
    requiresLeader: true,
  },
  {
    id: 'go-settings',
    label: 'go to settings',
    description: 'navigate to settings',
    trigger: { keys: [{ key: 'g' }, { key: 's' }] },
    action: 'goSettings',
    group: 'navigation',
    requiresLeader: true,
  },

  // ============================================================================
  // Gallery
  // ============================================================================
  {
    id: 'focus-search',
    label: 'focus search',
    description: 'focus gallery search input',
    trigger: { key: '/', modifiers: [] },
    action: 'focusSearch',
    group: 'gallery',
    context: ['!input', '!textarea'],
    requiresLeader: true,
  },
  {
    id: 'filter-my-art',
    label: 'show my art',
    description: 'filter to my artworks',
    trigger: { key: '1', modifiers: [] },
    action: 'filterMyArt',
    group: 'gallery',
    context: ['!input', '!textarea'],
    requiresLeader: true,
  },
  {
    id: 'filter-trending',
    label: 'show trending',
    description: 'filter to trending artworks',
    trigger: { key: '2', modifiers: [] },
    action: 'filterTrending',
    group: 'gallery',
    context: ['!input', '!textarea'],
    requiresLeader: true,
  },
  {
    id: 'filter-featured',
    label: 'show featured',
    description: 'filter to featured artworks',
    trigger: { key: '3', modifiers: [] },
    action: 'filterFeatured',
    group: 'gallery',
    context: ['!input', '!textarea'],
    requiresLeader: true,
  },
  {
    id: 'filter-public',
    label: 'show public',
    description: 'filter to public gallery',
    trigger: { key: '4', modifiers: [] },
    action: 'filterPublic',
    group: 'gallery',
    context: ['!input', '!textarea'],
    requiresLeader: true,
  },

  // ============================================================================
  // Export (leader key sequences)
  // ============================================================================
  {
    id: 'export-gif',
    label: 'export GIF',
    description: 'export artwork as animated GIF',
    trigger: { keys: [{ key: 'e' }, { key: 'g' }] },
    action: 'exportGif',
    group: 'export',
    requiresLeader: true,
  },
  {
    id: 'export-video',
    label: 'export video',
    description: 'export artwork as MP4 video',
    trigger: { keys: [{ key: 'e' }, { key: 'v' }] },
    action: 'exportVideo',
    group: 'export',
    requiresLeader: true,
  },
  {
    id: 'export-code',
    label: 'export code',
    description: 'export artwork as embeddable code',
    trigger: { keys: [{ key: 'e' }, { key: 'c' }] },
    action: 'exportCode',
    group: 'export',
    requiresLeader: true,
  },
  {
    id: 'copy-ascii',
    label: 'copy ASCII',
    description: 'copy ASCII art to clipboard',
    trigger: { key: 'c', modifiers: ['meta', 'shift'] },
    action: 'copyAscii',
    group: 'export',
    requiresLeader: false,
  },
];

export function getDefaultShortcut(id: string): KeyboardShortcut | undefined {
  return defaultShortcuts.find((s) => s.id === id);
}

export function getShortcutsByGroup(
  shortcuts: KeyboardShortcut[]
): Record<string, KeyboardShortcut[]> {
  const grouped: Record<string, KeyboardShortcut[]> = {};

  for (const shortcut of shortcuts) {
    if (!grouped[shortcut.group]) {
      grouped[shortcut.group] = [];
    }
    grouped[shortcut.group].push(shortcut);
  }

  return grouped;
}

export const shortcutGroups = {
  general: 'General',
  generation: 'Generation',
  navigation: 'Navigation',
  gallery: 'Gallery',
  export: 'Export',
} as const;
