'use client';

import { Download, Trash } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

import {
  useAISettings,
  useUpdateAISettings,
} from '@/hooks/settings/use-ai-settings';
import type { AISettings } from '@repo/database/types';
import { Button } from '@repo/design/components/ui/button';
import { Switch } from '@repo/design/components/ui/switch';

interface DataTabProps {
  initialSettings?: AISettings;
}

export function DataTab({ initialSettings }: DataTabProps) {
  const { settings, isLoading } = useAISettings(initialSettings);

  const { updateAISettings } = useUpdateAISettings();

  const [allowTraining, setAllowTraining] = useState(true);

  // Load settings when available
  useEffect(() => {
    if (settings) {
      setAllowTraining(settings.allowTraining);
    }
  }, [settings]);

  const handleTrainingToggle = async (checked: boolean) => {
    setAllowTraining(checked);
    await updateAISettings({ allowTraining: checked });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-1/4 rounded-none bg-muted" />
          <div className="h-20 rounded-none bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model improvement */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between rounded-none border border-border/20 p-4">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-3">
                <span className="font-medium text-foreground text-sm">
                  allow training on your content
                </span>
                <Switch
                  checked={allowTraining}
                  onCheckedChange={handleTrainingToggle}
                />
              </div>
              <p className="text-muted-foreground text-sm">
                allow your arbor code tasks and environments to be used to help
                improve our models. this will only include repos you've linked
                to an environment and for which you're an admin. we take steps
                to protect your privacy.{' '}
                <a href="#" className="text-primary hover:underline">
                  learn more.
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data export */}
      <div className="space-y-4">
        <div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start rounded-none"
            >
              <Download className="mr-2 h-4 w-4" weight="duotone" />
              export workspaces
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start rounded-none"
            >
              <Download className="mr-2 h-4 w-4" weight="duotone" />
              export tasks
            </Button>
          </div>
        </div>
      </div>

      {/* Delete data */}
      <div className="space-y-4">
        <div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start rounded-none border-red-500/20 text-red-500/70 transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash className="mr-2 h-4 w-4" weight="duotone" />
              delete all workspaces
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start rounded-none border-red-500/20 text-red-500/70 transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash className="mr-2 h-4 w-4" weight="duotone" />
              delete all tasks
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start rounded-none border-red-500/20 text-red-500/70 transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash className="mr-2 h-4 w-4" weight="duotone" />
              delete account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
