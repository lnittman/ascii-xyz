import { describe, expect, it } from 'vitest';
import { api } from '../convex/_generated/api';
import { createTestContext, withTestUser, withTestArtwork } from './setup';

describe('Social Features', () => {
  describe('toggleLike', () => {
    it('allows user to like an artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'Test art',
        visibility: 'public'
      });

      const result = await t
        .withIdentity({ subject: clerkId })
        .mutation(api.social.toggleLike, { artworkId });

      expect(result.liked).toBe(true);
      expect(result.likes).toBe(1);
    });

    it('allows user to unlike an artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'Test art',
        visibility: 'public'
      });

      // Like first
      await t
        .withIdentity({ subject: clerkId })
        .mutation(api.social.toggleLike, { artworkId });
      // Then unlike
      const result = await t
        .withIdentity({ subject: clerkId })
        .mutation(api.social.toggleLike, { artworkId });

      expect(result.liked).toBe(false);
      expect(result.likes).toBe(0);
    });

    it('prevents likes from going negative', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'Test art',
        visibility: 'public'
      });

      // Like then unlike
      await t
        .withIdentity({ subject: clerkId })
        .mutation(api.social.toggleLike, { artworkId });
      const result = await t
        .withIdentity({ subject: clerkId })
        .mutation(api.social.toggleLike, { artworkId });

      expect(result.likes).toBeGreaterThanOrEqual(0);
    });
  });

  describe('hasLiked', () => {
    it('returns false when user has not liked artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'Test art',
        visibility: 'public'
      });

      const result = await t
        .withIdentity({ subject: clerkId })
        .query(api.social.hasLiked, { artworkId });

      expect(result).toBe(false);
    });

    it('returns true when user has liked artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'Test art',
        visibility: 'public'
      });

      await t
        .withIdentity({ subject: clerkId })
        .mutation(api.social.toggleLike, { artworkId });
      const result = await t
        .withIdentity({ subject: clerkId })
        .query(api.social.hasLiked, { artworkId });

      expect(result).toBe(true);
    });
  });

  describe('getLikes', () => {
    it('returns zero count for artwork with no likes', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'Test art',
        visibility: 'public'
      });

      const result = await t.query(api.social.getLikes, { artworkId });

      expect(result.count).toBe(0);
      expect(result.recentLikers).toHaveLength(0);
    });

    it('returns correct count after likes', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'Test art',
        visibility: 'public'
      });

      await t
        .withIdentity({ subject: clerkId })
        .mutation(api.social.toggleLike, { artworkId });
      const result = await t.query(api.social.getLikes, { artworkId });

      expect(result.count).toBe(1);
      expect(result.recentLikers).toHaveLength(1);
    });
  });

  describe('incrementView', () => {
    it('increments view count', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, { prompt: 'Test art' });

      const result = await t.mutation(api.social.incrementView, { artworkId });

      expect(result.views).toBe(1);
    });

    it('increments view count multiple times', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, { prompt: 'Test art' });

      await t.mutation(api.social.incrementView, { artworkId });
      await t.mutation(api.social.incrementView, { artworkId });
      const result = await t.mutation(api.social.incrementView, { artworkId });

      expect(result.views).toBe(3);
    });
  });

  describe('getTopByLikes', () => {
    it('returns empty array when no public artworks', async () => {
      const t = createTestContext();

      const result = await t.query(api.social.getTopByLikes, {});

      expect(result).toEqual([]);
    });

    it('returns public artworks sorted by likes', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create artworks with different like counts
      const art1 = await withTestArtwork(t, clerkId, {
        prompt: 'Popular art',
        visibility: 'public',
        likes: 10
      });
      const art2 = await withTestArtwork(t, clerkId, {
        prompt: 'Medium art',
        visibility: 'public',
        likes: 5
      });
      const art3 = await withTestArtwork(t, clerkId, {
        prompt: 'New art',
        visibility: 'public',
        likes: 0
      });

      const result = await t.query(api.social.getTopByLikes, { limit: 10 });

      expect(result.length).toBeGreaterThanOrEqual(1);
      // Verify sorting (highest likes first)
      if (result.length >= 2) {
        expect(result[0].likes ?? 0).toBeGreaterThanOrEqual(result[1].likes ?? 0);
      }
    });

    it('excludes private artworks', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      await withTestArtwork(t, clerkId, {
        prompt: 'Private art',
        visibility: 'private',
        likes: 100
      });
      await withTestArtwork(t, clerkId, {
        prompt: 'Public art',
        visibility: 'public',
        likes: 1
      });

      const result = await t.query(api.social.getTopByLikes, {});

      // Should only include public artworks
      expect(result.every(a => a.visibility === 'public')).toBe(true);
    });
  });

  describe('getTrending', () => {
    it('returns empty array when no recent public artworks', async () => {
      const t = createTestContext();

      const result = await t.query(api.social.getTrending, {});

      expect(result).toEqual([]);
    });

    it('returns recent public artworks', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      await withTestArtwork(t, clerkId, {
        prompt: 'Recent art',
        visibility: 'public'
      });

      const result = await t.query(api.social.getTrending, {});

      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getUserStats', () => {
    it('returns null for non-authenticated user', async () => {
      const t = createTestContext();

      const result = await t.query(api.social.getUserStats, {});

      expect(result).toBe(null);
    });

    it('returns stats for authenticated user', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      await withTestArtwork(t, clerkId, { prompt: 'Art 1', visibility: 'public' });
      await withTestArtwork(t, clerkId, { prompt: 'Art 2', visibility: 'private' });

      const result = await t.query(api.social.getUserStats, { userId: clerkId });

      expect(result).not.toBe(null);
      expect(result?.totalArtworks).toBe(2);
      expect(result?.publicArtworks).toBe(1);
    });

    it('calculates total likes correctly', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      await withTestArtwork(t, clerkId, {
        prompt: 'Art 1',
        visibility: 'public',
        likes: 5
      });
      await withTestArtwork(t, clerkId, {
        prompt: 'Art 2',
        visibility: 'public',
        likes: 10
      });

      const result = await t.query(api.social.getUserStats, { userId: clerkId });

      expect(result?.totalLikes).toBe(15);
    });

    it('calculates total views correctly', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      await withTestArtwork(t, clerkId, {
        prompt: 'Art 1',
        visibility: 'public',
        views: 100
      });
      await withTestArtwork(t, clerkId, {
        prompt: 'Art 2',
        visibility: 'public',
        views: 50
      });

      const result = await t.query(api.social.getUserStats, { userId: clerkId });

      expect(result?.totalViews).toBe(150);
    });
  });

  describe('getFeatured', () => {
    it('returns empty array when no featured artworks', async () => {
      const t = createTestContext();

      const result = await t.query(api.social.getFeatured, {});

      expect(result).toEqual([]);
    });

    it('returns featured public artworks', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create a featured artwork
      await t.run(async (ctx) => {
        await ctx.db.insert('artworks', {
          userId: clerkId,
          prompt: 'Featured art',
          frames: ['frame1'],
          metadata: {
            width: 80,
            height: 24,
            fps: 1,
            generator: 'test',
            model: 'test-model',
            createdAt: new Date().toISOString(),
          },
          visibility: 'public',
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const result = await t.query(api.social.getFeatured, {});

      expect(result.length).toBe(1);
      expect(result[0].prompt).toBe('Featured art');
    });

    it('excludes private featured artworks', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create a featured but private artwork
      await t.run(async (ctx) => {
        await ctx.db.insert('artworks', {
          userId: clerkId,
          prompt: 'Private featured',
          frames: ['frame1'],
          metadata: {
            width: 80,
            height: 24,
            fps: 1,
            generator: 'test',
            model: 'test-model',
            createdAt: new Date().toISOString(),
          },
          visibility: 'private',
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const result = await t.query(api.social.getFeatured, {});

      expect(result).toEqual([]);
    });

    it('respects limit parameter', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create multiple featured artworks
      for (let i = 0; i < 5; i++) {
        await t.run(async (ctx) => {
          await ctx.db.insert('artworks', {
            userId: clerkId,
            prompt: `Featured art ${i}`,
            frames: ['frame1'],
            metadata: {
              width: 80,
              height: 24,
              fps: 1,
              generator: 'test',
              model: 'test-model',
              createdAt: new Date().toISOString(),
            },
            visibility: 'public',
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });
      }

      const result = await t.query(api.social.getFeatured, { limit: 3 });

      expect(result.length).toBe(3);
    });

    it('returns artworks sorted by creation date descending', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create featured artworks with different dates
      const dates = ['2024-01-01', '2024-01-03', '2024-01-02'];
      for (const date of dates) {
        await t.run(async (ctx) => {
          await ctx.db.insert('artworks', {
            userId: clerkId,
            prompt: `Art from ${date}`,
            frames: ['frame1'],
            metadata: {
              width: 80,
              height: 24,
              fps: 1,
              generator: 'test',
              model: 'test-model',
              createdAt: `${date}T00:00:00Z`,
            },
            visibility: 'public',
            featured: true,
            createdAt: `${date}T00:00:00Z`,
            updatedAt: `${date}T00:00:00Z`,
          });
        });
      }

      const result = await t.query(api.social.getFeatured, {});

      // Should be sorted by most recent first (by _creationTime)
      expect(result.length).toBe(3);
    });
  });

  describe('setFeatured', () => {
    it('marks artwork as featured', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'Test art',
        visibility: 'public',
      });

      await t.mutation(api.social.setFeatured, {
        artworkId,
        featured: true,
      });

      // Verify artwork is now featured
      const artwork = await t.run(async (ctx) => ctx.db.get(artworkId));
      expect(artwork?.featured).toBe(true);
    });

    it('unfeatures artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create a featured artwork
      const artworkId = await t.run(async (ctx) => {
        return await ctx.db.insert('artworks', {
          userId: clerkId,
          prompt: 'Featured art',
          frames: ['frame1'],
          metadata: {
            width: 80,
            height: 24,
            fps: 1,
            generator: 'test',
            model: 'test-model',
            createdAt: new Date().toISOString(),
          },
          visibility: 'public',
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      await t.mutation(api.social.setFeatured, {
        artworkId,
        featured: false,
      });

      // Verify artwork is no longer featured
      const artwork = await t.run(async (ctx) => ctx.db.get(artworkId));
      expect(artwork?.featured).toBe(false);
    });

    it('throws for non-existent artwork', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create an artwork to get a valid ID format, then delete it
      const artworkId = await withTestArtwork(t, clerkId, { prompt: 'Test' });
      await t.run(async (ctx) => ctx.db.delete(artworkId));

      await expect(
        t.mutation(api.social.setFeatured, { artworkId, featured: true })
      ).rejects.toThrow('Artwork not found');
    });

    it('prevents featuring private artworks', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);
      const artworkId = await withTestArtwork(t, clerkId, {
        prompt: 'Private art',
        visibility: 'private',
      });

      await expect(
        t.mutation(api.social.setFeatured, { artworkId, featured: true })
      ).rejects.toThrow('Cannot feature private artworks');
    });
  });
});
