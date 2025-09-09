import { v } from "convex/values";
import { action } from "../_generated/server";

// List OpenRouter models
export const listOpenRouter = action({
  args: {},
  handler: async () => {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          "HTTP-Referer": process.env.APP_URL || "https://ascii.xyz",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { models: data.data || [] };
    } catch (error) {
      console.error("Failed to fetch OpenRouter models:", error);
      return { models: [] };
    }
  },
});

// List OpenAI models
export const listOpenAI = action({
  args: {},
  handler: async () => {
    // Return common OpenAI models
    return {
      models: [
        { id: "gpt-4-turbo-preview", name: "GPT-4 Turbo" },
        { id: "gpt-4", name: "GPT-4" },
        { id: "gpt-4-32k", name: "GPT-4 32K" },
        { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
        { id: "gpt-3.5-turbo-16k", name: "GPT-3.5 Turbo 16K" },
      ],
    };
  },
});

// List Anthropic models
export const listAnthropic = action({
  args: {},
  handler: async () => {
    // Return common Anthropic models
    return {
      models: [
        { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
        { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet" },
        { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
        { id: "claude-2.1", name: "Claude 2.1" },
        { id: "claude-2.0", name: "Claude 2.0" },
        { id: "claude-instant-1.2", name: "Claude Instant" },
      ],
    };
  },
});

// List Google models
export const listGoogle = action({
  args: {},
  handler: async () => {
    // Return common Google models
    return {
      models: [
        { id: "gemini-pro", name: "Gemini Pro" },
        { id: "gemini-pro-vision", name: "Gemini Pro Vision" },
        { id: "gemini-ultra", name: "Gemini Ultra" },
        { id: "palm-2", name: "PaLM 2" },
      ],
    };
  },
});