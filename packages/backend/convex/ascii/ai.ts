// AI Model Configuration
import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

export function getChatModel(provider?: string): any {
  const p = provider || process.env.DEFAULT_PROVIDER || 'openai';

  switch(p) {
    case 'anthropic':
      return anthropic.chat("claude-3-5-sonnet-20241022");
    case 'google':
      return google.chat("gemini-1.5-flash");
    case 'openai':
    default:
      return openai.chat(process.env.OPENAI_MODEL || "gpt-4o-mini");
  }
}

export function getEmbeddingModel(): any {
  return openai.embedding("text-embedding-3-small");
}

// For ASCII generation specifically
export function getAsciiModel(apiKey?: string): any {
  if (apiKey) {
    const customOpenAI = createOpenAI({ apiKey });
    return customOpenAI("gpt-4o");
  }
  return openai("gpt-4o");
}