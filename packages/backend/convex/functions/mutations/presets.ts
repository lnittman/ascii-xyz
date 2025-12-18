import { v } from 'convex/values';
import { mutation } from '../../_generated/server';

// Create a new user preset
export const createUserPreset = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    settings: v.object({
      style: v.string(),
      width: v.number(),
      height: v.number(),
      fps: v.number(),
      modelId: v.optional(v.string()),
    }),
    promptTemplate: v.optional(v.string()),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Get max sort order for this user
    const userPresets = await ctx.db
      .query('presets')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    const maxSortOrder = Math.max(0, ...userPresets.map((p) => p.sortOrder), 0);
    const now = new Date().toISOString();

    const presetId = await ctx.db.insert('presets', {
      name: args.name,
      description: args.description,
      type: 'user',
      userId: args.userId,
      settings: args.settings,
      promptTemplate: args.promptTemplate,
      isEnabled: true,
      sortOrder: maxSortOrder + 1,
      createdAt: now,
      updatedAt: now,
    });

    return presetId;
  },
});

// Update a user preset
export const updateUserPreset = mutation({
  args: {
    presetId: v.id('presets'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    settings: v.optional(
      v.object({
        style: v.string(),
        width: v.number(),
        height: v.number(),
        fps: v.number(),
        modelId: v.optional(v.string()),
      })
    ),
    promptTemplate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const preset = await ctx.db.get(args.presetId);

    if (!preset) {
      throw new Error('Preset not found');
    }

    if (preset.type !== 'user') {
      throw new Error('Cannot update system presets');
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (args.name !== undefined) {
      updates.name = args.name;
    }
    if (args.description !== undefined) {
      updates.description = args.description;
    }
    if (args.settings !== undefined) {
      updates.settings = args.settings;
    }
    if (args.promptTemplate !== undefined) {
      updates.promptTemplate = args.promptTemplate;
    }

    await ctx.db.patch(args.presetId, updates);

    return { success: true };
  },
});

// Delete a user preset
export const deleteUserPreset = mutation({
  args: {
    presetId: v.id('presets'),
  },
  handler: async (ctx, args) => {
    const preset = await ctx.db.get(args.presetId);

    if (!preset) {
      throw new Error('Preset not found');
    }

    if (preset.type !== 'user') {
      throw new Error('Cannot delete system presets');
    }

    await ctx.db.delete(args.presetId);

    return { success: true };
  },
});

// Seed system presets (admin function)
export const seedSystemPresets = mutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();

    // Check if system presets already exist
    const existing = await ctx.db
      .query('presets')
      .withIndex('by_type', (q) => q.eq('type', 'system'))
      .first();

    if (existing) {
      return { seeded: 0, message: 'System presets already exist' };
    }

    const systemPresets = [
      {
        name: 'Minimal',
        description: 'Clean, simple ASCII art with minimal detail',
        settings: {
          style: 'minimal',
          width: 60,
          height: 20,
          fps: 8,
        },
      },
      {
        name: 'Standard',
        description: 'Balanced size and detail for general use',
        settings: {
          style: 'default',
          width: 80,
          height: 24,
          fps: 10,
        },
      },
      {
        name: 'Cinematic',
        description: 'Wide format with smooth animations',
        settings: {
          style: 'cinematic',
          width: 120,
          height: 40,
          fps: 24,
        },
      },
      {
        name: 'Retro',
        description: 'Classic terminal aesthetic',
        settings: {
          style: 'retro',
          width: 80,
          height: 25,
          fps: 12,
        },
      },
      {
        name: 'Matrix',
        description: 'Inspired by digital rain',
        settings: {
          style: 'matrix',
          width: 100,
          height: 40,
          fps: 15,
        },
        promptTemplate: 'Create {{subject}} with digital rain effects and cyberpunk aesthetic',
      },
      {
        name: 'Pixel',
        description: 'Blocky, pixel art inspired style',
        settings: {
          style: 'pixel',
          width: 64,
          height: 32,
          fps: 8,
        },
      },
    ];

    for (let i = 0; i < systemPresets.length; i++) {
      const preset = systemPresets[i];
      await ctx.db.insert('presets', {
        name: preset.name,
        description: preset.description,
        type: 'system',
        settings: preset.settings,
        promptTemplate: preset.promptTemplate,
        isEnabled: true,
        sortOrder: i + 1,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { seeded: systemPresets.length };
  },
});
