import { randomUUID } from 'node:crypto';
import { db, eq, schema, selectAISettingsSchema } from '@repo/database';
import type { AISettings } from '@repo/database';
import { ServiceError, internalError } from '../lib/errors';

// Define update type
export type UpdateAISettings = Partial<
  Omit<AISettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

// Simple in-memory cache for AI settings to reduce database queries
const settingsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache

export class AISettingsService {
  /**
   * Get or create AI settings for a user
   */
  async getOrCreateAISettings(userId: string) {
    try {
      // Check cache first
      const cached = settingsCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      const [aiSettings] = await db
        .select()
        .from(schema.aiSettings)
        .where(eq(schema.aiSettings.userId, userId))
        .limit(1);

      if (!aiSettings) {
        const [newSettings] = await db
          .insert(schema.aiSettings)
          .values({
            id: randomUUID(),
            userId: userId,
            defaultModelId: 'google/gemini-2.5-flash-preview-05-20',
            customInstructions:
              'DO NOT run any tests, linting, or formatting unless I explicitly ask',
            branchFormat: 'arbor/{feature}',
            allowTraining: true,
            enabledModels: {},
            updatedAt: new Date(),
          })
          .returning();

        // Cache the result
        settingsCache.set(userId, {
          data: selectAISettingsSchema.parse(newSettings),
          timestamp: Date.now(),
        });

        return selectAISettingsSchema.parse(newSettings);
      }

      // Cache the result
      settingsCache.set(userId, {
        data: selectAISettingsSchema.parse(aiSettings),
        timestamp: Date.now(),
      });

      return selectAISettingsSchema.parse(aiSettings);
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to get AI settings');
    }
  }

  /**
   * Update AI settings
   */
  async updateAISettings(userId: string, data: UpdateAISettings) {
    try {
      // Let the consuming app handle validation
      const validatedData = data;

      // Ensure AI settings exist
      await this.getOrCreateAISettings(userId);

      const [updatedSettings] = await db
        .update(schema.aiSettings)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(schema.aiSettings.userId, userId))
        .returning();

      // Invalidate cache on update
      settingsCache.delete(userId);

      return selectAISettingsSchema.parse(updatedSettings);
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to update AI settings');
    }
  }

  /**
   * Get user's enabled models in the expected format
   */
  async getEnabledModels(userId: string): Promise<{
    openai: string[];
    anthropic: string[];
    google: string[];
    openrouter: string[];
  }> {
    try {
      const aiSettings = await this.getOrCreateAISettings(userId);

      // Handle both old and new enabledModels format
      let enabledModels = aiSettings.enabledModels;
      if (Array.isArray(enabledModels)) {
        // Legacy format - convert to new format
        const flatArray = enabledModels as string[];
        enabledModels = {
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
      } else if (!enabledModels || typeof enabledModels !== 'object') {
        // Handle null or invalid data
        enabledModels = {
          openai: [],
          anthropic: [],
          google: [],
          openrouter: [],
        };
      }

      return enabledModels as {
        openai: string[];
        anthropic: string[];
        google: string[];
        openrouter: string[];
      };
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to get enabled models');
    }
  }

  /**
   * Toggle a model's enabled state for a specific provider
   */
  async toggleModelEnabled(
    userId: string,
    provider: string,
    modelId: string
  ): Promise<AISettings> {
    try {
      const settings = await this.getOrCreateAISettings(userId);

      // Get current enabled models
      const currentEnabledModels = (settings.enabledModels as any) || {
        openai: [],
        anthropic: [],
        google: [],
        openrouter: [],
      };

      const providerModels = currentEnabledModels[provider] || [];

      // Toggle the model
      let updatedModels;
      if (providerModels.includes(modelId)) {
        updatedModels = providerModels.filter((id: string) => id !== modelId);
      } else {
        updatedModels = [...providerModels, modelId];
      }

      // Update the settings
      return this.updateAISettings(userId, {
        enabledModels: {
          ...currentEnabledModels,
          [provider]: updatedModels,
        },
      });
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to toggle model');
    }
  }

  /**
   * Verify an API key for a provider
   */
  async verifyApiKey(provider: string, apiKey: string): Promise<boolean> {
    try {
      // For now, just do basic validation
      // In the future, this could make test API calls to verify the key

      if (!apiKey || apiKey.trim().length === 0) {
        return false;
      }

      switch (provider) {
        case 'openai':
          return apiKey.startsWith('sk-') && apiKey.length > 20;
        case 'anthropic':
          return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
        case 'google':
          return apiKey.length > 20; // Google API keys don't have a specific prefix
        case 'openrouter':
          return apiKey.startsWith('sk-or-') && apiKey.length > 20;
        default:
          return false;
      }
    } catch (_error) {
      return false;
    }
  }
}

export const aiSettingsService = new AISettingsService();
