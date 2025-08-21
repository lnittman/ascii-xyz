/**
 * Utility functions for handling AI model configurations
 */

export type ModelProviderMap = {
  openai: string[];
  anthropic: string[];
  google: string[];
  openrouter: string[];
};

/**
 * Convert legacy flat array format to new provider-based object format
 */
export function normalizeEnabledModels(
  enabledModels: string[] | ModelProviderMap | unknown
): ModelProviderMap {
  if (!enabledModels) {
    return {
      openai: [],
      anthropic: [],
      google: [],
      openrouter: [],
    };
  }

  // Handle unknown type from JSON columns
  if (Array.isArray(enabledModels)) {
    // Legacy flat array format
    const flatArray = enabledModels as string[];
    return {
      openai: flatArray.filter(
        (id) => id.startsWith('gpt-') || id.includes('openai')
      ),
      anthropic: flatArray.filter(
        (id) => id.startsWith('claude-') || id.includes('anthropic')
      ),
      google: flatArray.filter(
        (id) => id.startsWith('gemini-') || id.includes('google')
      ),
      openrouter: flatArray.filter(
        (id) =>
          id.includes('/') &&
          !id.includes('openai') &&
          !id.includes('anthropic') &&
          !id.includes('google')
      ),
    };
  }

  // New format - ensure all keys exist
  const modelsObj = enabledModels as Partial<ModelProviderMap>;
  return {
    openai: modelsObj.openai || [],
    anthropic: modelsObj.anthropic || [],
    google: modelsObj.google || [],
    openrouter: modelsObj.openrouter || [],
  };
}

/**
 * Get enabled models for a specific provider
 */
export function getEnabledModelsForProvider(
  enabledModels: string[] | ModelProviderMap | unknown,
  providerId: string | null
): string[] {
  if (!enabledModels || !providerId) {
    return [];
  }

  const normalized = normalizeEnabledModels(enabledModels);
  return normalized[providerId as keyof ModelProviderMap] || [];
}

/**
 * Toggle a model's enabled state for a provider
 */
export function toggleModelInProvider(
  enabledModels: string[] | ModelProviderMap | unknown,
  providerId: string,
  modelId: string,
  enabled: boolean
): ModelProviderMap {
  const normalized = normalizeEnabledModels(enabledModels);
  const currentModels = normalized[providerId as keyof ModelProviderMap] || [];

  return {
    ...normalized,
    [providerId]: enabled
      ? [...currentModels.filter((id) => id !== modelId), modelId]
      : currentModels.filter((id) => id !== modelId),
  };
}
