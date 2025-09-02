import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { getUserId } from "../../lib/auth";

// Generate a shareable link for an artwork
export const create = mutation({
  args: {
    artworkId: v.id("artworks"),
    expiresIn: v.optional(v.number()), // hours
    maxViews: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    // Verify user owns the artwork
    const artwork = await ctx.db.get(args.artworkId);
    if (!artwork || artwork.userId !== user._id) {
      throw new Error("Artwork not found or unauthorized");
    }

    // Generate unique share code
    const shareCode = generateShareCode();

    // Calculate expiration if specified
    let expiresAt: string | undefined;
    if (args.expiresIn) {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + args.expiresIn);
      expiresAt = expirationDate.toISOString();
    }

    const shareId = await ctx.db.insert("shares", {
      artworkId: args.artworkId,
      shareCode,
      expiresAt,
      maxViews: args.maxViews,
      viewCount: 0,
      createdAt: new Date().toISOString(),
    });

    return { shareId, shareCode };
  },
});

// Get artwork by share code
export const getByCode = query({
  args: { shareCode: v.string() },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("shares")
      .withIndex("by_share_code", (q) => q.eq("shareCode", args.shareCode))
      .unique();

    if (!share) {
      return null;
    }

    // Check if expired
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return null;
    }

    // Check if max views reached
    if (share.maxViews && share.viewCount >= share.maxViews) {
      return null;
    }

    // Get the artwork
    const artwork = await ctx.db.get(share.artworkId);
    if (!artwork) {
      return null;
    }

    // Note: View count increment should be done in a separate mutation
    // to keep this as a pure query
    return artwork;
  },
});

// List all shares for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) return [];

    // Get user's artworks
    const artworks = await ctx.db
      .query("artworks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const artworkIds = artworks.map(a => a._id);

    // Get shares for those artworks
    const shares = [];
    for (const artworkId of artworkIds) {
      const artworkShares = await ctx.db
        .query("shares")
        .withIndex("by_artwork", (q) => q.eq("artworkId", artworkId))
        .collect();
      shares.push(...artworkShares);
    }

    // Add artwork titles to shares
    return shares.map(share => {
      const artwork = artworks.find(a => a._id === share.artworkId);
      return {
        ...share,
        artworkPrompt: artwork?.prompt || "Unknown",
      };
    });
  },
});

// Revoke a share
export const revoke = mutation({
  args: { shareId: v.id("shares") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    const share = await ctx.db.get(args.shareId);
    if (!share) {
      throw new Error("Share not found");
    }

    // Verify user owns the artwork
    const artwork = await ctx.db.get(share.artworkId);
    if (!artwork || artwork.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.shareId);
  },
});

// Helper function to generate unique share codes
function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
