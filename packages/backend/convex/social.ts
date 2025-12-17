import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./lib/auth";

// Note: Aggregate components (aggregateLikes, aggregateUserStats) are configured in convex.config.ts
// but not used here for simplicity. At scale, they would provide O(log n) lookups for leaderboards.
// For now, we use standard Convex queries which work well for smaller datasets.

// ==================== LIKES ====================

// Toggle like on an artwork
export const toggleLike = mutation({
  args: {
    artworkId: v.id("artworks"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const artwork = await ctx.db.get(args.artworkId);
    if (!artwork) throw new Error("Artwork not found");

    // Check if already liked
    const existingLike = await ctx.db
      .query("artworkLikes")
      .withIndex("by_user_artwork", (q) =>
        q.eq("userId", userId).eq("artworkId", args.artworkId)
      )
      .unique();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      const newLikes = Math.max(0, (artwork.likes ?? 0) - 1);
      await ctx.db.patch(args.artworkId, { likes: newLikes });

      return { liked: false, likes: newLikes };
    } else {
      // Like
      await ctx.db.insert("artworkLikes", {
        artworkId: args.artworkId,
        userId,
        createdAt: new Date().toISOString(),
      });
      const newLikes = (artwork.likes ?? 0) + 1;
      await ctx.db.patch(args.artworkId, { likes: newLikes });

      return { liked: true, likes: newLikes };
    }
  },
});

// Check if user has liked an artwork
export const hasLiked = query({
  args: {
    artworkId: v.id("artworks"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return false;

    const like = await ctx.db
      .query("artworkLikes")
      .withIndex("by_user_artwork", (q) =>
        q.eq("userId", userId).eq("artworkId", args.artworkId)
      )
      .unique();

    return !!like;
  },
});

// Get likes for an artwork with likers
export const getLikes = query({
  args: {
    artworkId: v.id("artworks"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const artwork = await ctx.db.get(args.artworkId);
    if (!artwork) return { count: 0, recentLikers: [] };

    const likes = await ctx.db
      .query("artworkLikes")
      .withIndex("by_artwork", (q) => q.eq("artworkId", args.artworkId))
      .order("desc")
      .take(args.limit ?? 10);

    return {
      count: artwork.likes ?? 0,
      recentLikers: likes.map((l) => l.userId),
    };
  },
});

// ==================== VIEWS ====================

// Increment view count for an artwork
export const incrementView = mutation({
  args: {
    artworkId: v.id("artworks"),
  },
  handler: async (ctx, args) => {
    const artwork = await ctx.db.get(args.artworkId);
    if (!artwork) throw new Error("Artwork not found");

    const newViews = (artwork.views ?? 0) + 1;
    await ctx.db.patch(args.artworkId, { views: newViews });

    return { views: newViews };
  },
});

// ==================== LEADERBOARDS ====================

// Get top artworks by likes (public only)
export const getTopByLikes = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // Get artworks sorted by likes descending
    const artworks = await ctx.db
      .query("artworks")
      .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
      .order("desc")
      .take(100); // Get more to filter

    // Sort by likes and take top N
    const sorted = artworks
      .filter((a) => a.visibility === "public")
      .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
      .slice(0, limit);

    return sorted;
  },
});

// Get trending artworks (recent + likes weighted)
export const getTrending = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Get recent public artworks
    const artworks = await ctx.db
      .query("artworks")
      .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
      .order("desc")
      .take(200);

    // Score by: recency + likes (weighted)
    const scored = artworks
      .filter((a) => a.visibility === "public" && a.createdAt >= oneDayAgo)
      .map((artwork) => {
        const hoursOld =
          (Date.now() - new Date(artwork.createdAt).getTime()) / (1000 * 60 * 60);
        const recencyScore = Math.max(0, 24 - hoursOld) / 24; // 1 for new, 0 for 24h old
        const likesScore = Math.log1p(artwork.likes ?? 0) / 5; // Logarithmic
        const viewsScore = Math.log1p(artwork.views ?? 0) / 10;
        return {
          artwork,
          score: recencyScore * 0.4 + likesScore * 0.4 + viewsScore * 0.2,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.artwork);

    return scored;
  },
});

// ==================== USER STATS ====================

// Get stats for a user
export const getUserStats = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = args.userId ?? (await getUserId(ctx));
    if (!userId) return null;

    // Count artworks by this user
    const artworks = await ctx.db
      .query("artworks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalArtworks = artworks.length;
    const publicArtworks = artworks.filter((a) => a.visibility === "public").length;
    const totalLikes = artworks.reduce((sum, a) => sum + (a.likes ?? 0), 0);
    const totalViews = artworks.reduce((sum, a) => sum + (a.views ?? 0), 0);

    // Get collections count
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();

    let collectionsCount = 0;
    if (user) {
      const collections = await ctx.db
        .query("collections")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      collectionsCount = collections.length;
    }

    return {
      userId,
      totalArtworks,
      publicArtworks,
      totalLikes,
      totalViews,
      collectionsCount,
    };
  },
});

// ==================== AGGREGATE SYNC ====================
// Note: Aggregate sync functions are not yet implemented.
// When scaling is needed, use the aggregate components configured in convex.config.ts
// to maintain O(log n) leaderboards and stats.
