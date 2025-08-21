'use client';

import {
  toggleModelEnabledAction,
  updateAISettings,
  updateAppearanceSettings,
  updateDataSettings,
  updateNotificationSettings,
  updateProfileSettings,
  verifyApiKeyAction,
} from '@repo/orpc/actions';
import { invokeServerAction } from '@repo/orpc/server-action-wrapper';
import { mutate } from 'swr';

// AI Settings Mutations
export function useUpdateAISettings() {
  const updateSettings = async (
    data: Parameters<typeof updateAISettings>[0]
  ) => {
    const result = await invokeServerAction(updateAISettings, data);

    // Invalidate AI settings cache
    await mutate('/api/settings/ai');

    return result;
  };

  return { updateAISettings: updateSettings };
}

export function useToggleModelEnabled() {
  const toggleModel = async (arg: {
    provider: 'openai' | 'anthropic' | 'google' | 'openrouter';
    modelId: string;
    enabled: boolean;
  }) => {
    const result = await invokeServerAction(toggleModelEnabledAction, {
      provider: arg.provider,
      modelId: arg.modelId,
      enabled: arg.enabled,
    });

    // Invalidate AI settings and models cache
    await mutate('/api/settings/ai');
    await mutate('/api/models');

    return { success: true, data: result };
  };

  return { toggleModel };
}

export function useVerifyApiKey() {
  const verifyKey = async (provider: string, apiKey: string) => {
    const result = await invokeServerAction(verifyApiKeyAction, {
      provider,
      apiKey,
    });
    return result;
  };

  return { verifyApiKey: verifyKey };
}

// Data Settings Mutations
export function useUpdateDataSettings() {
  const updateSettings = async (
    data: Parameters<typeof updateDataSettings>[0]
  ) => {
    const result = await invokeServerAction(updateDataSettings, data);

    // Invalidate data settings cache
    await mutate('/api/settings/data');

    return result;
  };

  return { updateDataSettings: updateSettings };
}

// Appearance Settings Mutations
export function useUpdateAppearanceSettings() {
  const updateSettings = async (
    data: Parameters<typeof updateAppearanceSettings>[0]
  ) => {
    const result = await invokeServerAction(updateAppearanceSettings, data);

    // Invalidate appearance settings cache
    await mutate('/api/settings/appearance');

    return result;
  };

  return { updateAppearanceSettings: updateSettings };
}

// Notification Settings Mutations
export function useUpdateNotificationSettings() {
  const updateSettings = async (
    data: Parameters<typeof updateNotificationSettings>[0]
  ) => {
    const result = await invokeServerAction(updateNotificationSettings, data);

    // Invalidate notification settings cache
    await mutate('/api/settings/notification');

    return result;
  };

  return { updateNotificationSettings: updateSettings };
}

// Profile Settings Mutations
export function useUpdateProfileSettings() {
  const updateSettings = async (
    data: Parameters<typeof updateProfileSettings>[0]
  ) => {
    const result = await invokeServerAction(updateProfileSettings, data);

    // Invalidate profile settings cache
    await mutate('/api/settings/profile');

    return result;
  };

  return { updateProfileSettings: updateSettings };
}
