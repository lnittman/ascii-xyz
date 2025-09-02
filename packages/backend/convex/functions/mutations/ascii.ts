import { v } from 'convex/values';
import { mutation } from '../../_generated/server';
import { validateFrames } from '../../lib/ascii';

// Save generated ASCII artwork
export const save = mutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    frames: v.array(v.string()),
    metadata: v.object({
      width: v.number(),
      height: v.number(),
      frameCount: v.number(),
      fps: v.number(),
      interpretation: v.string(),
      style: v.string(),
      movement: v.string(),
      characters: v.array(v.string()),
      colorHints: v.optional(v.string()),
      metadata: v.optional(v.object({
        mood: v.string(),
        complexity: v.string(),
        dynamism: v.string(),
      })),
      generatedAt: v.string(),
      model: v.string(),
    }),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("unlisted"))),
  },
  handler: async (ctx, args) => {
    // Validate frames
    if (!validateFrames(args.frames)) {
      throw new Error("Invalid frames format");
    }

    // Create artwork document with full AI metadata
    const artworkId = await ctx.db.insert("artworks", {
      userId: args.userId,
      prompt: args.prompt,
      frames: args.frames,
      metadata: {
        width: args.metadata.width,
        height: args.metadata.height,
        fps: args.metadata.fps,
        generator: "ai-driven",
        model: args.metadata.model,
        style: args.metadata.style,
        createdAt: args.metadata.generatedAt,
      },
      visibility: args.visibility || "private",
      featured: false,
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return artworkId;
  },
});

// Update artwork visibility
export const updateVisibility = mutation({
  args: {
    id: v.id("artworks"),
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("unlisted")),
  },
  handler: async (ctx, args) => {
    const artwork = await ctx.db.get(args.id);
    if (!artwork) {
      throw new Error("Artwork not found");
    }

    await ctx.db.patch(args.id, {
      visibility: args.visibility,
    });

    return { success: true };
  },
});

// Delete artwork
export const remove = mutation({
  args: {
    id: v.id("artworks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const artwork = await ctx.db.get(args.id);
    
    if (!artwork) {
      throw new Error("Artwork not found");
    }
    
    if (artwork.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
    
    return { success: true };
  },
});

// Increment view count
export const incrementViews = mutation({
  args: {
    id: v.id("artworks"),
  },
  handler: async (ctx, args) => {
    const artwork = await ctx.db.get(args.id);
    if (!artwork) {
      return;
    }

    await ctx.db.patch(args.id, {
      views: (artwork.views || 0) + 1,
    });
  },
});

// Toggle like
export const toggleLike = mutation({
  args: {
    id: v.id("artworks"),
    userId: v.string(),
    liked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const artwork = await ctx.db.get(args.id);
    if (!artwork) {
      return;
    }

    const increment = args.liked ? 1 : -1;
    await ctx.db.patch(args.id, {
      likes: Math.max(0, (artwork.likes || 0) + increment),
    });
  },
});
