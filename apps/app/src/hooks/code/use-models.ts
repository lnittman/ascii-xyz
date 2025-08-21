'use client';

import { initialModelsAtom } from '@/atoms/models';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import useSWR from 'swr';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  context_length?: number;
  pricing?: {
    input: number;
    output: number;
  };
  capabilities?: string[];
  enabled?: boolean;
  description?: string;
}

interface ModelProvider {
  id: string;
  name: string;
  description?: string;
  models: AIModel[];
}

interface ModelsResponse {
  providers: ModelProvider[];
  total_models: number;
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<ModelsResponse> => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch models: ${response.status} ${errorText}`);
  }

  const apiResponse = await response.json();

  // Handle ApiResponse.success wrapper structure
  const data = apiResponse.success ? apiResponse.data : apiResponse;

  return data;
};

// Utility function to clean up model names, especially for OpenRouter models
function cleanModelName(name: string, provider: string): string {
  if (provider === 'openrouter') {
    // Strip common provider prefixes from OpenRouter model names
    const prefixesToRemove = [
      'Anthropic: ',
      'OpenAI: ',
      'Google: ',
      'Meta: ',
      'Mistral: ',
      'Cohere: ',
      'AI21: ',
      'Perplexity: ',
      'Microsoft: ',
      'xAI: ',
      'DeepSeek: ',
      'Qwen: ',
      'Alibaba: ',
      'Amazon: ',
      'NousResearch: ',
      'Nous Research: ',
      'Together: ',
      'Fireworks: ',
      'SambaNova: ',
      'Liquid: ',
      'Reflection: ',
      'Nvidia: ',
      'NVIDIA: ',
      'HuggingFace: ',
      'Hugging Face: ',
    ];

    for (const prefix of prefixesToRemove) {
      if (name.startsWith(prefix)) {
        return name.substring(prefix.length);
      }
    }
  }

  return name;
}

export function useModels() {
  // Get initial models from atom (set by server-side data)
  const initialModels = useAtomValue(initialModelsAtom);

  // No longer tracking enabled models locally - server is source of truth

  const { data, error, isLoading, mutate } = useSWR<ModelsResponse>(
    '/api/models',
    fetcher,
    {
      fallbackData: initialModels, // Use server-rendered data as fallback
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false, // Don't revalidate on mount when we have initial data
      dedupingInterval: 300000, // Cache for 5 minutes to match API cache
      // Don't refetch if we have initial data from server
      refreshInterval: 0,
    }
  );

  // Server is the source of truth for enabled models

  // Flatten all models from all providers - use server data as source of truth
  const allModels = useMemo(() => {
    if (!data?.providers) {
      return [];
    }

    return data.providers.flatMap((provider) =>
      provider.models.map((model) => ({
        ...model,
        name: cleanModelName(model.name, model.provider), // Clean up the model name
        // Use the enabled state from server, not local state
      }))
    );
  }, [data?.providers]);

  // Get only enabled models
  const enabledModels = useMemo(() => {
    return allModels.filter((model) => model.enabled);
  }, [allModels]);

  // These functions are deprecated - use server mutations instead
  // The server is the source of truth for enabled models
  const toggleModelEnabled = (_modelId: string, _provider: string) => {};

  const enableModels = (_modelIds: string[], _provider: string) => {};

  const disableModels = (_modelIds: string[], _provider: string) => {};

  // Function to refresh models (useful after API key changes or manual sync)
  const refreshModels = () => {
    mutate();
  };

  return {
    // Data
    allModels,
    enabledModels,
    providers: data?.providers || [],

    // State
    isLoading,
    error,

    // Actions
    toggleModelEnabled,
    enableModels,
    disableModels,
    refreshModels,

    // Computed
    hasEnabledModels: enabledModels.length > 0,
    totalModels: allModels.length,
    enabledCount: enabledModels.length,
  };
}
