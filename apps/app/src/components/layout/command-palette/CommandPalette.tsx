'use client';

import { useCallback, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useRouter } from 'next/navigation';
import {
  Plus,
  GridFour,
  Folder,
  Gear,
  ArrowClockwise,
  Play,
  MagnifyingGlass,
  User,
  TrendUp,
  Star,
  Globe,
  FileImage,
  FileVideo,
  Code,
  Copy,
  Robot,
  PaintBrush,
  Keyboard,
} from '@phosphor-icons/react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@repo/design/components/ui/command';
import {
  commandPaletteStateAtom,
  filteredCommandsAtom,
  commandGroupLabels,
  type Command,
} from '@/atoms/command-palette/registry';
import { keyboardShortcutsModalOpenAtom } from '@/components/layout/modal/KeyboardShortcutsModal';

const iconMap: Record<string, React.ComponentType<{ className?: string; weight?: 'regular' | 'bold' | 'duotone' }>> = {
  Plus,
  GridFour,
  Folder,
  Gear,
  ArrowClockwise,
  Play,
  MagnifyingGlass,
  User,
  TrendUp,
  Star,
  Globe,
  FileImage,
  FileVideo,
  Code,
  Copy,
  Robot,
  PaintBrush,
  Keyboard,
};

export function CommandPalette() {
  const router = useRouter();
  const [state, setState] = useAtom(commandPaletteStateAtom);
  const filteredCommands = useAtomValue(filteredCommandsAtom);
  const [, setShortcutsModalOpen] = useAtom(keyboardShortcutsModalOpenAtom);

  const setOpen = useCallback(
    (open: boolean) => {
      setState((prev) => ({ ...prev, open, query: open ? prev.query : '' }));
    },
    [setState]
  );

  const setQuery = useCallback(
    (query: string) => {
      setState((prev) => ({ ...prev, query }));
    },
    [setState]
  );

  // Execute command action
  const executeCommand = useCallback(
    (command: Command) => {
      setOpen(false);

      // Execute the action
      switch (command.action) {
        // Navigation
        case 'goHome':
          router.push('/');
          break;
        case 'goGallery':
          router.push('/gallery');
          break;
        case 'goCollections':
          router.push('/collections');
          break;
        case 'goSettings':
          router.push('/settings');
          break;
        case 'goSettingsProfile':
          router.push('/settings/profile');
          break;
        case 'goSettingsModels':
          router.push('/settings/models');
          break;
        case 'goSettingsAppearance':
          router.push('/settings/appearance');
          break;

        // Generation
        case 'newGeneration':
          router.push('/');
          break;
        case 'regenerate':
          document.querySelector<HTMLButtonElement>('[data-regenerate-button]')?.click();
          break;
        case 'toggleAnimation':
          document.querySelector<HTMLButtonElement>('[data-play-pause-button]')?.click();
          break;

        // Gallery
        case 'focusSearch':
          router.push('/gallery');
          setTimeout(() => {
            document.querySelector<HTMLInputElement>('[data-search-input]')?.focus();
          }, 100);
          break;
        case 'filterMyArt':
          document.querySelector<HTMLButtonElement>('[data-filter-my-art]')?.click();
          break;
        case 'filterTrending':
          document.querySelector<HTMLButtonElement>('[data-filter-trending]')?.click();
          break;
        case 'filterFeatured':
          document.querySelector<HTMLButtonElement>('[data-filter-featured]')?.click();
          break;
        case 'filterPublic':
          document.querySelector<HTMLButtonElement>('[data-filter-public]')?.click();
          break;

        // Export
        case 'exportGif':
          document.querySelector<HTMLButtonElement>('[data-export-gif]')?.click();
          break;
        case 'exportVideo':
          document.querySelector<HTMLButtonElement>('[data-export-video]')?.click();
          break;
        case 'exportCode':
          document.querySelector<HTMLButtonElement>('[data-export-code]')?.click();
          break;
        case 'copyAscii':
          document.querySelector<HTMLButtonElement>('[data-copy-ascii]')?.click();
          break;

        // Settings
        case 'viewShortcuts':
          setShortcutsModalOpen(true);
          break;
      }
    },
    [router, setOpen, setShortcutsModalOpen]
  );

  // Group commands by their group
  const groupedCommands = filteredCommands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.group]) {
        acc[cmd.group] = [];
      }
      acc[cmd.group].push(cmd);
      return acc;
    },
    {} as Record<string, Command[]>
  );

  return (
    <CommandDialog open={state.open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Type a command or search..."
        value={state.query}
        onValueChange={setQuery}
        data-command-input
      />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>

        {Object.entries(groupedCommands).map(([group, commands]) => (
          <CommandGroup key={group} heading={commandGroupLabels[group as keyof typeof commandGroupLabels]}>
            {commands.map((command) => {
              const Icon = command.icon ? iconMap[command.icon] : null;
              return (
                <CommandItem
                  key={command.id}
                  value={command.label}
                  onSelect={() => executeCommand(command)}
                >
                  {Icon && <Icon className="h-4 w-4" weight="duotone" />}
                  <span>{command.label}</span>
                  {command.shortcut && (
                    <CommandShortcut>{command.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
