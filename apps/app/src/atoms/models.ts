import { normalizeEnabledModels } from '@/utils/model-helpers';
import { atom } from 'jotai';

// Types for models response
interface ModelProvider {
  id: string;
  name: string;
  models: AIModel[];
}

interface AIModel {
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

interface ModelsResponse {
  providers: ModelProvider[];
  total_models: number;
}

// Initial models data from server-side rendering
export const initialModelsAtom = atom<ModelsResponse | undefined>(undefined);

// Store enabled model IDs organized by provider (will be hydrated from localStorage on client)
export const enabledModelsByProviderAtom = atom<{
  openai: string[];
  anthropic: string[];
  google: string[];
  openrouter: string[];
}>({
  openai: [],
  anthropic: [],
  google: [],
  openrouter: [],
});

// Selected model ID atom (will be hydrated from localStorage on client)
export const selectedModelIdAtom = atom<string | undefined>(undefined);

// Legacy flat array atom for backward compatibility - will be removed
export const enabledModelIdsAtom = atom(
  (get) => {
    const byProvider = get(enabledModelsByProviderAtom);
    return [
      ...byProvider.openai,
      ...byProvider.anthropic,
      ...byProvider.google,
      ...byProvider.openrouter,
    ];
  },
  (_get, set, modelIds: string[]) => {
    // Convert flat array to provider-based structure using shared utility
    const byProvider = normalizeEnabledModels(modelIds);
    set(enabledModelsByProviderAtom, byProvider);
  }
);

// Derived atom for checking if a model is enabled
export const isModelEnabledAtom = (modelId: string, provider: string) =>
  atom(
    (get) => {
      const byProvider = get(enabledModelsByProviderAtom);
      const validProvider = provider as
        | 'openai'
        | 'anthropic'
        | 'google'
        | 'openrouter';
      return byProvider[validProvider]?.includes(modelId) || false;
    },
    (get, set, enabled: boolean) => {
      const current = get(enabledModelsByProviderAtom);
      const validProvider = provider as
        | 'openai'
        | 'anthropic'
        | 'google'
        | 'openrouter';
      const providerModels = current[validProvider] || [];

      if (enabled && !providerModels.includes(modelId)) {
        set(enabledModelsByProviderAtom, {
          ...current,
          [provider]: [...providerModels, modelId],
        });
      } else if (!enabled && providerModels.includes(modelId)) {
        set(enabledModelsByProviderAtom, {
          ...current,
          [provider]: providerModels.filter((id) => id !== modelId),
        });
      }
    }
  );

// Action atom for toggling a model by provider
export const toggleModelAtom = atom(
  null,
  (get, set, { modelId, provider }: { modelId: string; provider: string }) => {
    const current = get(enabledModelsByProviderAtom);
    const validProvider = provider as
      | 'openai'
      | 'anthropic'
      | 'google'
      | 'openrouter';
    const providerModels = current[validProvider] || [];
    const isEnabled = providerModels.includes(modelId);

    if (isEnabled) {
      set(enabledModelsByProviderAtom, {
        ...current,
        [provider]: providerModels.filter((id) => id !== modelId),
      });
    } else {
      set(enabledModelsByProviderAtom, {
        ...current,
        [provider]: [...providerModels, modelId],
      });
    }

    return !isEnabled; // Return new state
  }
);
