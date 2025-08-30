'use client';

import { useUserSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design/components/ui/card';
import { Label } from '@repo/design/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design/components/ui/select';
import { Switch } from '@repo/design/components/ui/switch';

// Prevent static generation for this page as it uses Convex
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const { settings, updateSettings } = useUserSettings();

  if (!settings) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-accent rounded w-32"></div>
          <div className="h-20 bg-accent rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-medium mb-2">General Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your ASCII art generation preferences and account settings.
        </p>
      </div>

      {/* General Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select 
              value={settings.theme} 
              onValueChange={(value: 'light' | 'dark' | 'system') => 
                updateSettings({ theme: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-visibility">Default Visibility</Label>
            <Select 
              value={settings.defaultVisibility} 
              onValueChange={(value: 'public' | 'private') => 
                updateSettings({ defaultVisibility: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your ASCII art and platform news.
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => 
                updateSettings({ emailNotifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Configure your AI model API keys for ASCII generation.
          </p>
          {settings.apiKeys && settings.apiKeys.length > 0 ? (
            <div className="space-y-2">
              {settings.apiKeys.map((key: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="text-sm font-medium">{key.name}</div>
                    <div className="text-xs text-muted-foreground">{key.provider}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {key.key.substring(0, 8)}...
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No API keys configured. You can add them in the Models section.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}