'use client';

import {
  CaretDown,
  CaretUp,
  Check,
  Sliders,
} from '@phosphor-icons/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { Button } from '@repo/design/components/ui/button';
import { cn } from '@repo/design/lib/utils';
import { useSystemPresets, useUserPresets } from '@/hooks/use-ascii';
import type { Doc, Id } from '@repo/backend/convex/_generated/dataModel';

type Preset = Doc<'presets'>;

interface PresetPickerProps {
  selectedPresetId?: Id<'presets'>;
  onSelect: (preset: Preset) => void;
  userId?: Id<'users'>;
  disabled?: boolean;
  className?: string;
}

export function PresetPicker({
  selectedPresetId,
  onSelect,
  userId,
  disabled = false,
  className,
}: PresetPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const systemPresetsState = useSystemPresets();
  const userPresetsState = useUserPresets(userId);

  const systemPresets = systemPresetsState.data ?? [];
  const userPresets = userPresetsState.data ?? [];
  const isLoading = systemPresetsState.status === 'loading';

  // Find selected preset
  const selectedPreset = [...systemPresets, ...userPresets].find(
    (p) => p._id === selectedPresetId
  );

  const displayText = selectedPreset?.name ?? 'Select Preset';

  const handleSelect = (preset: Preset) => {
    onSelect(preset);
    setIsOpen(false);
  };

  return (
    <DropdownMenuPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'relative flex h-10 w-48 select-none items-center gap-2 overflow-hidden',
            'rounded-md border border-border/50 px-3 py-2',
            'font-mono text-xs uppercase tracking-wider',
            'transition-all duration-200',
            'hover:border-border hover:bg-muted/50',
            isOpen && 'border-border bg-muted/50',
            disabled && 'pointer-events-none opacity-50',
            className
          )}
          disabled={disabled}
        >
          <Sliders className="h-4 w-4 text-muted-foreground" />
          <div className="relative flex-1 overflow-hidden">
            <span
              className={cn(
                'block whitespace-nowrap text-left',
                selectedPreset ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {displayText}
            </span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.div
                key="up"
                initial={{ opacity: 0, rotate: 180 }}
                animate={{ opacity: 1, rotate: 180 }}
                exit={{ opacity: 0, rotate: 0 }}
                transition={{ duration: 0.15 }}
              >
                <CaretUp className="h-3 w-3 text-muted-foreground" />
              </motion.div>
            ) : (
              <motion.div
                key="down"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
                transition={{ duration: 0.15 }}
              >
                <CaretDown className="h-3 w-3 text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuPrimitive.Trigger>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenuPrimitive.Portal forceMount>
            <DropdownMenuPrimitive.Content
              asChild
              side="bottom"
              align="start"
              alignOffset={0}
              sideOffset={4}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
              }}
            >
              <motion.div
                className="z-[500] flex w-72 flex-col overflow-hidden rounded-md border border-border bg-background shadow-lg"
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{
                  duration: 0.2,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                {/* System Presets */}
                {systemPresets.length > 0 && (
                  <div className="max-h-64 overflow-y-auto">
                    <div className="sticky top-0 z-10 border-b border-border/30 bg-background/95 px-3 py-2 backdrop-blur-sm">
                      <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        System Presets
                      </h3>
                    </div>
                    {systemPresets.map((preset) => (
                      <PresetItem
                        key={preset._id}
                        preset={preset}
                        isSelected={preset._id === selectedPresetId}
                        onSelect={() => handleSelect(preset)}
                      />
                    ))}
                  </div>
                )}

                {/* User Presets */}
                {userPresets.length > 0 && (
                  <div className="max-h-64 overflow-y-auto border-t border-border/50">
                    <div className="sticky top-0 z-10 border-b border-border/30 bg-background/95 px-3 py-2 backdrop-blur-sm">
                      <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        My Presets
                      </h3>
                    </div>
                    {userPresets.map((preset) => (
                      <PresetItem
                        key={preset._id}
                        preset={preset}
                        isSelected={preset._id === selectedPresetId}
                        onSelect={() => handleSelect(preset)}
                      />
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {systemPresets.length === 0 && userPresets.length === 0 && !isLoading && (
                  <div className="flex h-32 items-center justify-center">
                    <p className="font-mono text-xs text-muted-foreground">
                      NO PRESETS AVAILABLE
                    </p>
                  </div>
                )}

                {/* Loading state */}
                {isLoading && (
                  <div className="flex h-32 items-center justify-center">
                    <p className="font-mono text-xs text-muted-foreground">
                      LOADING...
                    </p>
                  </div>
                )}
              </motion.div>
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        )}
      </AnimatePresence>
    </DropdownMenuPrimitive.Root>
  );
}

interface PresetItemProps {
  preset: Preset;
  isSelected: boolean;
  onSelect: () => void;
}

function PresetItem({ preset, isSelected, onSelect }: PresetItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'group relative mx-1 flex cursor-pointer select-none items-center rounded-sm px-3 py-2.5',
        'text-sm outline-none transition-colors',
        'hover:bg-muted hover:text-foreground',
        'focus:bg-muted focus:text-foreground'
      )}
      onSelect={(e) => {
        e.preventDefault();
        onSelect();
      }}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-mono text-xs font-medium">{preset.name}</div>
          {preset.description && (
            <div className="font-mono text-[10px] text-muted-foreground truncate">
              {preset.description}
            </div>
          )}
          <div className="font-mono text-[10px] text-muted-foreground/70 mt-0.5">
            {preset.settings.width}×{preset.settings.height} · {preset.settings.fps}fps
          </div>
        </div>

        {/* Check icon */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="h-4 w-4 text-green-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DropdownMenuPrimitive.Item>
  );
}
