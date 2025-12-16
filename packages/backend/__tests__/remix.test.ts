import { describe, expect, it } from 'vitest';
import { api } from '../convex/_generated/api';
import {
  createTestContext,
  withTestUser,
  withTestArtwork,
  withTestRemix,
  withTestCombination,
} from './setup';

describe('Remix Functions', () => {
  describe('queries/remix.getRemixHistory', () => {
    it('returns empty array when no remixes exist', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId);

      const result = await t.query(api.functions.queries.remix.getRemixHistory, {
        artworkId,
      });

      expect(result).toEqual([]);
    });

    it('returns all remixes of an artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const sourceArtwork = await withTestArtwork(t, clerkId, { prompt: 'Source' });
      const remix1 = await withTestArtwork(t, clerkId, { prompt: 'Remix 1' });
      const remix2 = await withTestArtwork(t, clerkId, { prompt: 'Remix 2' });

      await withTestRemix(t, sourceArtwork, remix1, clerkId);
      await withTestRemix(t, sourceArtwork, remix2, clerkId);

      const result = await t.query(api.functions.queries.remix.getRemixHistory, {
        artworkId: sourceArtwork,
      });

      expect(result).toHaveLength(2);
    });

    it('includes artwork details with each remix', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const sourceArtwork = await withTestArtwork(t, clerkId, { prompt: 'Source' });
      const remixArtwork = await withTestArtwork(t, clerkId, { prompt: 'Remix Art' });

      await withTestRemix(t, sourceArtwork, remixArtwork, clerkId, {
        remixType: 'stylize',
        prompt: 'Stylized version',
      });

      const result = await t.query(api.functions.queries.remix.getRemixHistory, {
        artworkId: sourceArtwork,
      });

      expect(result).toHaveLength(1);
      expect(result[0].artwork).not.toBeNull();
      expect(result[0].artwork?.prompt).toBe('Remix Art');
      expect(result[0].remixType).toBe('stylize');
    });

    it('filters out remixes with deleted artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const sourceArtwork = await withTestArtwork(t, clerkId);
      const remixArtwork = await withTestArtwork(t, clerkId);

      await withTestRemix(t, sourceArtwork, remixArtwork, clerkId);

      // Delete the remix artwork
      await t.run(async (ctx) => {
        await ctx.db.delete(remixArtwork);
      });

      const result = await t.query(api.functions.queries.remix.getRemixHistory, {
        artworkId: sourceArtwork,
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('queries/remix.getCombinationHistory', () => {
    it('returns empty array when no combinations exist', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId);

      const result = await t.query(api.functions.queries.remix.getCombinationHistory, {
        artworkId,
      });

      expect(result).toEqual([]);
    });

    it('returns combinations involving an artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const source1 = await withTestArtwork(t, clerkId, { prompt: 'Source 1' });
      const source2 = await withTestArtwork(t, clerkId, { prompt: 'Source 2' });
      const combined = await withTestArtwork(t, clerkId, { prompt: 'Combined' });

      await withTestCombination(t, [source1, source2], combined, clerkId);

      // Query for source1
      const result = await t.query(api.functions.queries.remix.getCombinationHistory, {
        artworkId: source1,
      });

      expect(result).toHaveLength(1);
      expect(result[0].artwork?.prompt).toBe('Combined');
    });

    it('returns combinations for both source artworks', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const source1 = await withTestArtwork(t, clerkId);
      const source2 = await withTestArtwork(t, clerkId);
      const combined = await withTestArtwork(t, clerkId);

      await withTestCombination(t, [source1, source2], combined, clerkId);

      // Both sources should return the combination
      const result1 = await t.query(api.functions.queries.remix.getCombinationHistory, {
        artworkId: source1,
      });
      const result2 = await t.query(api.functions.queries.remix.getCombinationHistory, {
        artworkId: source2,
      });

      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(1);
    });

    it('filters out combinations with deleted artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const source1 = await withTestArtwork(t, clerkId);
      const source2 = await withTestArtwork(t, clerkId);
      const combined = await withTestArtwork(t, clerkId);

      await withTestCombination(t, [source1, source2], combined, clerkId);

      // Delete the combined artwork
      await t.run(async (ctx) => {
        await ctx.db.delete(combined);
      });

      const result = await t.query(api.functions.queries.remix.getCombinationHistory, {
        artworkId: source1,
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('queries/remix.getLineage', () => {
    it('returns null lineage for non-existent artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId);

      await t.run(async (ctx) => {
        await ctx.db.delete(artworkId);
      });

      const result = await t.query(api.functions.queries.remix.getLineage, {
        artworkId,
      });

      expect(result).toEqual({ remixedFrom: null, combinedFrom: [] });
    });

    it('returns null lineage for original artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId);

      const result = await t.query(api.functions.queries.remix.getLineage, {
        artworkId,
      });

      expect(result.remixedFrom).toBeNull();
      expect(result.combinedFrom).toEqual([]);
    });

    it('returns remix source for remixed artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const sourceArtwork = await withTestArtwork(t, clerkId, { prompt: 'Source' });
      const remixArtwork = await withTestArtwork(t, clerkId, {
        prompt: 'Remix',
        remixedFrom: sourceArtwork,
      });

      const result = await t.query(api.functions.queries.remix.getLineage, {
        artworkId: remixArtwork,
      });

      expect(result.remixedFrom).not.toBeNull();
      expect(result.remixedFrom?.prompt).toBe('Source');
      expect(result.combinedFrom).toEqual([]);
    });

    it('returns combination sources for combined artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const source1 = await withTestArtwork(t, clerkId, { prompt: 'Source 1' });
      const source2 = await withTestArtwork(t, clerkId, { prompt: 'Source 2' });
      const combined = await withTestArtwork(t, clerkId, {
        prompt: 'Combined',
        combinedFrom: [source1, source2],
      });

      const result = await t.query(api.functions.queries.remix.getLineage, {
        artworkId: combined,
      });

      expect(result.remixedFrom).toBeNull();
      expect(result.combinedFrom).toHaveLength(2);
      expect(result.combinedFrom.map((a) => a.prompt)).toContain('Source 1');
      expect(result.combinedFrom.map((a) => a.prompt)).toContain('Source 2');
    });

    it('handles deleted source gracefully', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const source1 = await withTestArtwork(t, clerkId, { prompt: 'Source 1' });
      const source2 = await withTestArtwork(t, clerkId, { prompt: 'Source 2' });
      const combined = await withTestArtwork(t, clerkId, {
        prompt: 'Combined',
        combinedFrom: [source1, source2],
      });

      // Delete source1
      await t.run(async (ctx) => {
        await ctx.db.delete(source1);
      });

      const result = await t.query(api.functions.queries.remix.getLineage, {
        artworkId: combined,
      });

      // Should only return remaining source
      expect(result.combinedFrom).toHaveLength(1);
      expect(result.combinedFrom[0].prompt).toBe('Source 2');
    });
  });
});
