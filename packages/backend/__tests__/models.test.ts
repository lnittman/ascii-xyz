import { describe, it, expect, beforeEach } from 'vitest';
import { api } from '../convex/_generated/api';
import {
  createTestContext,
  withTestUser,
  type TestContext,
  type TestUser,
} from './setup';

describe('Model Configuration', () => {
  let t: TestContext;
  let testUser: TestUser;

  beforeEach(async () => {
    t = createTestContext();
    testUser = await withTestUser(t);
  });

  describe('listModels', () => {
    it('returns all models when no filters', async () => {
      // Seed some models first
      await t.run(async (ctx) => {
        await ctx.db.insert('models', {
          modelId: 'openrouter/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          description: 'Best for creative ASCII art',
          contextWindow: 200000,
          isDefault: true,
          isEnabled: true,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await ctx.db.insert('models', {
          modelId: 'openrouter/gpt-4o',
          name: 'GPT-4o',
          provider: 'openai',
          description: 'Latest multimodal model',
          contextWindow: 128000,
          isDefault: false,
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const models = await t.query(api.functions.queries.models.list, {});

      expect(models.length).toBe(2);
      expect(models[0].modelId).toBe('openrouter/claude-3.5-sonnet');
      expect(models[1].modelId).toBe('openrouter/gpt-4o');
    });

    it('filters by provider', async () => {
      await t.run(async (ctx) => {
        await ctx.db.insert('models', {
          modelId: 'openrouter/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          description: 'Best for creative ASCII art',
          contextWindow: 200000,
          isDefault: true,
          isEnabled: true,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await ctx.db.insert('models', {
          modelId: 'openrouter/gpt-4o',
          name: 'GPT-4o',
          provider: 'openai',
          description: 'Latest multimodal model',
          contextWindow: 128000,
          isDefault: false,
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const models = await t.query(api.functions.queries.models.list, {
        provider: 'anthropic',
      });

      expect(models.length).toBe(1);
      expect(models[0].provider).toBe('anthropic');
    });

    it('only returns enabled models by default', async () => {
      await t.run(async (ctx) => {
        await ctx.db.insert('models', {
          modelId: 'openrouter/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          description: 'Best for creative ASCII art',
          contextWindow: 200000,
          isDefault: true,
          isEnabled: true,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await ctx.db.insert('models', {
          modelId: 'openrouter/gpt-4o',
          name: 'GPT-4o',
          provider: 'openai',
          description: 'Disabled model',
          contextWindow: 128000,
          isDefault: false,
          isEnabled: false,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const models = await t.query(api.functions.queries.models.list, {});

      expect(models.length).toBe(1);
      expect(models[0].isEnabled).toBe(true);
    });

    it('returns disabled models when includeDisabled is true', async () => {
      await t.run(async (ctx) => {
        await ctx.db.insert('models', {
          modelId: 'openrouter/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          description: 'Enabled',
          contextWindow: 200000,
          isDefault: true,
          isEnabled: true,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await ctx.db.insert('models', {
          modelId: 'openrouter/gpt-4o',
          name: 'GPT-4o',
          provider: 'openai',
          description: 'Disabled',
          contextWindow: 128000,
          isDefault: false,
          isEnabled: false,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const models = await t.query(api.functions.queries.models.list, {
        includeDisabled: true,
      });

      expect(models.length).toBe(2);
    });

    it('respects sortOrder', async () => {
      await t.run(async (ctx) => {
        await ctx.db.insert('models', {
          modelId: 'model-b',
          name: 'Model B',
          provider: 'openai',
          description: 'Second',
          contextWindow: 128000,
          isDefault: false,
          isEnabled: true,
          sortOrder: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await ctx.db.insert('models', {
          modelId: 'model-a',
          name: 'Model A',
          provider: 'anthropic',
          description: 'First',
          contextWindow: 200000,
          isDefault: true,
          isEnabled: true,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const models = await t.query(api.functions.queries.models.list, {});

      expect(models[0].modelId).toBe('model-a');
      expect(models[1].modelId).toBe('model-b');
    });
  });

  describe('getDefaultModel', () => {
    it('returns the model marked as default', async () => {
      await t.run(async (ctx) => {
        await ctx.db.insert('models', {
          modelId: 'openrouter/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          description: 'Default model',
          contextWindow: 200000,
          isDefault: true,
          isEnabled: true,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await ctx.db.insert('models', {
          modelId: 'openrouter/gpt-4o',
          name: 'GPT-4o',
          provider: 'openai',
          description: 'Not default',
          contextWindow: 128000,
          isDefault: false,
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const defaultModel = await t.query(api.functions.queries.models.getDefault, {});

      expect(defaultModel).not.toBeNull();
      expect(defaultModel?.modelId).toBe('openrouter/claude-3.5-sonnet');
      expect(defaultModel?.isDefault).toBe(true);
    });

    it('returns first enabled model if no default set', async () => {
      await t.run(async (ctx) => {
        await ctx.db.insert('models', {
          modelId: 'openrouter/gpt-4o',
          name: 'GPT-4o',
          provider: 'openai',
          description: 'No default flag',
          contextWindow: 128000,
          isDefault: false,
          isEnabled: true,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const defaultModel = await t.query(api.functions.queries.models.getDefault, {});

      expect(defaultModel).not.toBeNull();
      expect(defaultModel?.modelId).toBe('openrouter/gpt-4o');
    });

    it('returns null if no models exist', async () => {
      const defaultModel = await t.query(api.functions.queries.models.getDefault, {});

      expect(defaultModel).toBeNull();
    });
  });

  describe('getModelById', () => {
    it('returns model by modelId', async () => {
      await t.run(async (ctx) => {
        await ctx.db.insert('models', {
          modelId: 'openrouter/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          description: 'Test model',
          contextWindow: 200000,
          isDefault: true,
          isEnabled: true,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const model = await t.query(api.functions.queries.models.getById, {
        modelId: 'openrouter/claude-3.5-sonnet',
      });

      expect(model).not.toBeNull();
      expect(model?.name).toBe('Claude 3.5 Sonnet');
    });

    it('returns null for non-existent model', async () => {
      const model = await t.query(api.functions.queries.models.getById, {
        modelId: 'non-existent-model',
      });

      expect(model).toBeNull();
    });
  });

  describe('seedModels (internal)', () => {
    it('seeds models from config', async () => {
      // Seed models
      await t.mutation(api.functions.mutations.models.seed, {});

      const models = await t.query(api.functions.queries.models.list, {
        includeDisabled: true,
      });

      expect(models.length).toBeGreaterThan(0);
      // Check that default model exists
      const defaultModel = models.find(m => m.isDefault);
      expect(defaultModel).toBeDefined();
    });

    it('is idempotent - does not duplicate models', async () => {
      // Seed twice
      await t.mutation(api.functions.mutations.models.seed, {});
      await t.mutation(api.functions.mutations.models.seed, {});

      const models = await t.query(api.functions.queries.models.list, {
        includeDisabled: true,
      });

      // Count unique modelIds
      const uniqueIds = new Set(models.map(m => m.modelId));
      expect(uniqueIds.size).toBe(models.length);
    });
  });
});
