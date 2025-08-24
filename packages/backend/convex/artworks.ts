import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { Auth } from "convex/server";
import { internal } from "./_generated/api";
import { 
  validateFrames, 
  parseAIResponse, 
  formatArtworkForExport,
  canUserAccessArtwork,
  generateDefaultFrame 
} from "./lib/ascii";

// Helper to get user ID from auth
export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

// Get all artworks for the current user
export const list = query({
  args: {
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) return [];

    let query = ctx.db
      .query("artworks")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    const artworks = await query.collect();

    // Filter by visibility if specified
    if (args.visibility) {
      return artworks.filter(a => a.visibility === args.visibility);
    }

    return artworks;
  },
});

// Get a single artwork
export const get = query({
  args: { id: v.id("artworks") },
  handler: async (ctx, args) => {
    const artwork = await ctx.db.get(args.id);
    if (!artwork) return null;

    // Check if user has access
    const userId = await getUserId(ctx);
    if (artwork.visibility === "private") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId || ""))
        .unique();
      
      if (!user || artwork.userId !== user._id) {
        return null;
      }
    }

    return artwork;
  },
});

// Get public artworks (for gallery)
export const getPublic = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const artworks = await ctx.db
      .query("artworks")
      .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
      .order("desc")
      .take(limit);

    return artworks;
  },
});

// Create a new artwork
export const create = mutation({
  args: {
    prompt: v.string(),
    frames: v.array(v.string()),
    metadata: v.object({
      width: v.number(),
      height: v.number(),
      fps: v.number(),
      generator: v.string(),
      model: v.string(),
      style: v.optional(v.string()),
    }),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    // Get user settings for default visibility
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const visibility = args.visibility || settings?.defaultVisibility || "private";

    const artworkId = await ctx.db.insert("artworks", {
      userId: user._id,
      prompt: args.prompt,
      frames: args.frames,
      metadata: {
        ...args.metadata,
        createdAt: new Date().toISOString(),
      },
      visibility,
      likes: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Log generation for analytics
    await ctx.db.insert("generations", {
      userId: user._id,
      prompt: args.prompt,
      success: true,
      duration: 0, // Will be updated by the action
      model: args.metadata.model,
      createdAt: new Date().toISOString(),
    });

    return artworkId;
  },
});

// Update artwork visibility
export const updateVisibility = mutation({
  args: {
    id: v.id("artworks"),
    visibility: v.union(v.literal("public"), v.literal("private")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    const artwork = await ctx.db.get(args.id);
    if (!artwork || artwork.userId !== user._id) {
      throw new Error("Artwork not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      visibility: args.visibility,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Delete artwork
export const remove = mutation({
  args: { id: v.id("artworks") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    const artwork = await ctx.db.get(args.id);
    if (!artwork || artwork.userId !== user._id) {
      throw new Error("Artwork not found or unauthorized");
    }

    // Delete embeddings
    const embeddings = await ctx.db
      .query("artworkEmbeddings")
      .withIndex("by_artwork", (q) => q.eq("artworkId", args.id))
      .collect();
    
    for (const embedding of embeddings) {
      await ctx.db.delete(embedding._id);
    }

    // Delete shares
    const shares = await ctx.db
      .query("shares")
      .withIndex("by_artwork", (q) => q.eq("artworkId", args.id))
      .collect();
    
    for (const share of shares) {
      await ctx.db.delete(share._id);
    }

    // Delete files
    const files = await ctx.db
      .query("files")
      .withIndex("by_artwork", (q) => q.eq("artworkId", args.id))
      .collect();
    
    for (const file of files) {
      await ctx.db.delete(file._id);
      // Also delete from storage
      await ctx.storage.delete(file.storageId);
    }

    // Delete the artwork
    await ctx.db.delete(args.id);
  },
});

// Search artworks by prompt
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const limit = args.limit || 20;

    // Search public artworks and user's own artworks
    const results = await ctx.db
      .query("artworks")
      .withSearchIndex("search_prompt", (q) => 
        q.search("prompt", args.query)
      )
      .take(limit);

    // Filter based on visibility and ownership
    if (userId) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
        .unique();
      
      if (user) {
        return results.filter(artwork => 
          artwork.visibility === "public" || artwork.userId === user._id
        );
      }
    }

    // Only return public artworks for unauthenticated users
    return results.filter(artwork => artwork.visibility === "public");
  },
});