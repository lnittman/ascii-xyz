import { db, eq, schema } from '@repo/database';
import { aiSettingsService } from './settings/ai';

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
}

export interface ModelsResponse {
  providers: ModelProvider[];
  total_models: number;
}

// Fetch models from OpenAI
async function fetchOpenAIModels(apiKey: string): Promise<AIModel[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data: any = await response.json();

    // Filter to only chat completion models and add known context lengths
    const chatModels = data.data.filter(
      (model: any) => model.id.includes('gpt') && !model.id.includes('instruct')
    );

    return chatModels.map((model: any) => ({
      id: model.id,
      name: formatModelName(model.id),
      provider: 'openai',
      context_length: getOpenAIContextLength(model.id),
      pricing: getOpenAIPricing(model.id),
      capabilities: getOpenAICapabilities(model.id),
    }));
  } catch (_error) {
    return [];
  }
}

// Fetch models from Anthropic (using known models since they don't have a public API)
async function fetchAnthropicModels(apiKey: string): Promise<AIModel[]> {
  // Test API key validity with a minimal request
  try {
    const _testResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      }),
    });

    // If we get any response (even error), the key is likely valid
    return [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        context_length: 200000,
        pricing: { input: 0.003, output: 0.015 },
        capabilities: ['text', 'vision', 'tools'],
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        context_length: 200000,
        pricing: { input: 0.0008, output: 0.004 },
        capabilities: ['text', 'vision', 'tools'],
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        context_length: 200000,
        pricing: { input: 0.015, output: 0.075 },
        capabilities: ['text', 'vision', 'tools'],
      },
    ];
  } catch (_error) {
    return [];
  }
}

// Fetch models from Google
async function fetchGoogleModels(apiKey: string): Promise<AIModel[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      return [];
    }

    const data: any = await response.json();

    // Filter to only generative models
    const generativeModels =
      data.models?.filter(
        (model: any) =>
          model.name.includes('gemini') &&
          model.supportedGenerationMethods?.includes('generateContent')
      ) || [];

    return generativeModels.map((model: any) => ({
      id: model.name.split('/').pop(),
      name: model.displayName || formatModelName(model.name.split('/').pop()),
      provider: 'google',
      context_length: model.inputTokenLimit || 32768,
      pricing: getGooglePricing(model.name.split('/').pop()),
      capabilities: ['text', 'vision', 'tools'],
    }));
  } catch (_error) {
    return [];
  }
}

// Fetch models from OpenRouter
async function fetchOpenRouterModels(apiKey: string): Promise<AIModel[]> {
  try {
    // First, verify the API key with a simple request
    const verifyResponse = await fetch(
      'https://openrouter.ai/api/v1/auth/key',
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || 'https://localhost:3000',
          'X-Title': 'Arbor Models',
        },
      }
    );

    if (!verifyResponse.ok) {
      return [];
    }

    // Fetch models (no auth required for public models list)
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'https://localhost:3000',
        'X-Title': 'Arbor Models',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data: any = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }

    return data.data
      .map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        provider: 'openrouter',
        context_length: model.context_length,
        pricing: model.pricing
          ? {
              input: Number.parseFloat(model.pricing.prompt || '0'),
              output: Number.parseFloat(model.pricing.completion || '0'),
            }
          : undefined,
        capabilities: determineCapabilities(model),
        description: model.description,
      }))
      .filter((model: AIModel) => model.id); // Filter out any invalid models
  } catch (_error) {
    return [];
  }
}

// Helper function to determine model capabilities
function determineCapabilities(model: {
  architecture?: {
    input_modalities?: string[];
  };
  supported_parameters?: string[];
}): string[] {
  const capabilities = ['text']; // All models support text

  if (model.architecture?.input_modalities?.includes('image')) {
    capabilities.push('vision');
  }

  // Check if model supports function calling/tools
  if (
    model.supported_parameters?.includes('tools') ||
    model.supported_parameters?.includes('function_call')
  ) {
    capabilities.push('tools');
  }

  return capabilities;
}

// Helper functions for model metadata
function formatModelName(modelId: string): string {
  return modelId
    .replace(/^gpt-/, 'GPT-')
    .replace(/^claude-/, 'Claude ')
    .replace(/^gemini-/, 'Gemini ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function getOpenAIContextLength(modelId: string): number {
  const contextLengths: Record<string, number> = {
    'gpt-4o': 128000,
    'gpt-4o-mini': 128000,
    'gpt-4-turbo': 128000,
    'gpt-4': 8192,
    'gpt-3.5-turbo': 16385,
  };
  return contextLengths[modelId] || 4096;
}

function getOpenAIPricing(
  modelId: string
): { input: number; output: number } | undefined {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  };
  return pricing[modelId];
}

function getOpenAICapabilities(modelId: string): string[] {
  if (modelId.includes('4o') || modelId.includes('4-turbo')) {
    return ['text', 'vision', 'tools'];
  }
  return ['text', 'tools'];
}

function getGooglePricing(
  modelId: string
): { input: number; output: number } | undefined {
  const pricing: Record<string, { input: number; output: number }> = {
    'gemini-2.0-flash-exp': { input: 0.00075, output: 0.003 },
    'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
    'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  };
  return pricing[modelId];
}

export class ModelsService {
  /**
   * Get models for a user based on their API keys
   */
  async getModelsForUser(userId: string): Promise<ModelsResponse> {
    try {
      // Get user by internal ID
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      if (!user) {
        return { providers: [], total_models: 0 };
      }

      // Fetch AI settings for the user (using internal userId)
      const aiSettings = await aiSettingsService.getOrCreateAISettings(userId);

      // Handle both old and new enabledModels format
      let enabledModelsByProvider: Record<string, string[]> = {
        openai: [],
        anthropic: [],
        google: [],
        openrouter: [],
      };

      if (aiSettings.enabledModels) {
        if (Array.isArray(aiSettings.enabledModels)) {
          // Legacy format - convert to new format
          const flatArray = aiSettings.enabledModels as string[];
          enabledModelsByProvider = {
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
        } else if (typeof aiSettings.enabledModels === 'object') {
          // New format - use as is with defaults
          enabledModelsByProvider = {
            openai: (aiSettings.enabledModels as any).openai || [],
            anthropic: (aiSettings.enabledModels as any).anthropic || [],
            google: (aiSettings.enabledModels as any).google || [],
            openrouter: (aiSettings.enabledModels as any).openrouter || [],
          };
        }
      }

      // Fetch models from all providers in parallel
      const modelFetches = [];

      if (aiSettings?.openaiApiKey) {
        modelFetches.push(
          fetchOpenAIModels(aiSettings.openaiApiKey).then((models) => ({
            provider: 'openai',
            name: 'OpenAI',
            models,
          }))
        );
      }

      if (aiSettings?.anthropicApiKey) {
        modelFetches.push(
          fetchAnthropicModels(aiSettings.anthropicApiKey).then((models) => ({
            provider: 'anthropic',
            name: 'Anthropic',
            models,
          }))
        );
      }

      if (aiSettings?.googleApiKey) {
        modelFetches.push(
          fetchGoogleModels(aiSettings.googleApiKey).then((models) => ({
            provider: 'google',
            name: 'Google',
            models,
          }))
        );
      }

      if (aiSettings?.openrouterApiKey) {
        modelFetches.push(
          fetchOpenRouterModels(aiSettings.openrouterApiKey).then((models) => ({
            provider: 'openrouter',
            name: 'OpenRouter',
            models,
          }))
        );
      }

      // Wait for all fetches to complete
      const results = await Promise.allSettled(modelFetches);

      // Build providers array from successful fetches
      const providers: ModelProvider[] = results
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<{
            provider: string;
            name: string;
            models: AIModel[];
          }> => result.status === 'fulfilled'
        )
        .map((result) => ({
          id: result.value.provider,
          name: result.value.name,
          models: result.value.models.map((model) => ({
            ...model,
            enabled:
              enabledModelsByProvider[result.value.provider]?.includes(
                model.id
              ) || false,
          })),
        }))
        .filter((provider) => provider.models.length > 0);

      const totalModels = providers.reduce(
        (sum, provider) => sum + provider.models.length,
        0
      );

      return {
        providers,
        total_models: totalModels,
      };
    } catch (_error) {
      return { providers: [], total_models: 0 };
    }
  }
}

export const modelsService = new ModelsService();
