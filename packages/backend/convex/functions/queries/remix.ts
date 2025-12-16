import { v } from 'convex/values';
import { query } from '../../_generated/server';

// Get remix history for an artwork (all remixes derived from this artwork)
export const getRemixHistory = query({
  args: {
    artworkId: v.id("artworks"),
  },
  handler: async (ctx, args) => {
    // Find all remixes of this artwork
    const remixes = await ctx.db
      .query("remixes")
      .filter(q => q.eq(q.field("sourceArtworkId"), args.artworkId))
      .order("desc")
      .collect();

    // Get the artwork details for each remix
    const remixArtworks = await Promise.all(
      remixes.map(async (remix) => {
        const artwork = await ctx.db.get(remix.remixArtworkId);
        return {
          ...remix,
          artwork,
        };
      })
    );

    return remixArtworks.filter(r => r.artwork !== null);
  },
});

// Get combination history for an artwork (all combinations involving this artwork)
export const getCombinationHistory = query({
  args: {
    artworkId: v.id("artworks"),
  },
  handler: async (ctx, args) => {
    // Find all combinations involving this artwork
    const combinations = await ctx.db
      .query("combinations")
      .collect();

    // Filter to combinations that include this artwork
    const relevantCombinations = combinations.filter(combo =>
      combo.sourceArtworkIds.includes(args.artworkId)
    );

    // Get the combined artwork details
    const combinedArtworks = await Promise.all(
      relevantCombinations.map(async (combo) => {
        const artwork = await ctx.db.get(combo.combinedArtworkId);
        return {
          ...combo,
          artwork,
        };
      })
    );

    return combinedArtworks.filter(c => c.artwork !== null);
  },
});

// Get source artworks for a remixed/combined piece (lineage)
export const getLineage = query({
  args: {
    artworkId: v.id("artworks"),
  },
  handler: async (ctx, args) => {
    const artwork = await ctx.db.get(args.artworkId);
    if (!artwork) {
      return { remixedFrom: null, combinedFrom: [] };
    }

    const metadata = artwork.metadata as any;

    // Get remix source if this is a remix
    let remixedFrom = null;
    if (metadata?.remixedFrom) {
      remixedFrom = await ctx.db.get(metadata.remixedFrom);
    }

    // Get combination sources if this is a combination
    const combinedFrom = [];
    if (metadata?.combinedFrom && Array.isArray(metadata.combinedFrom)) {
      for (const sourceId of metadata.combinedFrom) {
        const source = await ctx.db.get(sourceId);
        if (source) {
          combinedFrom.push(source);
        }
      }
    }

    return { remixedFrom, combinedFrom };
  },
});
