import { v } from 'convex/values';
import { action, internalAction, internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import { components } from './_generated/api';
import { ActionCache } from '@convex-dev/action-cache';
import { Id } from './_generated/dataModel';

// Internal action to call OpenAI embeddings API
export const embed = internalAction({
  args: { text: v.string() },
  handler: async (_ctx, { text }): Promise<number[]> => {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY or OPENROUTER_API_KEY environment variable not set!');
    }

    // Use OpenAI API directly for embeddings (OpenRouter doesn't support embeddings)
    const resp = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002',
      }),
    });

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(`OpenAI API error: ${msg}`);
    }

    const json = await resp.json();
    const vector = json.data[0].embedding as number[];
    console.log(`Computed embedding for "${text.slice(0, 50)}...": ${vector.length} dimensions`);
    return vector;
  },
});

// Create embeddings cache with 7-day TTL
const embeddingsCache = new ActionCache(components.actionCache, {
  action: internal.embeddings.embed,
  name: 'embed-v1',
  ttl: 1000 * 60 * 60 * 24 * 7, // 7 days
});

// Store embedding in database
export const storeEmbedding = internalMutation({
  args: {
    artworkId: v.id('artworks'),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, { artworkId, embedding }) => {
    // Check if embedding already exists
    const existing = await ctx.db
      .query('artworkEmbeddings')
      .withIndex('by_artwork', (q) => q.eq('artworkId', artworkId))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        embedding,
        model: 'text-embedding-ada-002',
        createdAt: new Date().toISOString(),
      });
      return existing._id;
    }

    // Create new
    return await ctx.db.insert('artworkEmbeddings', {
      artworkId,
      embedding,
      model: 'text-embedding-ada-002',
      createdAt: new Date().toISOString(),
    });
  },
});

// Generate and store embedding for an artwork
export const generateForArtwork = action({
  args: { artworkId: v.id('artworks') },
  handler: async (ctx, { artworkId }): Promise<void> => {
    // Get artwork
    const artwork = await ctx.runQuery(internal.embeddings.getArtwork, { artworkId });
    if (!artwork) {
      throw new Error(`Artwork ${artworkId} not found`);
    }

    // Generate embedding using cache
    const embedding = await embeddingsCache.fetch(ctx, { text: artwork.prompt });

    // Store in database
    await ctx.runMutation(internal.embeddings.storeEmbedding, {
      artworkId,
      embedding,
    });
  },
});

// Internal query to get artwork
export const getArtwork = internalQuery({
  args: { artworkId: v.id('artworks') },
  handler: async (ctx, { artworkId }) => {
    return await ctx.db.get(artworkId);
  },
});

// Find similar artworks using vector search
export const findSimilar = action({
  args: {
    artworkId: v.id('artworks'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { artworkId, limit = 10 }): Promise<Array<{ _id: Id<'artworks'>; _score: number }>> => {
    // Get artwork
    const artwork = await ctx.runQuery(internal.embeddings.getArtwork, { artworkId });
    if (!artwork) {
      throw new Error(`Artwork ${artworkId} not found`);
    }

    // Get embedding using cache
    const embedding = await embeddingsCache.fetch(ctx, { text: artwork.prompt });

    // Vector search
    const results = await ctx.vectorSearch('artworkEmbeddings', 'by_embedding', {
      vector: embedding,
      limit: limit + 1, // +1 to exclude self
    });

    // Filter out self and map to artwork IDs
    const similarArtworks = results
      .filter((r) => r._id !== artworkId)
      .slice(0, limit);

    // Get artwork IDs from embedding records
    const artworkResults: Array<{ _id: Id<'artworks'>; _score: number }> = [];
    for (const result of similarArtworks) {
      const embeddingRecord = await ctx.runQuery(internal.embeddings.getEmbeddingRecord, {
        embeddingId: result._id,
      });
      if (embeddingRecord) {
        artworkResults.push({
          _id: embeddingRecord.artworkId,
          _score: result._score,
        });
      }
    }

    return artworkResults;
  },
});

// Internal query to get embedding record
export const getEmbeddingRecord = internalQuery({
  args: { embeddingId: v.id('artworkEmbeddings') },
  handler: async (ctx, { embeddingId }) => {
    return await ctx.db.get(embeddingId);
  },
});

// Search by text query
export const searchByText = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    visibility: v.optional(v.union(v.literal('public'), v.literal('private'), v.literal('unlisted'))),
  },
  handler: async (ctx, { query, limit = 10, visibility }): Promise<Array<{ _id: Id<'artworks'>; _score: number }>> => {
    // Generate embedding for query using cache
    const embedding = await embeddingsCache.fetch(ctx, { text: query });

    // Vector search
    const results = await ctx.vectorSearch('artworkEmbeddings', 'by_embedding', {
      vector: embedding,
      limit,
    });

    // Get artwork IDs and filter by visibility if needed
    const artworkResults: Array<{ _id: Id<'artworks'>; _score: number }> = [];
    for (const result of results) {
      const embeddingRecord = await ctx.runQuery(internal.embeddings.getEmbeddingRecord, {
        embeddingId: result._id,
      });
      if (embeddingRecord) {
        // Check visibility if filter specified
        if (visibility) {
          const artwork = await ctx.runQuery(internal.embeddings.getArtwork, {
            artworkId: embeddingRecord.artworkId,
          });
          if (artwork && artwork.visibility !== visibility) {
            continue;
          }
        }
        artworkResults.push({
          _id: embeddingRecord.artworkId,
          _score: result._score,
        });
      }
    }

    return artworkResults;
  },
});
