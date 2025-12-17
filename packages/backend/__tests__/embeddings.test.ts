import { describe, expect, it } from 'vitest';
import { api, internal } from '../convex/_generated/api';
import {
  createTestContext,
  withTestUser,
  withTestArtwork,
  withTestEmbedding,
} from './setup';

describe('Embeddings', () => {
  describe('storeEmbedding', () => {
    it('creates new embedding for artwork without existing embedding', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'A beautiful sunset over mountains',
      });

      // Create a simple embedding (1536 dimensions)
      const embedding = Array(1536)
        .fill(0)
        .map((_, i) => Math.sin(i / 100));

      const embeddingId = await t.mutation(internal.embeddings.storeEmbedding, {
        artworkId,
        embedding,
      });

      expect(embeddingId).toBeDefined();

      // Verify it was stored
      const stored = await t.run(async (ctx) => {
        return await ctx.db.get(embeddingId);
      });

      expect(stored).not.toBeNull();
      expect(stored?.artworkId).toBe(artworkId);
      expect(stored?.model).toBe('text-embedding-ada-002');
      expect(stored?.embedding).toHaveLength(1536);
    });

    it('updates existing embedding for artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'Test artwork',
      });

      // Create initial embedding
      const initialEmbedding = Array(1536).fill(0.5);
      const embeddingId = await withTestEmbedding(t, artworkId, {
        embedding: initialEmbedding,
      });

      // Store new embedding (should update)
      const newEmbedding = Array(1536).fill(0.8);
      const updatedId = await t.mutation(internal.embeddings.storeEmbedding, {
        artworkId,
        embedding: newEmbedding,
      });

      // Should return same ID (update, not insert)
      expect(updatedId).toBe(embeddingId);

      // Verify updated
      const stored = await t.run(async (ctx) => {
        return await ctx.db.get(embeddingId);
      });

      expect(stored?.embedding[0]).toBeCloseTo(0.8);
    });
  });

  describe('getArtwork', () => {
    it('returns artwork by ID', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'A serene lake at dawn',
      });

      const artwork = await t.query(internal.embeddings.getArtwork, {
        artworkId,
      });

      expect(artwork).not.toBeNull();
      expect(artwork?.prompt).toBe('A serene lake at dawn');
    });

    it('returns null for non-existent artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create and delete to get a valid but non-existent ID
      const artworkId = await withTestArtwork(t, clerkId);
      await t.run(async (ctx) => {
        await ctx.db.delete(artworkId);
      });

      const artwork = await t.query(internal.embeddings.getArtwork, {
        artworkId,
      });

      expect(artwork).toBeNull();
    });
  });

  describe('getEmbeddingRecord', () => {
    it('returns embedding record by ID', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'Test prompt',
      });
      const embeddingId = await withTestEmbedding(t, artworkId);

      const record = await t.query(internal.embeddings.getEmbeddingRecord, {
        embeddingId,
      });

      expect(record).not.toBeNull();
      expect(record?.artworkId).toBe(artworkId);
      expect(record?.model).toBe('text-embedding-ada-002');
    });

    it('returns null for non-existent embedding', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId);
      const embeddingId = await withTestEmbedding(t, artworkId);

      await t.run(async (ctx) => {
        await ctx.db.delete(embeddingId);
      });

      const record = await t.query(internal.embeddings.getEmbeddingRecord, {
        embeddingId,
      });

      expect(record).toBeNull();
    });
  });
});

describe('Backfill Workflow Queries', () => {
  describe('getArtworksNeedingEmbeddings', () => {
    it('returns artworks without embeddings', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create artworks - some with embeddings, some without
      const artwork1 = await withTestArtwork(t, clerkId, { prompt: 'Art 1' });
      const artwork2 = await withTestArtwork(t, clerkId, { prompt: 'Art 2' });
      const artwork3 = await withTestArtwork(t, clerkId, { prompt: 'Art 3' });

      // Add embedding only to artwork2
      await withTestEmbedding(t, artwork2);

      const result = await t.query(
        internal.workflows.backfillEmbeddings.getArtworksNeedingEmbeddings,
        { limit: 10 }
      );

      // Should include artwork1 and artwork3, but not artwork2
      expect(result.artworkIds).toContain(artwork1);
      expect(result.artworkIds).toContain(artwork3);
      expect(result.artworkIds).not.toContain(artwork2);
    });

    it('returns empty array when all artworks have embeddings', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      const artwork1 = await withTestArtwork(t, clerkId);
      const artwork2 = await withTestArtwork(t, clerkId);

      await withTestEmbedding(t, artwork1);
      await withTestEmbedding(t, artwork2);

      const result = await t.query(
        internal.workflows.backfillEmbeddings.getArtworksNeedingEmbeddings,
        { limit: 10 }
      );

      expect(result.artworkIds).toHaveLength(0);
    });

    it('paginates correctly', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create 5 artworks without embeddings
      for (let i = 0; i < 5; i++) {
        await withTestArtwork(t, clerkId, { prompt: `Art ${i}` });
      }

      // First batch
      const result1 = await t.query(
        internal.workflows.backfillEmbeddings.getArtworksNeedingEmbeddings,
        { limit: 2 }
      );

      expect(result1.totalInBatch).toBe(2);
      expect(result1.isDone).toBe(false);
      expect(result1.cursor).toBeDefined();

      // Second batch
      const result2 = await t.query(
        internal.workflows.backfillEmbeddings.getArtworksNeedingEmbeddings,
        { cursor: result1.cursor, limit: 2 }
      );

      expect(result2.totalInBatch).toBe(2);

      // Third batch (should be last)
      const result3 = await t.query(
        internal.workflows.backfillEmbeddings.getArtworksNeedingEmbeddings,
        { cursor: result2.cursor, limit: 2 }
      );

      expect(result3.totalInBatch).toBe(1);
      expect(result3.isDone).toBe(true);
    });

    it('respects cursor parameter', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create artworks
      await withTestArtwork(t, clerkId, { prompt: 'Art 1' });
      await withTestArtwork(t, clerkId, { prompt: 'Art 2' });
      await withTestArtwork(t, clerkId, { prompt: 'Art 3' });

      // Get first page
      const page1 = await t.query(
        internal.workflows.backfillEmbeddings.getArtworksNeedingEmbeddings,
        { limit: 2 }
      );

      // Get second page using cursor
      const page2 = await t.query(
        internal.workflows.backfillEmbeddings.getArtworksNeedingEmbeddings,
        { cursor: page1.cursor, limit: 2 }
      );

      // Pages should not overlap
      const allIds = [...page1.artworkIds, ...page2.artworkIds];
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  describe('recordBackfillProgress', () => {
    it('records progress without error', async () => {
      const t = createTestContext();

      // Should not throw
      await t.mutation(
        internal.workflows.backfillEmbeddings.recordBackfillProgress,
        {
          workflowId: 'test-workflow',
          processed: 100,
          embedded: 95,
          errors: 5,
          status: 'running',
        }
      );
    });

    it('records completion status', async () => {
      const t = createTestContext();

      await t.mutation(
        internal.workflows.backfillEmbeddings.recordBackfillProgress,
        {
          workflowId: 'test-workflow',
          processed: 500,
          embedded: 498,
          errors: 2,
          status: 'completed',
        }
      );
    });

    it('records failed status with error message', async () => {
      const t = createTestContext();

      await t.mutation(
        internal.workflows.backfillEmbeddings.recordBackfillProgress,
        {
          workflowId: 'test-workflow',
          processed: 50,
          embedded: 45,
          errors: 5,
          status: 'failed',
          error: 'API rate limit exceeded',
        }
      );
    });
  });
});

describe('Embedding Data Integrity', () => {
  it('stores embedding with correct dimensions', async () => {
    const t = createTestContext();
    const { clerkId } = await withTestUser(t);
    const artworkId = await withTestArtwork(t, clerkId);

    // OpenAI text-embedding-ada-002 produces 1536 dimensions
    const embedding = Array(1536)
      .fill(0)
      .map(() => Math.random() * 2 - 1);

    await t.mutation(internal.embeddings.storeEmbedding, {
      artworkId,
      embedding,
    });

    const stored = await t.run(async (ctx) => {
      return await ctx.db
        .query('artworkEmbeddings')
        .withIndex('by_artwork', (q) => q.eq('artworkId', artworkId))
        .first();
    });

    expect(stored?.embedding).toHaveLength(1536);
  });

  it('links embedding to correct artwork', async () => {
    const t = createTestContext();
    const { clerkId } = await withTestUser(t);

    // Create two artworks
    const artwork1 = await withTestArtwork(t, clerkId, { prompt: 'First' });
    const artwork2 = await withTestArtwork(t, clerkId, { prompt: 'Second' });

    // Create embeddings for both
    const emb1 = Array(1536).fill(0.1);
    const emb2 = Array(1536).fill(0.9);

    await withTestEmbedding(t, artwork1, { embedding: emb1 });
    await withTestEmbedding(t, artwork2, { embedding: emb2 });

    // Verify each artwork has its own embedding
    const stored1 = await t.run(async (ctx) => {
      return await ctx.db
        .query('artworkEmbeddings')
        .withIndex('by_artwork', (q) => q.eq('artworkId', artwork1))
        .first();
    });

    const stored2 = await t.run(async (ctx) => {
      return await ctx.db
        .query('artworkEmbeddings')
        .withIndex('by_artwork', (q) => q.eq('artworkId', artwork2))
        .first();
    });

    expect(stored1?.embedding[0]).toBeCloseTo(0.1);
    expect(stored2?.embedding[0]).toBeCloseTo(0.9);
  });

  it('maintains one embedding per artwork via upsert', async () => {
    const t = createTestContext();
    const { clerkId } = await withTestUser(t);
    const artworkId = await withTestArtwork(t, clerkId);

    // Store first embedding
    await t.mutation(internal.embeddings.storeEmbedding, {
      artworkId,
      embedding: Array(1536).fill(0.1),
    });

    // Store second embedding (should update, not create new)
    await t.mutation(internal.embeddings.storeEmbedding, {
      artworkId,
      embedding: Array(1536).fill(0.2),
    });

    // Count embeddings for this artwork
    const count = await t.run(async (ctx) => {
      const embeddings = await ctx.db
        .query('artworkEmbeddings')
        .withIndex('by_artwork', (q) => q.eq('artworkId', artworkId))
        .collect();
      return embeddings.length;
    });

    expect(count).toBe(1);
  });
});

describe('Similarity Search Prerequisites', () => {
  it('creates embeddings that can be used for vector search', async () => {
    const t = createTestContext();
    const { clerkId } = await withTestUser(t);

    // Create multiple artworks with embeddings
    const artworks = await Promise.all([
      withTestArtwork(t, clerkId, { prompt: 'Ocean waves at sunset' }),
      withTestArtwork(t, clerkId, { prompt: 'Mountain landscape' }),
      withTestArtwork(t, clerkId, { prompt: 'City skyline at night' }),
    ]);

    // Create embeddings with distinct vectors
    for (let i = 0; i < artworks.length; i++) {
      const embedding = Array(1536)
        .fill(0)
        .map(() => Math.random() * 2 - 1);
      await withTestEmbedding(t, artworks[i], { embedding });
    }

    // Verify all embeddings exist
    const allEmbeddings = await t.run(async (ctx) => {
      return await ctx.db.query('artworkEmbeddings').collect();
    });

    expect(allEmbeddings).toHaveLength(3);
    allEmbeddings.forEach((emb) => {
      expect(emb.embedding).toHaveLength(1536);
      expect(emb.model).toBe('text-embedding-ada-002');
    });
  });

  it('stores createdAt timestamp for embedding', async () => {
    const t = createTestContext();
    const { clerkId } = await withTestUser(t);
    const artworkId = await withTestArtwork(t, clerkId);

    const before = new Date().toISOString();

    await t.mutation(internal.embeddings.storeEmbedding, {
      artworkId,
      embedding: Array(1536).fill(0),
    });

    const after = new Date().toISOString();

    const stored = await t.run(async (ctx) => {
      return await ctx.db
        .query('artworkEmbeddings')
        .withIndex('by_artwork', (q) => q.eq('artworkId', artworkId))
        .first();
    });

    expect(stored?.createdAt).toBeDefined();
    expect(stored?.createdAt >= before).toBe(true);
    expect(stored?.createdAt <= after).toBe(true);
  });
});
