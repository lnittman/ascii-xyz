'use client';

import { useState, useEffect } from 'react';
import { Label } from '@repo/design/components/ui/label';
import { Switch } from '@repo/design/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@repo/design/components/ui/radio-group';
import { 
  Sun,
  Moon,
  Desktop,
  Palette,
  TextT,
  Sliders
} from '@phosphor-icons/react';
import { cn } from '@repo/design/lib/utils';
import { useTheme } from 'next-themes';

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [monoFont, setMonoFont] = useState('default');

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-mono text-lg font-semibold uppercase tracking-wider">
          APPEARANCE
        </h2>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          CUSTOMIZE THE LOOK AND FEEL OF THE INTERFACE
        </p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-4">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          THEME
        </h3>
        
        <RadioGroup value={theme} onValueChange={setTheme}>
          <div className="grid gap-3">
            {[
              { value: 'light', label: 'LIGHT', icon: Sun, description: 'BRIGHT INTERFACE FOR DAYTIME USE' },
              { value: 'dark', label: 'DARK', icon: Moon, description: 'DARK INTERFACE FOR NIGHT TIME' },
              { value: 'system', label: 'SYSTEM', icon: Desktop, description: 'FOLLOWS YOUR SYSTEM PREFERENCES' },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-center gap-4 rounded-md border p-4 cursor-pointer',
                    'transition-all duration-200',
                    theme === option.value
                      ? 'border-foreground bg-muted/50'
                      : 'border-border/50 hover:border-border hover:bg-muted/30'
                  )}
                >
                  <RadioGroupItem value={option.value} className="sr-only" />
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-mono text-xs font-medium uppercase tracking-wider">
                      {option.label}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                  {theme === option.value && (
                    <div className="h-2 w-2 rounded-full bg-foreground" />
                  )}
                </label>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* Typography */}
      <div className="space-y-4 border-t border-border/50 pt-8">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          TYPOGRAPHY
        </h3>

        {/* Font Size */}
        <div className="space-y-3">
          <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            ASCII FONT SIZE
          </Label>
          <RadioGroup value={fontSize} onValueChange={setFontSize}>
            <div className="flex gap-2">
              {[
                { value: 'small', label: 'S' },
                { value: 'medium', label: 'M' },
                { value: 'large', label: 'L' },
                { value: 'xlarge', label: 'XL' },
              ].map((size) => (
                <label
                  key={size.value}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-md border cursor-pointer',
                    'font-mono text-xs font-medium transition-all duration-200',
                    fontSize === size.value
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border/50 hover:border-border hover:bg-muted/30'
                  )}
                >
                  <RadioGroupItem value={size.value} className="sr-only" />
                  {size.label}
                </label>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Monospace Font */}
        <div className="space-y-3">
          <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            MONOSPACE FONT
          </Label>
          <RadioGroup value={monoFont} onValueChange={setMonoFont}>
            <div className="space-y-2">
              {[
                { value: 'default', label: 'SYSTEM DEFAULT', sample: 'ABC123 @#$%' },
                { value: 'cascadia', label: 'CASCADIA CODE', sample: 'ABC123 @#$%' },
                { value: 'fira', label: 'FIRA CODE', sample: 'ABC123 @#$%' },
                { value: 'jetbrains', label: 'JETBRAINS MONO', sample: 'ABC123 @#$%' },
              ].map((font) => (
                <label
                  key={font.value}
                  className={cn(
                    'flex items-center justify-between rounded-md border px-4 py-3 cursor-pointer',
                    'transition-all duration-200',
                    monoFont === font.value
                      ? 'border-foreground bg-muted/50'
                      : 'border-border/50 hover:border-border hover:bg-muted/30'
                  )}
                >
                  <RadioGroupItem value={font.value} className="sr-only" />
                  <div>
                    <div className="font-mono text-xs font-medium uppercase tracking-wider">
                      {font.label}
                    </div>
                    <div className="mt-1 font-mono text-xs text-muted-foreground">
                      {font.sample}
                    </div>
                  </div>
                  {monoFont === font.value && (
                    <div className="h-2 w-2 rounded-full bg-foreground" />
                  )}
                </label>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Accessibility */}
      <div className="space-y-4 border-t border-border/50 pt-8">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          ACCESSIBILITY
        </h3>

        <div className="space-y-3">
          {/* High Contrast */}
          <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
            <div className="flex items-center gap-3">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="high-contrast"
                  className="font-mono text-xs uppercase tracking-wider"
                >
                  HIGH CONTRAST
                </Label>
                <p className="font-mono text-[10px] text-muted-foreground">
                  INCREASE CONTRAST FOR BETTER VISIBILITY
                </p>
              </div>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
            <div className="flex items-center gap-3">
              <Sliders className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="reduce-motion"
                  className="font-mono text-xs uppercase tracking-wider"
                >
                  REDUCE MOTION
                </Label>
                <p className="font-mono text-[10px] text-muted-foreground">
                  MINIMIZE ANIMATIONS AND TRANSITIONS
                </p>
              </div>
            </div>
            <Switch
              id="reduce-motion"
              checked={reduceMotion}
              onCheckedChange={setReduceMotion}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4 border-t border-border/50 pt-8">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          PREVIEW
        </h3>
        
        <div className="rounded-md border border-border bg-muted/30 p-6">
          <pre className={cn(
            'font-mono whitespace-pre text-foreground',
            fontSize === 'small' && 'text-xs',
            fontSize === 'medium' && 'text-sm',
            fontSize === 'large' && 'text-base',
            fontSize === 'xlarge' && 'text-lg'
          )}>
{`    ___   _____ _____ _____ _____ 
   / _ \\ /  ___/  __ \\_   _|_   _|
  / /_\\ \\\\ \`--. | /  \\/ | |   | |  
  |  _  | \`--. \\| |    | |   | |  
  | | | |/\\__/ /| \\__/\\| |_ _| |_ 
  \\_| |_/\\____/  \\____/\\___/ \\___/ 
                                  
  ASCII ART GENERATOR PLATFORM`}
          </pre>
        </div>
        
        <p className="font-mono text-[10px] text-muted-foreground">
          THIS IS HOW ASCII ART WILL APPEAR WITH YOUR CURRENT SETTINGS
        </p>
      </div>
    </div>
  );
}