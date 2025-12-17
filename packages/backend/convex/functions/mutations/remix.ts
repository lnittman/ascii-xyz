import { v } from 'convex/values';
import { mutation } from '../../_generated/server';
import { api } from '../../_generated/api';
import { validateFrames } from '../../lib/ascii';

// Save a remixed artwork with source tracking
export const saveRemix = mutation({
  args: {
    userId: v.string(),
    sourceArtworkId: v.id("artworks"),
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
      model: v.string(),
      remixType: v.string(), // "variation", "enhancement", "stylize", etc.
    }),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("unlisted"))),
  },
  handler: async (ctx, args) => {
    // Validate frames
    if (!validateFrames(args.frames)) {
      throw new Error("Invalid frames format");
    }

    // Get source artwork for attribution
    const sourceArtwork = await ctx.db.get(args.sourceArtworkId);
    if (!sourceArtwork) {
      throw new Error("Source artwork not found");
    }

    // Create remixed artwork with source reference
    const artworkId = await ctx.db.insert("artworks", {
      userId: args.userId,
      prompt: args.prompt,
      frames: args.frames,
      metadata: {
        width: args.metadata.width,
        height: args.metadata.height,
        fps: args.metadata.fps,
        generator: "ai-remix",
        model: args.metadata.model,
        style: args.metadata.style,
        createdAt: new Date().toISOString(),
        remixedFrom: args.sourceArtworkId,
        remixType: args.metadata.remixType,
      },
      visibility: args.visibility || "private",
      featured: false,
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Track remix relationship
    await ctx.db.insert("remixes", {
      sourceArtworkId: args.sourceArtworkId,
      remixArtworkId: artworkId,
      userId: args.userId,
      remixType: args.metadata.remixType,
      prompt: args.prompt,
      createdAt: new Date().toISOString(),
    });

    // Schedule embedding generation (async, non-blocking)
    await ctx.scheduler.runAfter(0, api.embeddings.generateForArtwork, {
      artworkId,
    });

    return artworkId;
  },
});

// Save a combined artwork from two sources
export const saveCombination = mutation({
  args: {
    userId: v.string(),
    sourceArtworkIds: v.array(v.id("artworks")),
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
      model: v.string(),
      combinationType: v.string(), // "blend", "sequence", "overlay", "interleave"
      blendRatio: v.optional(v.number()), // 0.0-1.0 for blending
    }),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("unlisted"))),
  },
  handler: async (ctx, args) => {
    // Validate we have exactly 2 sources
    if (args.sourceArtworkIds.length !== 2) {
      throw new Error("Combination requires exactly 2 source artworks");
    }

    // Validate frames
    if (!validateFrames(args.frames)) {
      throw new Error("Invalid frames format");
    }

    // Get source artworks for attribution
    const [source1, source2] = await Promise.all(
      args.sourceArtworkIds.map(id => ctx.db.get(id))
    );

    if (!source1 || !source2) {
      throw new Error("One or more source artworks not found");
    }

    // Create combined artwork with source references
    const artworkId = await ctx.db.insert("artworks", {
      userId: args.userId,
      prompt: args.prompt,
      frames: args.frames,
      metadata: {
        width: args.metadata.width,
        height: args.metadata.height,
        fps: args.metadata.fps,
        generator: "ai-combine",
        model: args.metadata.model,
        style: args.metadata.style,
        createdAt: new Date().toISOString(),
        combinedFrom: args.sourceArtworkIds,
        combinationType: args.metadata.combinationType,
        blendRatio: args.metadata.blendRatio,
      },
      visibility: args.visibility || "private",
      featured: false,
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Track combination relationship
    await ctx.db.insert("combinations", {
      sourceArtworkIds: args.sourceArtworkIds,
      combinedArtworkId: artworkId,
      userId: args.userId,
      combinationType: args.metadata.combinationType,
      blendRatio: args.metadata.blendRatio,
      prompt: args.prompt,
      createdAt: new Date().toISOString(),
    });

    // Schedule embedding generation (async, non-blocking)
    await ctx.scheduler.runAfter(0, api.embeddings.generateForArtwork, {
      artworkId,
    });

    return artworkId;
  },
});

