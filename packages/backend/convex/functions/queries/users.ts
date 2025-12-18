import { v } from 'convex/values';
import { query, internalQuery, type QueryCtx } from '../../_generated/server';

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const get = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
    .unique();
  return user;
}

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user;
}

// Internal query to get user by Clerk ID
export const getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

// Public query to get user by Clerk ID (for profile pages)
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

// Get public profile with stats and artworks
export const getPublicProfile = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { clerkId, limit }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      return null;
    }

    // Get all artworks by this user
    const allArtworks = await ctx.db
      .query("artworks")
      .withIndex("by_user", (q) => q.eq("userId", clerkId))
      .collect();

    // Calculate stats
    const publicArtworks = allArtworks.filter((a) => a.visibility === "public");
    const stats = {
      totalArtworks: allArtworks.length,
      publicArtworks: publicArtworks.length,
      totalLikes: allArtworks.reduce((sum, a) => sum + (a.likes ?? 0), 0),
      totalViews: allArtworks.reduce((sum, a) => sum + (a.views ?? 0), 0),
    };

    // Get public artworks sorted by creation time (most recent first)
    const artworkLimit = limit ?? 20;
    const sortedPublicArtworks = publicArtworks
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, artworkLimit);

    return {
      _id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      stats,
      artworks: sortedPublicArtworks,
    };
  },
});

