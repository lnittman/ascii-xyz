'use client';

import { useAtom } from 'jotai';

import { Button } from '@repo/design/components/ui/button';
import { Label } from '@repo/design/components/ui/label';
import { Switch } from '@repo/design/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@repo/design/components/ui/tabs';

import { userPreferencesAtom } from '@/atoms/user';

export function CustomizeTab() {
  const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);

  const updatePreference = (key: keyof typeof userPreferences, value: any) => {
    setUserPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-4">
      {/* Display Options */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground text-sm">display options</h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-timestamps" className="text-foreground">
                Show timestamps
              </Label>
              <p className="text-muted-foreground text-xs">
                Display time indicators in chat messages
              </p>
            </div>
            <Switch
              id="show-timestamps"
              checked={userPreferences.showTimestamps}
              onCheckedChange={(checked) =>
                updatePreference('showTimestamps', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode" className="text-foreground">
                Compact mode
              </Label>
              <p className="text-muted-foreground text-xs">
                Reduce spacing between elements for a denser interface
              </p>
            </div>
            <Switch
              id="compact-mode"
              checked={userPreferences.compactView}
              onCheckedChange={(checked) =>
                updatePreference('compactView', checked)
              }
            />
          </div>
        </div>
      </div>

      {/* Code Display */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground text-sm">Code display</h4>

        <Tabs defaultValue="default" className="w-full">
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-foreground text-sm">
              Syntax highlight theme
            </Label>
            <TabsList className="relative h-8 w-fit gap-1 rounded-none bg-accent/30 p-1">
              <TabsTrigger
                value="default"
                className="z-10 flex h-full items-center justify-center rounded-none px-3 text-foreground text-xs transition-all duration-300 hover:bg-background/60 focus:outline-none data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Default
              </TabsTrigger>
              <TabsTrigger
                value="minimal"
                className="z-10 flex h-full items-center justify-center rounded-none px-3 text-foreground text-xs transition-all duration-300 hover:bg-background/60 focus:outline-none data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Minimal
              </TabsTrigger>
              <TabsTrigger
                value="vibrant"
                className="z-10 flex h-full items-center justify-center rounded-none px-3 text-foreground text-xs transition-all duration-300 hover:bg-background/60 focus:outline-none data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Vibrant
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="rounded-none border border-border/40 bg-muted/20 p-4">
            <pre className="overflow-x-auto text-muted-foreground text-xs">
              <code>{`function hello() {
  console.log("Hello world!");
  return 42;
}

// This is a sample code snippet
const result = hello();`}</code>
            </pre>
          </div>
        </Tabs>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() =>
            setUserPreferences({
              showTimestamps: true,
              compactView: false,
              hideSharedWarning: false,
            })
          }
          className="text-foreground"
        >
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}
