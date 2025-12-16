// Available AI models for ASCII generation
// This config is shared between frontend and backend

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'google' | 'meta' | 'mistral';
  description: string;
  contextWindow?: number;
  recommended?: boolean;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'openrouter/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Best for creative ASCII art',
    contextWindow: 200000,
    recommended: true,
  },
  {
    id: 'openrouter/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Latest multimodal model',
    contextWindow: 128000,
  },
  {
    id: 'openrouter/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Fast with 128k context',
    contextWindow: 128000,
  },
  {
    id: 'openrouter/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Most capable Claude',
    contextWindow: 200000,
  },
  {
    id: 'openrouter/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'Fast and efficient',
    contextWindow: 200000,
  },
  {
    id: 'openrouter/gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    description: "Google's advanced model",
    contextWindow: 32000,
  },
  {
    id: 'openrouter/llama-3.1-405b',
    name: 'Llama 3.1 405B',
    provider: 'meta',
    description: 'Open source powerhouse',
    contextWindow: 128000,
  },
  {
    id: 'openrouter/mixtral-8x22b',
    name: 'Mixtral 8x22B',
    provider: 'mistral',
    description: 'Efficient MoE model',
    contextWindow: 64000,
  },
];

// Default model to use when no API key or no models enabled
export const DEFAULT_MODEL_ID = 'openrouter/claude-3.5-sonnet';

// Get model by ID
export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(model => model.id === id);
}

// Get default model
export function getDefaultModel(): ModelConfig {
  return AVAILABLE_MODELS.find(m => m.id === DEFAULT_MODEL_ID) || AVAILABLE_MODELS[0];
}

// Group models by provider
export function getModelsByProvider(): Record<string, ModelConfig[]> {
  return AVAILABLE_MODELS.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, ModelConfig[]>
  );
}
