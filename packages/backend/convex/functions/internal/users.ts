import { internalMutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { UserJSON } from '@clerk/backend';

export const upsertFromClerk = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const clerkData = data as UserJSON;
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkData.id))
      .unique();

    const userAttributes = {
      clerkId: clerkData.id,
      email: clerkData.email_addresses[0]?.email_address || '',
      name:
        `${clerkData.first_name || ''} ${clerkData.last_name || ''}`.trim() ||
        undefined,
      imageUrl: clerkData.image_url || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (existingUser) {
      await ctx.db.patch(existingUser._id, userAttributes);
      return existingUser._id;
    }

    const userId = await ctx.db.insert('users', {
      ...userAttributes,
      createdAt: new Date().toISOString(),
    });

    await ctx.db.insert('userSettings', {
      userId,
      theme: 'dark',
      defaultVisibility: 'private',
      emailNotifications: true,
      updatedAt: new Date().toISOString(),
    });

    return userId;
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkUserId))
      .unique();
    if (!user) return;

    const artworks = await ctx.db
      .query('artworks')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();
    for (const artwork of artworks) {
      await ctx.db.delete(artwork._id);
      const embeddings = await ctx.db
        .query('artworkEmbeddings')
        .withIndex('by_artwork', (q) => q.eq('artworkId', artwork._id))
        .collect();
      for (const embedding of embeddings) {
        await ctx.db.delete(embedding._id);
      }
      const shares = await ctx.db
        .query('shares')
        .withIndex('by_artwork', (q) => q.eq('artworkId', artwork._id))
        .collect();
      for (const share of shares) {
        await ctx.db.delete(share._id);
      }
    }

    const collections = await ctx.db
      .query('collections')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();
    for (const collection of collections) {
      await ctx.db.delete(collection._id);
    }

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .unique();
    if (settings) {
      await ctx.db.delete(settings._id);
    }

    await ctx.db.delete(user._id);
  },
});

