'use client';

import {
  useAISettings,
  useUpdateAISettings,
} from '@/hooks/settings/use-ai-settings';
import { Input } from '@repo/design/components/ui/input';
import { Textarea } from '@repo/design/components/ui/textarea';
import { useEffect, useState } from 'react';

export function GeneralTab() {
  const { settings, isLoading } = useAISettings();

  const { updateAISettings } = useUpdateAISettings();

  const [customInstructions, setCustomInstructions] = useState(
    'DO NOT run any tests, linting, or formatting unless I explicitly ask'
  );
  const [branchFormat, setBranchFormat] = useState('arbor/{feature}');

  // Load settings when available
  useEffect(() => {
    if (settings) {
      setCustomInstructions(
        settings.customInstructions ||
          'DO NOT run any tests, linting, or formatting unless I explicitly ask'
      );
      setBranchFormat(settings.branchFormat || 'arbor/{feature}');
    }
  }, [settings]);

  const handleSaveInstructions = async () => {
    await updateAISettings({ customInstructions });
  };

  const handleSaveBranchFormat = async () => {
    await updateAISettings({ branchFormat });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-1/4 rounded-none bg-muted" />
          <div className="h-32 rounded-none bg-muted" />
        </div>
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-1/4 rounded-none bg-muted" />
          <div className="h-10 rounded-none bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Custom instructions */}
      <div>
        <label className="mb-2 block font-medium text-foreground text-sm">
          custom instructions
        </label>
        <Textarea
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          onBlur={handleSaveInstructions}
          className="min-h-[120px] rounded-none"
          placeholder="enter custom instructions for arbor code..."
        />
        <p className="mt-2 text-muted-foreground text-sm">
          custom instructions are used to customize the behavior of arbor code.
        </p>
      </div>

      {/* Branch format */}
      <div>
        <label className="mb-2 block font-medium text-foreground text-sm">
          branch format
        </label>
        <Input
          value={branchFormat}
          onChange={(e) => setBranchFormat(e.target.value)}
          onBlur={handleSaveBranchFormat}
          className="rounded-none"
          placeholder="arbor/{feature}"
        />
        <p className="mt-2 text-muted-foreground text-sm">
          example: arbor/unit-tests-for-feature
          <br />
          tags available: {'{feature}'}, {'{date}'}, {'{time}'}
        </p>
      </div>
    </div>
  );
}
