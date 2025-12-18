'use client';

import { atom, useAtom } from 'jotai';
import { Keyboard, X } from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@repo/design/components/ui/dialog';
import { defaultShortcuts, shortcutGroups, getShortcutsByGroup } from '@/lib/keyboard/default-shortcuts';
import { formatShortcut } from '@/atoms/keyboard/shortcuts';
import { cn } from '@repo/design/lib/utils';

export const keyboardShortcutsModalOpenAtom = atom(false);

export function KeyboardShortcutsModal() {
  const [open, setOpen] = useAtom(keyboardShortcutsModalOpenAtom);
  const groupedShortcuts = getShortcutsByGroup(defaultShortcuts);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-sm font-medium">
            <Keyboard className="h-4 w-4" weight="duotone" />
            keyboard shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <div className="space-y-6 py-2">
            {/* Leader key hint */}
            <div className="bg-muted/50 border border-border/50 rounded-sm p-3">
              <div className="flex items-center gap-2 mb-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono">
                  Space
                </kbd>
                <span className="text-xs text-muted-foreground">leader key</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Press Space to activate leader mode, then press the shortcut key within 2 seconds.
                Shortcuts marked with <span className="text-primary">*</span> require leader mode.
              </p>
            </div>

            {/* Shortcut groups */}
            {Object.entries(shortcutGroups).map(([groupKey, groupLabel]) => {
              const shortcuts = groupedShortcuts[groupKey];
              if (!shortcuts || shortcuts.length === 0) return null;

              return (
                <div key={groupKey}>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {groupLabel}
                  </h3>
                  <div className="space-y-1">
                    {shortcuts.map((shortcut) => (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between py-1.5 px-2 rounded-sm hover:bg-muted/50 transition-colors duration-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs">
                            {shortcut.label}
                            {shortcut.requiresLeader && (
                              <span className="text-primary ml-0.5">*</span>
                            )}
                          </span>
                        </div>
                        <ShortcutDisplay trigger={shortcut.trigger} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutDisplay({ trigger }: { trigger: Parameters<typeof formatShortcut>[0] }) {
  const formatted = formatShortcut(trigger);
  const parts = formatted.split(' → ');

  return (
    <div className="flex items-center gap-1">
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-0.5">
          {i > 0 && <span className="text-muted-foreground text-xs mx-0.5">→</span>}
          <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono min-w-[20px] text-center">
            {part}
          </kbd>
        </span>
      ))}
    </div>
  );
}
