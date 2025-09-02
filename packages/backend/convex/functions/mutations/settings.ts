import { mutation } from '../../_generated/server';
import { v } from 'convex/values';

export const update = mutation({
  args: {
    theme: v.optional(v.union(v.literal('light'), v.literal('dark'), v.literal('system'))),
    defaultVisibility: v.optional(v.union(v.literal('public'), v.literal('private'))),
    emailNotifications: v.optional(v.boolean()),
    preferredModel: v.optional(v.string()),
    preferredProvider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;
    if (!userId) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', userId))
      .unique();
    if (!user) throw new Error('User not found');

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .unique();

    type UserSettingsUpdate = Partial<{
      theme: 'light' | 'dark' | 'system';
      defaultVisibility: 'public' | 'private';
      emailNotifications: boolean;
      preferredModel?: string;
      preferredProvider?: string;
      apiKeys: Array<{ name: string; key: string; provider: string; createdAt: string }>;
      updatedAt: string;
    }>;

    const updates: UserSettingsUpdate = { updatedAt: new Date().toISOString() };
    if (args.theme !== undefined) updates.theme = args.theme;
    if (args.defaultVisibility !== undefined) updates.defaultVisibility = args.defaultVisibility;
    if (args.emailNotifications !== undefined) updates.emailNotifications = args.emailNotifications;
    if (args.preferredModel !== undefined) updates.preferredModel = args.preferredModel;
    if (args.preferredProvider !== undefined) updates.preferredProvider = args.preferredProvider;

    if (settings) {
      await ctx.db.patch(settings._id, updates);
    } else {
      await ctx.db.insert('userSettings', {
        userId: user._id,
        theme: args.theme || 'dark',
        defaultVisibility: args.defaultVisibility || 'private',
        emailNotifications: args.emailNotifications ?? true,
        updatedAt: new Date().toISOString(),
      });
    }
  },
});

export const addApiKey = mutation({
  args: {
    name: v.string(),
    key: v.string(),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;
    if (!userId) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', userId))
      .unique();
    if (!user) throw new Error('User not found');

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .unique();

    const newApiKey = {
      name: args.name,
      key: args.key,
      provider: args.provider,
      createdAt: new Date().toISOString(),
    };

    if (settings) {
      const apiKeys = settings.apiKeys || [];
      await ctx.db.patch(settings._id, {
        apiKeys: [...apiKeys, newApiKey],
        updatedAt: new Date().toISOString(),
      });
    } else {
      await ctx.db.insert('userSettings', {
        userId: user._id,
        theme: 'dark',
        defaultVisibility: 'private',
        emailNotifications: true,
        apiKeys: [newApiKey],
        updatedAt: new Date().toISOString(),
      });
    }
  },
});

export const removeApiKey = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;
    if (!userId) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', userId))
      .unique();
    if (!user) throw new Error('User not found');

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .unique();

    if (settings && settings.apiKeys) {
      const filteredKeys = settings.apiKeys.filter((key) => key.name !== args.name);
      await ctx.db.patch(settings._id, {
        apiKeys: filteredKeys,
        updatedAt: new Date().toISOString(),
      });
    }
  },
});

