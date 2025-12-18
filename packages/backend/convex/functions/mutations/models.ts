import { v } from 'convex/values';
import { mutation, internalMutation } from '../../_generated/server';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from '../../config/models';

// Seed models from the config file (idempotent)
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();

    for (let i = 0; i < AVAILABLE_MODELS.length; i++) {
      const modelConfig = AVAILABLE_MODELS[i];

      // Check if model already exists
      const existing = await ctx.db
        .query('models')
        .withIndex('by_model_id', (q) => q.eq('modelId', modelConfig.id))
        .unique();

      if (!existing) {
        // Insert new model
        await ctx.db.insert('models', {
          modelId: modelConfig.id,
          name: modelConfig.name,
          provider: modelConfig.provider,
          description: modelConfig.description,
          contextWindow: modelConfig.contextWindow,
          isDefault: modelConfig.id === DEFAULT_MODEL_ID,
          isEnabled: true,
          sortOrder: i,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { seeded: AVAILABLE_MODELS.length };
  },
});

// Update a model's enabled status
export const setEnabled = mutation({
  args: {
    modelId: v.string(),
    isEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const model = await ctx.db
      .query('models')
      .withIndex('by_model_id', (q) => q.eq('modelId', args.modelId))
      .unique();

    if (!model) {
      throw new Error(`Model not found: ${args.modelId}`);
    }

    await ctx.db.patch(model._id, {
      isEnabled: args.isEnabled,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

// Set the default model
export const setDefault = mutation({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    const model = await ctx.db
      .query('models')
      .withIndex('by_model_id', (q) => q.eq('modelId', args.modelId))
      .unique();

    if (!model) {
      throw new Error(`Model not found: ${args.modelId}`);
    }

    // Unset current default
    const currentDefault = await ctx.db
      .query('models')
      .withIndex('by_default', (q) => q.eq('isDefault', true))
      .first();

    if (currentDefault && currentDefault._id !== model._id) {
      await ctx.db.patch(currentDefault._id, {
        isDefault: false,
        updatedAt: new Date().toISOString(),
      });
    }

    // Set new default
    await ctx.db.patch(model._id, {
      isDefault: true,
      isEnabled: true, // Default model must be enabled
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

// Update model sort order
export const updateSortOrder = mutation({
  args: {
    modelId: v.string(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const model = await ctx.db
      .query('models')
      .withIndex('by_model_id', (q) => q.eq('modelId', args.modelId))
      .unique();

    if (!model) {
      throw new Error(`Model not found: ${args.modelId}`);
    }

    await ctx.db.patch(model._id, {
      sortOrder: args.sortOrder,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

// Add a new custom model
export const addCustom = mutation({
  args: {
    modelId: v.string(),
    name: v.string(),
    provider: v.string(),
    description: v.string(),
    contextWindow: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if model already exists
    const existing = await ctx.db
      .query('models')
      .withIndex('by_model_id', (q) => q.eq('modelId', args.modelId))
      .unique();

    if (existing) {
      throw new Error(`Model already exists: ${args.modelId}`);
    }

    // Get max sort order
    const allModels = await ctx.db.query('models').collect();
    const maxSortOrder = Math.max(0, ...allModels.map((m) => m.sortOrder));

    const now = new Date().toISOString();

    const id = await ctx.db.insert('models', {
      modelId: args.modelId,
      name: args.name,
      provider: args.provider,
      description: args.description,
      contextWindow: args.contextWindow,
      isDefault: false,
      isEnabled: true,
      sortOrder: maxSortOrder + 1,
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },
});
