import { atom } from 'jotai';

// ============================================================================
// Types
// ============================================================================

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string; // Phosphor icon name
  group: 'navigation' | 'generation' | 'gallery' | 'export' | 'settings';
  keywords?: string[]; // Additional search terms
  action: string;
  shortcut?: string; // Display string like "⌘N"
}

export interface CommandPaletteState {
  open: boolean;
  query: string;
}

// ============================================================================
// Commands
// ============================================================================

export const staticCommands: Command[] = [
  // Navigation
  {
    id: 'go-create',
    label: 'Go to Create',
    description: 'Start creating new ASCII art',
    icon: 'Plus',
    group: 'navigation',
    keywords: ['home', 'new', 'generate'],
    action: 'goHome',
    shortcut: 'Space g h',
  },
  {
    id: 'go-gallery',
    label: 'Go to Gallery',
    description: 'Browse your artworks',
    icon: 'GridFour',
    group: 'navigation',
    keywords: ['browse', 'view', 'list'],
    action: 'goGallery',
    shortcut: 'Space g g',
  },
  {
    id: 'go-collections',
    label: 'Go to Collections',
    description: 'Manage your collections',
    icon: 'Folder',
    group: 'navigation',
    keywords: ['organize', 'folders'],
    action: 'goCollections',
    shortcut: 'Space g c',
  },
  {
    id: 'go-settings',
    label: 'Go to Settings',
    description: 'Configure your preferences',
    icon: 'Gear',
    group: 'navigation',
    keywords: ['preferences', 'config', 'options'],
    action: 'goSettings',
    shortcut: 'Space g s',
  },

  // Generation
  {
    id: 'new-generation',
    label: 'New Generation',
    description: 'Clear and start fresh',
    icon: 'Plus',
    group: 'generation',
    keywords: ['create', 'start', 'fresh'],
    action: 'newGeneration',
    shortcut: '⌘N',
  },
  {
    id: 'regenerate',
    label: 'Regenerate',
    description: 'Regenerate current artwork',
    icon: 'ArrowClockwise',
    group: 'generation',
    keywords: ['retry', 'again', 'redo'],
    action: 'regenerate',
    shortcut: '⌘⇧R',
  },
  {
    id: 'toggle-animation',
    label: 'Play/Pause Animation',
    description: 'Toggle animation playback',
    icon: 'Play',
    group: 'generation',
    keywords: ['play', 'pause', 'stop'],
    action: 'toggleAnimation',
    shortcut: '⌘Space',
  },

  // Gallery
  {
    id: 'search-gallery',
    label: 'Search Gallery',
    description: 'Search your artworks',
    icon: 'MagnifyingGlass',
    group: 'gallery',
    keywords: ['find', 'filter', 'query'],
    action: 'focusSearch',
    shortcut: 'Space /',
  },
  {
    id: 'filter-my-art',
    label: 'Show My Art',
    description: 'Filter to your artworks',
    icon: 'User',
    group: 'gallery',
    keywords: ['mine', 'personal'],
    action: 'filterMyArt',
    shortcut: 'Space 1',
  },
  {
    id: 'filter-trending',
    label: 'Show Trending',
    description: 'Filter to trending artworks',
    icon: 'TrendUp',
    group: 'gallery',
    keywords: ['popular', 'hot'],
    action: 'filterTrending',
    shortcut: 'Space 2',
  },
  {
    id: 'filter-featured',
    label: 'Show Featured',
    description: 'Filter to featured artworks',
    icon: 'Star',
    group: 'gallery',
    keywords: ['curated', 'picks'],
    action: 'filterFeatured',
    shortcut: 'Space 3',
  },
  {
    id: 'filter-public',
    label: 'Show Public',
    description: 'Filter to public gallery',
    icon: 'Globe',
    group: 'gallery',
    keywords: ['community', 'all'],
    action: 'filterPublic',
    shortcut: 'Space 4',
  },

  // Export
  {
    id: 'export-gif',
    label: 'Export as GIF',
    description: 'Export animated GIF',
    icon: 'FileImage',
    group: 'export',
    keywords: ['animation', 'image'],
    action: 'exportGif',
    shortcut: 'Space e g',
  },
  {
    id: 'export-video',
    label: 'Export as Video',
    description: 'Export MP4 video',
    icon: 'FileVideo',
    group: 'export',
    keywords: ['mp4', 'movie'],
    action: 'exportVideo',
    shortcut: 'Space e v',
  },
  {
    id: 'export-code',
    label: 'Export as Code',
    description: 'Get embeddable code',
    icon: 'Code',
    group: 'export',
    keywords: ['embed', 'html'],
    action: 'exportCode',
    shortcut: 'Space e c',
  },
  {
    id: 'copy-ascii',
    label: 'Copy ASCII',
    description: 'Copy ASCII art to clipboard',
    icon: 'Copy',
    group: 'export',
    keywords: ['clipboard', 'paste'],
    action: 'copyAscii',
    shortcut: '⌘⇧C',
  },

  // Settings
  {
    id: 'settings-profile',
    label: 'Profile Settings',
    description: 'Manage your profile',
    icon: 'User',
    group: 'settings',
    keywords: ['account', 'name'],
    action: 'goSettingsProfile',
  },
  {
    id: 'settings-models',
    label: 'Model Settings',
    description: 'Configure AI models',
    icon: 'Robot',
    group: 'settings',
    keywords: ['ai', 'llm'],
    action: 'goSettingsModels',
  },
  {
    id: 'settings-appearance',
    label: 'Appearance Settings',
    description: 'Customize theme and display',
    icon: 'PaintBrush',
    group: 'settings',
    keywords: ['theme', 'dark', 'light'],
    action: 'goSettingsAppearance',
  },
  {
    id: 'view-shortcuts',
    label: 'View Keyboard Shortcuts',
    description: 'Show all shortcuts',
    icon: 'Keyboard',
    group: 'settings',
    keywords: ['hotkeys', 'keys'],
    action: 'viewShortcuts',
    shortcut: '⌘/',
  },
];

// ============================================================================
// Atoms
// ============================================================================

export const commandPaletteStateAtom = atom<CommandPaletteState>({
  open: false,
  query: '',
});

export const commandsAtom = atom<Command[]>(staticCommands);

// Filtered commands based on search query
export const filteredCommandsAtom = atom((get) => {
  const { query } = get(commandPaletteStateAtom);
  const commands = get(commandsAtom);

  if (!query.trim()) {
    return commands;
  }

  const searchLower = query.toLowerCase();
  return commands.filter((cmd) => {
    const labelMatch = cmd.label.toLowerCase().includes(searchLower);
    const descMatch = cmd.description?.toLowerCase().includes(searchLower);
    const keywordMatch = cmd.keywords?.some((k) => k.toLowerCase().includes(searchLower));
    return labelMatch || descMatch || keywordMatch;
  });
});

// Group labels
export const commandGroupLabels = {
  navigation: 'Navigation',
  generation: 'Generation',
  gallery: 'Gallery',
  export: 'Export',
  settings: 'Settings',
} as const;
