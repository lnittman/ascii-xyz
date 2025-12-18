import { v } from 'convex/values';
import { query } from '../../_generated/server';

// List all models with optional filters
export const list = query({
  args: {
    provider: v.optional(v.string()),
    includeDisabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let models;

    if (args.provider) {
      // Filter by provider
      models = await ctx.db
        .query('models')
        .withIndex('by_provider', (q) => q.eq('provider', args.provider!))
        .collect();
    } else if (args.includeDisabled) {
      // Get all models
      models = await ctx.db.query('models').collect();
    } else {
      // Get only enabled models using the composite index
      models = await ctx.db
        .query('models')
        .withIndex('by_enabled', (q) => q.eq('isEnabled', true))
        .collect();
    }

    // Filter by enabled if provider filter was used
    if (args.provider && !args.includeDisabled) {
      models = models.filter((m) => m.isEnabled);
    }

    // Sort by sortOrder
    return models.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// Get the default model
export const getDefault = query({
  args: {},
  handler: async (ctx) => {
    // First try to find the model marked as default
    const defaultModel = await ctx.db
      .query('models')
      .withIndex('by_default', (q) => q.eq('isDefault', true))
      .first();

    if (defaultModel && defaultModel.isEnabled) {
      return defaultModel;
    }

    // Fallback: get first enabled model by sortOrder
    const firstEnabled = await ctx.db
      .query('models')
      .withIndex('by_enabled', (q) => q.eq('isEnabled', true))
      .first();

    return firstEnabled ?? null;
  },
});

// Get a model by its modelId
export const getById = query({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    const model = await ctx.db
      .query('models')
      .withIndex('by_model_id', (q) => q.eq('modelId', args.modelId))
      .unique();

    return model ?? null;
  },
});

// Get models grouped by provider
export const byProvider = query({
  args: {
    includeDisabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let models;

    if (args.includeDisabled) {
      models = await ctx.db.query('models').collect();
    } else {
      models = await ctx.db
        .query('models')
        .withIndex('by_enabled', (q) => q.eq('isEnabled', true))
        .collect();
    }

    // Sort and group by provider
    const sorted = models.sort((a, b) => a.sortOrder - b.sortOrder);
    const grouped: Record<string, typeof models> = {};

    for (const model of sorted) {
      if (!grouped[model.provider]) {
        grouped[model.provider] = [];
      }
      grouped[model.provider].push(model);
    }

    return grouped;
  },
});
