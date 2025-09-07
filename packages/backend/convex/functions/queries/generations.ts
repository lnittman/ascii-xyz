import { query } from "../../_generated/server";
import { v } from "convex/values";

// Subscribe to a generation's progress
export const getGeneration = query({
  args: {
    generationId: v.id("artworkGenerations"),
  },
  handler: async (ctx, { generationId }) => {
    const generation = await ctx.db.get(generationId);
    if (!generation) return null;
    
    // Don't expose API key
    const { apiKey, ...safeGeneration } = generation;
    return safeGeneration;
  },
});

// Get user's recent generations
export const getUserGenerations = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 10 }) => {
    const generations = await ctx.db
      .query("artworkGenerations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
    
    // Remove API keys from results
    return generations.map(({ apiKey, ...gen }) => gen);
  },
});

// Get active generations (for admin/monitoring)
export const getActiveGenerations = query({
  args: {},
  handler: async (ctx) => {
    const activeGenerations = await ctx.db
      .query("artworkGenerations")
      .withIndex("by_status")
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "planning"),
          q.eq(q.field("status"), "generating")
        )
      )
      .order("desc")
      .take(20);
    
    // Remove API keys from results
    return activeGenerations.map(({ apiKey, ...gen }) => gen);
  },
});