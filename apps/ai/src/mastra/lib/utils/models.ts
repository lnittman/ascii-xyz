// File: src/mastra/utils/models.ts

import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModelV1 } from 'ai';
import { normalizeRuntimeContext } from './runtime-context-builder'; // <-- Import the helper

// Renamed for clarity
export function createModelFromContext({
  runtimeContext,
  defaultModelId = 'z-ai/glm-4.5', // always use z-ai/glm-4.5 as default
}: {
  runtimeContext: any;
  defaultModelId?: string;
}): LanguageModelV1 {
  const normalizedContext = normalizeRuntimeContext(runtimeContext);

  const modelId = normalizedContext.get('chat-model') || defaultModelId;

  // For OpenRouter models (contain slash), use openrouter directly
  if (modelId.includes('/')) {
    const openrouterKey =
      normalizedContext.get('openrouter-api-key') ||
      process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      throw new Error('OpenRouter API key is missing.');
    }

    const openrouter = createOpenRouter({ apiKey: openrouterKey });
    const model = openrouter(modelId);
    return model;
  }

  // For other providers, check prefix and use appropriate SDK
  if (modelId.startsWith('gpt-')) {
    const openaiKey =
      normalizedContext.get('openai-api-key') || process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error('OpenAI API key is missing.');
    }
    const openai = createOpenAI({ apiKey: openaiKey });
    return openai(modelId);
  }

  if (modelId.startsWith('claude-')) {
    const anthropicKey =
      normalizedContext.get('anthropic-api-key') ||
      process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      throw new Error('Anthropic API key is missing.');
    }
    const anthropic = createAnthropic({ apiKey: anthropicKey });
    return anthropic(modelId);
  }

  if (modelId.startsWith('gemini-')) {
    const googleKey =
      normalizedContext.get('google-api-key') || process.env.GOOGLE_API_KEY;
    if (!googleKey) {
      throw new Error('Google API key is missing.');
    }
    const google = createGoogleGenerativeAI({ apiKey: googleKey });
    return google(modelId);
  }

  // Default to OpenRouter for unknown models
  const openrouterKey =
    normalizedContext.get('openrouter-api-key') ||
    process.env.OPENROUTER_API_KEY;
  if (!openrouterKey) {
    throw new Error('OpenRouter API key is missing.');
  }
  const openrouter = createOpenRouter({ apiKey: openrouterKey });
  return openrouter(modelId);
}
