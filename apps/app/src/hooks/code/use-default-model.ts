'use client';

import { useAISettings } from '@/hooks/settings/use-ai-settings';
import { useModels } from './use-models';

export function useDefaultModel() {
  const { enabledModels } = useModels();
  const { settings } = useAISettings();

  // Get the default model from settings
  const defaultModelId = settings?.defaultModelId;
  const defaultModel = enabledModels.find(
    (model) => model.id === defaultModelId
  );

  // Get the first enabled model as fallback if no default is set
  const fallbackModel = enabledModels.length > 0 ? enabledModels[0] : null;

  // Return the default model or fallback
  const effectiveDefaultModel = defaultModel || fallbackModel;

  return {
    defaultModelId,
    defaultModel,
    fallbackModel,
    effectiveDefaultModel,
    hasDefaultModel: !!defaultModel,
    hasEnabledModels: enabledModels.length > 0,
  };
}
