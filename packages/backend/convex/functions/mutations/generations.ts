import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";

// Internal mutations for managing generation records
export const createGeneration = internalMutation({
  args: {
    userId: v.optional(v.string()),
    prompt: v.string(),
    modelId: v.string(),
    status: v.literal("planning"),
  },
  handler: async (ctx, { userId, prompt, modelId, status }) => {
    const generationId = await ctx.db.insert("artworkGenerations", {
      userId,
      prompt,
      modelId,
      status,
      frames: [],
      currentFrame: 0,
      totalFrames: 0,
      createdAt: new Date().toISOString(),
    });
    return generationId;
  },
});

export const updateGeneration = internalMutation({
  args: {
    generationId: v.id("artworkGenerations"),
    status: v.optional(v.union(
      v.literal("planning"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    )),
    plan: v.optional(v.object({
      interpretation: v.string(),
      style: v.string(),
      movement: v.any(),
      frameCount: v.number(),
      width: v.number(),
      height: v.number(),
      fps: v.number(),
      characters: v.array(v.string()),
      colorHints: v.optional(v.any()),
      metadata: v.optional(v.any()),
    })),
    totalFrames: v.optional(v.number()),
    error: v.optional(v.string()),
    completedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { generationId, ...updates } = args;
    await ctx.db.patch(generationId, updates);
  },
});

export const updateGenerationFrame = internalMutation({
  args: {
    generationId: v.id("artworkGenerations"),
    frame: v.string(),
    frameIndex: v.number(),
  },
  handler: async (ctx, { generationId, frame, frameIndex }) => {
    const generation = await ctx.db.get(generationId);
    if (!generation) return;
    
    const frames = [...generation.frames];
    frames[frameIndex] = frame;
    
    await ctx.db.patch(generationId, {
      frames,
      currentFrame: frameIndex + 1,
    });
  },
});