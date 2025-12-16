import { describe, expect, it } from 'vitest';
import { api } from '../convex/_generated/api';
import { createTestContext, withTestUser, withTestArtwork } from './setup';

describe('Ascii Functions', () => {
  describe('queries/ascii.list', () => {
    it('returns empty array when no artworks exist', async () => {
      const t = createTestContext();

      const result = await t.query(api.functions.queries.ascii.list, {});

      expect(result).toEqual([]);
    });

    it('returns all artworks without filters', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      await withTestArtwork(t, clerkId, { prompt: 'Art 1' });
      await withTestArtwork(t, clerkId, { prompt: 'Art 2' });

      const result = await t.query(api.functions.queries.ascii.list, {});

      expect(result).toHaveLength(2);
    });

    it('filters by userId', async () => {
      const t = createTestContext();
      const { clerkId: user1 } = await withTestUser(t, { clerkId: 'user-1' });
      const { clerkId: user2 } = await withTestUser(t, { clerkId: 'user-2' });
      await withTestArtwork(t, user1, { prompt: 'User 1 art' });
      await withTestArtwork(t, user2, { prompt: 'User 2 art' });

      const result = await t.query(api.functions.queries.ascii.list, { userId: user1 });

      expect(result).toHaveLength(1);
      expect(result[0].prompt).toBe('User 1 art');
    });

    it('filters by visibility', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      await withTestArtwork(t, clerkId, { visibility: 'public' });
      await withTestArtwork(t, clerkId, { visibility: 'private' });
      await withTestArtwork(t, clerkId, { visibility: 'unlisted' });

      const publicResult = await t.query(api.functions.queries.ascii.list, { visibility: 'public' });
      const privateResult = await t.query(api.functions.queries.ascii.list, { visibility: 'private' });

      expect(publicResult).toHaveLength(1);
      expect(privateResult).toHaveLength(1);
    });

    it('respects limit parameter', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      await withTestArtwork(t, clerkId, { prompt: 'Art 1' });
      await withTestArtwork(t, clerkId, { prompt: 'Art 2' });
      await withTestArtwork(t, clerkId, { prompt: 'Art 3' });

      const result = await t.query(api.functions.queries.ascii.list, { limit: 2 });

      expect(result).toHaveLength(2);
    });
  });

  describe('queries/ascii.get', () => {
    it('returns null for non-existent artwork', async () => {
      const t = createTestContext();
      // Create a dummy artwork to get a valid ID format, then delete it
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId);
      await t.run(async (ctx) => {
        await ctx.db.delete(artworkId);
      });

      const result = await t.query(api.functions.queries.ascii.get, { id: artworkId });

      expect(result).toBeNull();
    });

    it('returns public artwork to anyone', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'Public art',
        visibility: 'public'
      });

      // Query without userId (anonymous)
      const result = await t.query(api.functions.queries.ascii.get, { id: artworkId });

      expect(result).not.toBeNull();
      expect(result?.prompt).toBe('Public art');
    });

    it('returns private artwork only to owner', async () => {
      const t = createTestContext();
      const { clerkId: owner } = await withTestUser(t, { clerkId: 'owner' });
      const { clerkId: other } = await withTestUser(t, { clerkId: 'other' });
      const artworkId = await withTestArtwork(t, owner, {
        visibility: 'private'
      });

      // Owner can access
      const ownerResult = await t.query(api.functions.queries.ascii.get, {
        id: artworkId,
        userId: owner
      });
      expect(ownerResult).not.toBeNull();

      // Other user cannot access
      const otherResult = await t.query(api.functions.queries.ascii.get, {
        id: artworkId,
        userId: other
      });
      expect(otherResult).toBeNull();
    });
  });

  describe('queries/ascii.getPublic', () => {
    it('returns only public artworks', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      await withTestArtwork(t, clerkId, { visibility: 'public', prompt: 'Public' });
      await withTestArtwork(t, clerkId, { visibility: 'private', prompt: 'Private' });

      const result = await t.query(api.functions.queries.ascii.getPublic, {});

      expect(result).toHaveLength(1);
      expect(result[0].prompt).toBe('Public');
    });

    it('respects limit parameter', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      for (let i = 0; i < 5; i++) {
        await withTestArtwork(t, clerkId, { visibility: 'public' });
      }

      const result = await t.query(api.functions.queries.ascii.getPublic, { limit: 3 });

      expect(result).toHaveLength(3);
    });
  });

  describe('queries/ascii.search', () => {
    it('searches public artworks by prompt', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      await withTestArtwork(t, clerkId, { prompt: 'Beautiful sunset', visibility: 'public' });
      await withTestArtwork(t, clerkId, { prompt: 'Mountain view', visibility: 'public' });

      const result = await t.query(api.functions.queries.ascii.search, { query: 'sunset' });

      expect(result).toHaveLength(1);
      expect(result[0].prompt).toBe('Beautiful sunset');
    });

    it('searches user artworks when userId provided', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      await withTestArtwork(t, clerkId, { prompt: 'My sunset', visibility: 'private' });
      await withTestArtwork(t, clerkId, { prompt: 'My mountains', visibility: 'private' });

      const result = await t.query(api.functions.queries.ascii.search, {
        query: 'sunset',
        userId: clerkId
      });

      expect(result).toHaveLength(1);
      expect(result[0].prompt).toBe('My sunset');
    });

    it('is case insensitive', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      await withTestArtwork(t, clerkId, { prompt: 'SUNSET Art', visibility: 'public' });

      const result = await t.query(api.functions.queries.ascii.search, { query: 'sunset' });

      expect(result).toHaveLength(1);
    });
  });

  describe('mutations/ascii.updateVisibility', () => {
    it('updates artwork visibility', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, { visibility: 'private' });

      await t.mutation(api.functions.mutations.ascii.updateVisibility, {
        id: artworkId,
        visibility: 'public'
      });

      const result = await t.query(api.functions.queries.ascii.get, { id: artworkId });
      expect(result?.visibility).toBe('public');
    });

    it('throws for non-existent artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId);
      await t.run(async (ctx) => {
        await ctx.db.delete(artworkId);
      });

      await expect(
        t.mutation(api.functions.mutations.ascii.updateVisibility, {
          id: artworkId,
          visibility: 'public'
        })
      ).rejects.toThrow('Artwork not found');
    });
  });

  describe('mutations/ascii.remove', () => {
    it('deletes artwork for owner', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId);

      await t.mutation(api.functions.mutations.ascii.remove, {
        id: artworkId,
        userId: clerkId
      });

      const result = await t.query(api.functions.queries.ascii.get, { id: artworkId });
      expect(result).toBeNull();
    });

    it('throws for non-owner', async () => {
      const t = createTestContext();
      const { clerkId: owner } = await withTestUser(t, { clerkId: 'owner' });
      const { clerkId: other } = await withTestUser(t, { clerkId: 'other' });
      const artworkId = await withTestArtwork(t, owner);

      await expect(
        t.mutation(api.functions.mutations.ascii.remove, {
          id: artworkId,
          userId: other
        })
      ).rejects.toThrow('Unauthorized');
    });

    it('throws for non-existent artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId);
      await t.run(async (ctx) => {
        await ctx.db.delete(artworkId);
      });

      await expect(
        t.mutation(api.functions.mutations.ascii.remove, {
          id: artworkId,
          userId: clerkId
        })
      ).rejects.toThrow('Artwork not found');
    });
  });

  describe('mutations/ascii.incrementViews', () => {
    it('increments view count', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, { visibility: 'public' });

      await t.mutation(api.functions.mutations.ascii.incrementViews, { id: artworkId });
      await t.mutation(api.functions.mutations.ascii.incrementViews, { id: artworkId });

      const result = await t.query(api.functions.queries.ascii.get, { id: artworkId });
      expect(result?.views).toBe(2);
    });

    it('does nothing for non-existent artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId);
      await t.run(async (ctx) => {
        await ctx.db.delete(artworkId);
      });

      // Should not throw
      await t.mutation(api.functions.mutations.ascii.incrementViews, { id: artworkId });
    });
  });

  describe('mutations/ascii.toggleLike', () => {
    it('increments like count when liked', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, { visibility: 'public' });

      await t.mutation(api.functions.mutations.ascii.toggleLike, {
        id: artworkId,
        userId: clerkId,
        liked: true
      });

      const result = await t.query(api.functions.queries.ascii.get, { id: artworkId });
      expect(result?.likes).toBe(1);
    });

    it('decrements like count when unliked', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, { visibility: 'public' });

      // Like first
      await t.mutation(api.functions.mutations.ascii.toggleLike, {
        id: artworkId,
        userId: clerkId,
        liked: true
      });
      // Then unlike
      await t.mutation(api.functions.mutations.ascii.toggleLike, {
        id: artworkId,
        userId: clerkId,
        liked: false
      });

      const result = await t.query(api.functions.queries.ascii.get, { id: artworkId });
      expect(result?.likes).toBe(0);
    });

    it('does not go below zero likes', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, { visibility: 'public' });

      // Try to unlike when already at 0
      await t.mutation(api.functions.mutations.ascii.toggleLike, {
        id: artworkId,
        userId: clerkId,
        liked: false
      });

      const result = await t.query(api.functions.queries.ascii.get, { id: artworkId });
      expect(result?.likes).toBe(0);
    });
  });
});
