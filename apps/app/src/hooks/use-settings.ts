"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";

// Hook to get user settings
export function useUserSettings() {
  const settings = useQuery(api.settings.get);
  const updateSettingsMutation = useMutation(api.settings.update);
  const addKeyMutation = useMutation(api.settings.addApiKey);
  const removeKeyMutation = useMutation(api.settings.removeApiKey);
  
  const updateSettings = async (updates: {
    theme?: 'light' | 'dark' | 'system';
    defaultVisibility?: 'public' | 'private';
    emailNotifications?: boolean;
    preferredModel?: string;
    preferredProvider?: string;
  }) => {
    await updateSettingsMutation(updates);
  };

  const addApiKey = async (keyData: { name: string; key: string; provider: string }) => {
    await addKeyMutation(keyData);
  };
  
  const removeApiKey = async (name: string) => {
    await removeKeyMutation({ name });
  };

  return {
    settings,
    updateSettings,
    addApiKey,
    removeApiKey,
  };
}

// Hook to manage API keys
export function useApiKeys() {
  const addKeyMutation = useMutation(api.settings.addApiKey);
  const removeKeyMutation = useMutation(api.settings.removeApiKey);
  
  const addApiKey = async (name: string, key: string, provider: string) => {
    await addKeyMutation({ name, key, provider });
  };
  
  const removeApiKey = async (name: string) => {
    await removeKeyMutation({ name });
  };
  
  return {
    addApiKey,
    removeApiKey,
  };
}