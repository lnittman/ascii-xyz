"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useUser } from "@repo/auth/client";

export interface AISettings {
  id: string;
  userId: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  openrouterApiKey?: string;
  enabledModels?: Record<string, string[]>;
  defaultModel?: string;
  defaultProvider?: string;
}

export function useAISettings() {
  const { user } = useUser();
  // The settings.get query doesn't take arguments - it uses auth internally
  const settings = useQuery(
    api.functions.settings.get,
    user?.id ? {} : "skip"
  );

  const refresh = () => {
    // Query will auto-refresh
  };

  return {
    settings: settings as AISettings | undefined,
    isLoading: settings === undefined && user?.id !== undefined,
    refresh,
  };
}