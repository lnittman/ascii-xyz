"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";

// Hook to get user settings
export function useUserSettings() {
  const settings = useQuery(api.functions.settings.get);
  const updateSettingsMutation = useMutation(api.functions.settings.update);
  const toggleModelMutation = useMutation(api.functions.settings.toggleModel);
  const verifyApiKeyMutation = useMutation(api.functions.settings.verifyApiKey);
  
  const updateSettings = async (updates: {
    theme?: 'light' | 'dark' | 'system';
    defaultVisibility?: 'public' | 'private';
    emailNotifications?: boolean;
    openrouterApiKey?: string;
    openaiApiKey?: string;
    anthropicApiKey?: string;
    googleApiKey?: string;
    enabledModels?: any;
    defaultModelId?: string;
  }) => {
    await updateSettingsMutation(updates);
  };

  const toggleModel = async (provider: string, modelId: string, enabled: boolean) => {
    await toggleModelMutation({ provider, modelId, enabled });
  };
  
  const verifyApiKey = async (provider: string, apiKey: string) => {
    return await verifyApiKeyMutation({ provider, apiKey });
  };

  return {
    settings,
    updateSettings,
    toggleModel,
    verifyApiKey,
  };
}