"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { QueryState } from "./use-ascii";

// Settings result type from the query (can be Doc or default object)
export type SettingsResult = {
  userId: unknown;
  theme: "light" | "dark" | "system";
  defaultVisibility: "public" | "private";
  emailNotifications: boolean;
  openrouterApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  enabledModels?: Record<string, string[]>;
  defaultModelId?: string;
  updatedAt?: string;
  _id?: unknown;
  _creationTime?: number;
};

// Helper to create query state for settings (handles null and undefined)
function createSettingsQueryState(result: SettingsResult | null | undefined): QueryState<SettingsResult | null> {
  if (result === undefined) {
    return { status: "loading", data: undefined };
  }
  if (result === null) {
    return { status: "empty", data: null };
  }
  return { status: "ready", data: result };
}

// Settings update type
export interface SettingsUpdate {
  theme?: 'light' | 'dark' | 'system';
  defaultVisibility?: 'public' | 'private';
  emailNotifications?: boolean;
  openrouterApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  enabledModels?: Record<string, boolean>;
  defaultModelId?: string;
}

// Hook return type
export interface UseUserSettingsReturn {
  settingsState: QueryState<SettingsResult | null>;
  updateSettings: (updates: SettingsUpdate) => Promise<void>;
  toggleModel: (provider: string, modelId: string, enabled: boolean) => Promise<void>;
  verifyApiKey: (provider: string, apiKey: string) => Promise<{ valid: boolean }>;
}

// Hook to get user settings
export function useUserSettings(): UseUserSettingsReturn {
  const settings = useQuery(api.functions.settings.get);
  const updateSettingsMutation = useMutation(api.functions.settings.update);
  const toggleModelMutation = useMutation(api.functions.settings.toggleModel);
  const verifyApiKeyMutation = useMutation(api.functions.settings.verifyApiKey);

  const settingsState = createSettingsQueryState(settings);

  const updateSettings = async (updates: SettingsUpdate) => {
    await updateSettingsMutation(updates);
  };

  const toggleModel = async (provider: string, modelId: string, enabled: boolean) => {
    await toggleModelMutation({ provider, modelId, enabled });
  };

  const verifyApiKey = async (provider: string, apiKey: string) => {
    return await verifyApiKeyMutation({ provider, apiKey });
  };

  return {
    settingsState,
    updateSettings,
    toggleModel,
    verifyApiKey,
  };
}
