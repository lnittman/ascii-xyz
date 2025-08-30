// AI Model Configuration
import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// Available models configuration
export const AVAILABLE_MODELS: Record<string, {
  provider: string;
  model: string;
  name: string;
  description: string;
}> = {
  // OpenRouter models
  'openrouter/gpt-4': {
    provider: 'openrouter',
    model: 'openai/gpt-4',
    name: 'GPT-4',
    description: 'Most capable GPT-4 model'
  },
  'openrouter/gpt-4-turbo': {
    provider: 'openrouter',
    model: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Fast GPT-4 with 128k context'
  },
  'openrouter/gpt-4o': {
    provider: 'openrouter',
    model: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Latest multimodal GPT-4'
  },
  'openrouter/gpt-4o-mini': {
    provider: 'openrouter',
    model: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Small, fast GPT-4o model'
  },
  'openrouter/claude-3.5-sonnet': {
    provider: 'openrouter',
    model: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Best for creative tasks'
  },
  'openrouter/claude-3-opus': {
    provider: 'openrouter',
    model: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Most capable Claude model'
  },
  'openrouter/claude-3-haiku': {
    provider: 'openrouter',
    model: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fast, affordable Claude'
  },
  'openrouter/gemini-pro': {
    provider: 'openrouter',
    model: 'google/gemini-pro',
    name: 'Gemini Pro',
    description: 'Google\'s advanced model'
  },
  'openrouter/llama-3.1-405b': {
    provider: 'openrouter',
    model: 'meta-llama/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B',
    description: 'Open source powerhouse'
  },
  'openrouter/mixtral-8x22b': {
    provider: 'openrouter',
    model: 'mistralai/mixtral-8x22b-instruct',
    name: 'Mixtral 8x22B',
    description: 'Efficient MoE model'
  },
};

// Default model - using OpenAI GPT-4 via OpenRouter
export const DEFAULT_MODEL = 'openrouter/gpt-4';

// Get OpenRouter instance
function getOpenRouter(apiKey?: string) {
  const key = apiKey || process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  return createOpenRouter({
    apiKey: key,
  });
}

export function getChatModel(modelId?: string, userApiKey?: string): any {
  const selectedModel = modelId || DEFAULT_MODEL;
  const modelConfig = AVAILABLE_MODELS[selectedModel];
  
  if (!modelConfig) {
    throw new Error(`Unknown model: ${selectedModel}`);
  }

  const openrouter = getOpenRouter(userApiKey);
  return openrouter.chat(modelConfig.model);
}

export function getEmbeddingModel(): any {
  // OpenRouter doesn't support embeddings, use OpenAI via OpenRouter
  const openrouter = getOpenRouter();
  return openrouter.chat("openai/text-embedding-3-small");
}

// For ASCII generation - use selected model or default
export function getAsciiModel(modelId?: string, apiKey?: string): any {
  return getChatModel(modelId || DEFAULT_MODEL, apiKey);
}