'use client';

import { useMutation } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';

export function useToggleModelEnabled() {
  const toggle = useMutation(api.functions.settings.toggleModel);
  return {
    toggleModel: async (args: {
      provider: 'openai' | 'anthropic' | 'google' | 'openrouter';
      modelId: string;
      enabled: boolean;
    }) => {
      try {
        await toggle(args);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
  };
}

export function useUpdateSettings() {
  const update = useMutation(api.functions.settings.update);
  return async (args: any) => {
    try {
      await update(args);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };
}