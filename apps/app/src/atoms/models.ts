import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Types for models response
export interface ModelProvider {
  id: string;
  name: string;
  models: AIModel[];
}

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

export interface ModelsResponse {
  providers: ModelProvider[];
  total_models: number;
}

// Store enabled model IDs organized by provider (hydrated from localStorage)
export const enabledModelsByProviderAtom = atomWithStorage<{
  openrouter: string[];
}>('ascii-enabled-models', {
  openrouter: ['openai/gpt-4'],
});

// Selected model ID atom (hydrated from localStorage)
export const selectedModelIdAtom = atomWithStorage<string>('ascii-selected-model', 'openai/gpt-4');

// Available models from OpenRouter
export const availableModelsAtom = atom<AIModel[]>([
  {
    id: 'openai/gpt-4',
    name: 'GPT-4',
    provider: 'openrouter',
    description: 'Most capable GPT-4 model',
    context_length: 8192,
    pricing: { input: 30, output: 60 },
    enabled: true,
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openrouter',
    description: 'Fast GPT-4 with 128k context',
    context_length: 128000,
    pricing: { input: 10, output: 30 },
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openrouter',
    description: 'Latest multimodal GPT-4',
    context_length: 128000,
    pricing: { input: 5, output: 15 },
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openrouter',
    description: 'Small, fast GPT-4o model',
    context_length: 128000,
    pricing: { input: 0.15, output: 0.6 },
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    description: 'Best for creative tasks',
    context_length: 200000,
    pricing: { input: 3, output: 15 },
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'openrouter',
    description: 'Most capable Claude model',
    context_length: 200000,
    pricing: { input: 15, output: 75 },
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'openrouter',
    description: 'Fast, affordable Claude',
    context_length: 200000,
    pricing: { input: 0.25, output: 1.25 },
  },
  {
    id: 'google/gemini-pro',
    name: 'Gemini Pro',
    provider: 'openrouter',
    description: 'Google\'s advanced model',
    context_length: 32000,
    pricing: { input: 0.5, output: 1.5 },
  },
  {
    id: 'meta-llama/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B',
    provider: 'openrouter',
    description: 'Open source powerhouse',
    context_length: 128000,
    pricing: { input: 5, output: 15 },
  },
  {
    id: 'mistralai/mixtral-8x22b-instruct',
    name: 'Mixtral 8x22B',
    provider: 'openrouter',
    description: 'Efficient MoE model',
    context_length: 65536,
    pricing: { input: 0.9, output: 2.7 },
  },
]);

// Derived atom for checking if a model is enabled
export const isModelEnabledAtom = atom(
  (get) => (modelId: string) => {
    const enabledByProvider = get(enabledModelsByProviderAtom);
    return enabledByProvider.openrouter?.includes(modelId) || false;
  }
);

// Action atom for toggling a model
export const toggleModelAtom = atom(
  null,
  (get, set, modelId: string) => {
    const current = get(enabledModelsByProviderAtom);
    const isEnabled = current.openrouter?.includes(modelId) || false;

    if (isEnabled) {
      set(enabledModelsByProviderAtom, {
        ...current,
        openrouter: current.openrouter.filter((id) => id !== modelId),
      });
    } else {
      set(enabledModelsByProviderAtom, {
        ...current,
        openrouter: [...(current.openrouter || []), modelId],
      });
    }

    return !isEnabled;
  }
);

// Get all enabled models
export const enabledModelsAtom = atom((get) => {
  const byProvider = get(enabledModelsByProviderAtom);
  const availableModels = get(availableModelsAtom);
  
  return availableModels
    .filter(model => byProvider.openrouter?.includes(model.id))
    .map(model => ({ ...model, enabled: true }));
});

// Get selected model
export const selectedModelAtom = atom((get) => {
  const selectedId = get(selectedModelIdAtom);
  const availableModels = get(availableModelsAtom);
  
  return availableModels.find(model => model.id === selectedId) || availableModels[0];
});