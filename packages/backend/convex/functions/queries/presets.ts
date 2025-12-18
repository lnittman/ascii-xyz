import { v } from 'convex/values';
import { query } from '../../_generated/server';

// List all system presets (enabled only)
export const listSystemPresets = query({
  args: {},
  handler: async (ctx) => {
    const presets = await ctx.db
      .query('presets')
      .withIndex('by_type', (q) => q.eq('type', 'system').eq('isEnabled', true))
      .collect();

    return presets.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// List user presets for a specific user
export const listUserPresets = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const presets = await ctx.db
      .query('presets')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    return presets.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// List all presets available to a user (system + their own)
export const listAllPresets = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Get system presets
    const systemPresets = await ctx.db
      .query('presets')
      .withIndex('by_type', (q) => q.eq('type', 'system').eq('isEnabled', true))
      .collect();

    // Get user's presets
    const userPresets = await ctx.db
      .query('presets')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    // Combine and sort
    const allPresets = [...systemPresets, ...userPresets];
    return allPresets.sort((a, b) => {
      // System presets first, then user presets
      if (a.type !== b.type) {
        return a.type === 'system' ? -1 : 1;
      }
      return a.sortOrder - b.sortOrder;
    });
  },
});

// Get a specific preset by ID
export const getPreset = query({
  args: {
    presetId: v.id('presets'),
  },
  handler: async (ctx, args) => {
    return ctx.db.get(args.presetId);
  },
});
