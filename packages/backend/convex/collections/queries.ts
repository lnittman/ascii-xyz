import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../artworks/queries";

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

// Create a new collection
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    const collectionId = await ctx.db.insert("collections", {
      userId: user._id,
      name: args.name,
      description: args.description,
      artworkIds: [],
      visibility: args.visibility || "private",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return collectionId;
  },
});

// Add artwork to collection
export const addArtwork = mutation({
  args: {
    collectionId: v.id("collections"),
    artworkId: v.id("artworks"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    const collection = await ctx.db.get(args.collectionId);
    if (!collection || collection.userId !== user._id) {
      throw new Error("Collection not found or unauthorized");
    }

    // Check if artwork exists and user owns it
    const artwork = await ctx.db.get(args.artworkId);
    if (!artwork || artwork.userId !== user._id) {
      throw new Error("Artwork not found or unauthorized");
    }

    // Add artwork if not already in collection
    if (!collection.artworkIds.includes(args.artworkId)) {
      await ctx.db.patch(args.collectionId, {
        artworkIds: [...collection.artworkIds, args.artworkId],
        updatedAt: new Date().toISOString(),
      });
    }
  },
});

// Remove artwork from collection
export const removeArtwork = mutation({
  args: {
    collectionId: v.id("collections"),
    artworkId: v.id("artworks"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    const collection = await ctx.db.get(args.collectionId);
    if (!collection || collection.userId !== user._id) {
      throw new Error("Collection not found or unauthorized");
    }

    await ctx.db.patch(args.collectionId, {
      artworkIds: collection.artworkIds.filter(id => id !== args.artworkId),
      updatedAt: new Date().toISOString(),
    });
  },
});

// Update collection
export const update = mutation({
  args: {
    id: v.id("collections"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    const collection = await ctx.db.get(args.id);
    if (!collection || collection.userId !== user._id) {
      throw new Error("Collection not found or unauthorized");
    }

    type CollectionUpdate = Partial<{
      name: string;
      description?: string;
      visibility: "public" | "private";
      updatedAt: string;
    }>;

    const updates: CollectionUpdate = {
      updatedAt: new Date().toISOString(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.visibility !== undefined) updates.visibility = args.visibility;

    await ctx.db.patch(args.id, updates);
  },
});

// Delete collection
export const remove = mutation({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    const collection = await ctx.db.get(args.id);
    if (!collection || collection.userId !== user._id) {
      throw new Error("Collection not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
