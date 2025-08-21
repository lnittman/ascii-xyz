'use client';

import { Desktop, Moon, Sun } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';

import { Label } from '@repo/design/components/ui/label';
import { cn } from '@repo/design/lib/utils';

export function AppearanceTab() {
  const { resolvedTheme, theme, setTheme: setNextTheme } = useTheme();

  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      icon: Sun,
      description: 'A clean, bright interface',
      prompt: 'describe a forest at sunrise',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes in low light',
      prompt: 'describe a desert at midnight',
    },
    {
      value: 'system',
      label: 'System',
      icon: Desktop,
      description: 'Adapts to your system preference',
      prompt: 'follow the light wherever it leads',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-foreground text-lg">Color mode</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Choose how Arbor looks to you
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setNextTheme(option.value)}
                className={cn(
                  'relative w-full rounded-none border p-4 text-left transition-all duration-200',
                  'hover:border-border focus:outline-none focus:ring-2 focus:ring-primary/20',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 hover:border-border'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-none border transition-colors',
                      isSelected
                        ? 'border-primary/20 bg-primary/10 text-primary'
                        : 'border-border/50 bg-muted/30 text-muted-foreground'
                    )}
                  >
                    <Icon weight="duotone" className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium text-foreground text-sm">
                        {option.label}
                      </Label>
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>

                    {/* PromptBar Demo */}
                    <div className="pointer-events-none mt-4 origin-left scale-75">
                      {option.value === 'system' ? (
                        // Split system theme demo
                        <div className="flex overflow-hidden rounded-none border border-border/50">
                          <div className="flex-1 bg-white dark:bg-zinc-950">
                            <div className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                              {option.prompt}
                            </div>
                          </div>
                          <div className="flex-1 bg-zinc-950 dark:bg-white">
                            <div className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-600">
                              {option.prompt}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Regular theme demos
                        <div
                          className={cn(
                            'rounded-none border px-3 py-2',
                            option.value === 'light'
                              ? 'border-zinc-200 bg-white'
                              : 'border-zinc-800 bg-zinc-950'
                          )}
                        >
                          <div
                            className={cn(
                              'text-xs',
                              option.value === 'light'
                                ? 'text-zinc-600'
                                : 'text-zinc-400'
                            )}
                          >
                            {option.prompt}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-primary">
                      <div className="h-1.5 w-1.5 rounded-full bg-background" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat font section */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-foreground text-lg">Chat font</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Choose how text appears in conversations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              id: 'default',
              name: 'Default',
              preview: 'Aa',
              description: 'System font',
              fontClass: '',
            },
            {
              id: 'system',
              name: 'Match system',
              preview: 'Aa',
              description: 'Your system font',
              fontClass: 'font-system',
            },
            {
              id: 'dyslexic',
              name: 'Dyslexic friendly',
              preview: 'Aa',
              description: 'OpenDyslexic font',
              fontClass: 'font-dyslexic',
            },
          ].map((font, index) => {
            const isSelected = index === 0; // Default selected for demo

            return (
              <button
                key={font.id}
                className={cn(
                  'relative rounded-none border p-4 text-center transition-all duration-200',
                  'hover:border-border focus:outline-none focus:ring-2 focus:ring-primary/20',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 hover:border-border'
                )}
              >
                <div className="space-y-3">
                  {/* Font preview */}
                  <div
                    className={cn(
                      'font-medium text-3xl text-foreground transition-colors',
                      font.fontClass
                    )}
                  >
                    {font.preview}
                  </div>

                  {/* Font info */}
                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <Label className="font-medium text-foreground text-sm">
                        {font.name}
                      </Label>
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {font.description}
                    </p>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-primary">
                      <div className="h-1.5 w-1.5 rounded-full bg-background" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
