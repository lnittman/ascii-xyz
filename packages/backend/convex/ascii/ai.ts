// AI Model Configuration
import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// Get OpenRouter instance
function getOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  return createOpenRouter({
    apiKey,
  });
}

export function getChatModel(provider?: string): any {
  const p = provider || process.env.DEFAULT_PROVIDER || 'openrouter';

  switch(p) {
    case 'anthropic':
      return anthropic.chat("claude-3-5-sonnet-20241022");
    case 'google':
      return google.chat("gemini-1.5-flash");
    case 'openai':
      return openai.chat(process.env.OPENAI_MODEL || "gpt-4o-mini");
    case 'openrouter':
    default:
      const openrouter = getOpenRouter();
      // Use Claude 3.5 Sonnet via OpenRouter for best ASCII generation
      return openrouter.chat("anthropic/claude-3.5-sonnet");
  }
}

export function getEmbeddingModel(): any {
  // OpenRouter doesn't support embeddings, fallback to OpenAI if available
  if (process.env.OPENAI_API_KEY) {
    return openai.embedding("text-embedding-3-small");
  }
  // Or use OpenRouter with an embedding model if needed
  const openrouter = getOpenRouter();
  return openrouter.chat("openai/gpt-3.5-turbo"); // Fallback for now
}

// For ASCII generation specifically - use OpenRouter with Claude
export function getAsciiModel(apiKey?: string): any {
  if (apiKey) {
    // User provided their own API key
    const customOpenRouter = createOpenRouter({ apiKey });
    return customOpenRouter.chat("anthropic/claude-3.5-sonnet");
  }
  // Use default OpenRouter
  const openrouter = getOpenRouter();
  return openrouter.chat("anthropic/claude-3.5-sonnet");
}