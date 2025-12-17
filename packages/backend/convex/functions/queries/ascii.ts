import { v } from 'convex/values';
import { query } from '../../_generated/server';
import { canUserAccessArtwork } from "../../lib/ascii";

// Get user's artworks
export const list = query({
  args: {
    userId: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("unlisted"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let baseQuery = ctx.db.query("artworks");

    // Filter by user if provided
    if (args.userId) {
      baseQuery = baseQuery.filter(q => q.eq(q.field("userId"), args.userId));
    }

    // Filter by visibility
    if (args.visibility) {
      baseQuery = baseQuery.filter(q => q.eq(q.field("visibility"), args.visibility));
    }

    // Order by creation time
    const orderedQuery = baseQuery.order("desc");

    // Apply limit
    const results = args.limit 
      ? await orderedQuery.take(args.limit)
      : await orderedQuery.collect();

    return results;
  },
});

// Get single artwork
export const get = query({
  args: {
    id: v.id("artworks"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const artwork = await ctx.db.get(args.id);
    
    if (!artwork) {
      return null;
    }

    // Check access permissions
    if (!canUserAccessArtwork(artwork, args.userId || null)) {
      return null;
    }

    return artwork;
  },
});

// Get public gallery
export const getPublic = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("artworks")
      .filter(q => q.eq(q.field("visibility"), "public"))
      .order("desc");

    const results = args.limit 
      ? await query.take(args.limit)
      : await query.take(20); // Default limit

    return results;
  },
});

// Search artworks using Convex search index
export const search = query({
  args: {
    query: v.string(),
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Use Convex search index for efficient full-text search
    let searchQuery = ctx.db
      .query("artworks")
      .withSearchIndex("search_prompt", (q) => {
        let search = q.search("prompt", args.query);

        // Filter by user or show public only
        if (args.userId) {
          search = search.eq("userId", args.userId);
        } else {
          search = search.eq("visibility", "public");
        }

        return search;
      });

    const results = await searchQuery.take(args.limit || 20);
    return results;
  },
});

// Get multiple artworks by IDs
export const getMany = query({
  args: {
    ids: v.array(v.id("artworks")),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const artworks = await Promise.all(
      args.ids.map(async (id) => {
        const artwork = await ctx.db.get(id);
        if (!artwork) return null;
        // Check access permissions
        if (!canUserAccessArtwork(artwork, args.userId || null)) {
          return null;
        }
        return artwork;
      })
    );
    // Filter out nulls and maintain order
    return artworks.filter((a): a is NonNullable<typeof a> => a !== null);
  },
});

// Get trending artworks
export const getTrending = query({
  args: {
    limit: v.optional(v.number()),
    timeframe: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args) => {
    // Calculate time threshold
    const now = Date.now();
    const timeframe = args.timeframe || "week";
    const threshold = {
      day: now - 24 * 60 * 60 * 1000,
      week: now - 7 * 24 * 60 * 60 * 1000,
      month: now - 30 * 24 * 60 * 60 * 1000,
    }[timeframe];

    // Get public artworks sorted by popularity
    const results = await ctx.db
      .query("artworks")
      .filter(q => q.eq(q.field("visibility"), "public"))
      .order("desc")
      .take(100); // Get more to filter

    // Sort by engagement (views + likes)
    const sorted = results
      .filter(artwork => artwork._creationTime >= threshold)
      .sort((a, b) => {
        const scoreA = (a.views || 0) + (a.likes || 0) * 10;
        const scoreB = (b.views || 0) + (b.likes || 0) * 10;
        return scoreB - scoreA;
      });

    return sorted.slice(0, args.limit || 10);
  },
});
