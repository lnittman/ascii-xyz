import { query } from "../../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../../lib/auth";

// Get all collections for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();

    if (!user) {
      return [];
    }

    const collections = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return collections;
  },
});

// Get a single collection with its artworks
export const get = query({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.id);
    if (!collection) return null;

    // Check if user has access
    const userId = await getUserId(ctx);
    if (collection.visibility === "private") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId || ""))
        .unique();

      if (!user || collection.userId !== user._id) {
        return null;
      }
    }

    // Get all artworks in the collection
    const artworks = await Promise.all(
      collection.artworkIds.map(id => ctx.db.get(id))
    );

    return {
      ...collection,
      artworks: artworks.filter(Boolean),
    };
  },
});

// Get public collections
export const getPublic = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
      .order("desc")
      .take(args.limit || 20);

    return collections;
  },
});
