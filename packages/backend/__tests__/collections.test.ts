import { describe, expect, it } from 'vitest';
import {
  createTestContext,
  withTestUser,
  withTestArtwork,
  withTestCollection,
} from './setup';

describe('Collections Data Layer', () => {
  describe('collections table', () => {
    it('creates a collection with required fields', async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);

      const collectionId = await withTestCollection(t, userId, {
        name: 'My Art',
      });

      const collection = await t.run(async (ctx) => {
        return await ctx.db.get(collectionId);
      });

      expect(collection).not.toBeNull();
      expect(collection?.name).toBe('My Art');
      expect(collection?.userId).toBe(userId);
      expect(collection?.visibility).toBe('private');
      expect(collection?.artworkIds).toEqual([]);
    });

    it('creates a collection with description', async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);

      const collectionId = await withTestCollection(t, userId, {
        name: 'Featured',
        description: 'My best ASCII art',
      });

      const collection = await t.run(async (ctx) => {
        return await ctx.db.get(collectionId);
      });

      expect(collection?.description).toBe('My best ASCII art');
    });

    it('creates a public collection', async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);

      const collectionId = await withTestCollection(t, userId, {
        name: 'Public Art',
        visibility: 'public',
      });

      const collection = await t.run(async (ctx) => {
        return await ctx.db.get(collectionId);
      });

      expect(collection?.visibility).toBe('public');
    });

    it('creates a collection with artworks', async () => {
      const t = createTestContext();
      const { userId, clerkId } = await withTestUser(t);
      const artwork1 = await withTestArtwork(t, clerkId);
      const artwork2 = await withTestArtwork(t, clerkId);

      const collectionId = await withTestCollection(t, userId, {
        name: 'Art Set',
        artworkIds: [artwork1, artwork2],
      });

      const collection = await t.run(async (ctx) => {
        return await ctx.db.get(collectionId);
      });

      expect(collection?.artworkIds).toHaveLength(2);
      expect(collection?.artworkIds).toContain(artwork1);
      expect(collection?.artworkIds).toContain(artwork2);
    });
  });

  describe('collection queries via index', () => {
    it('queries collections by user', async () => {
      const t = createTestContext();
      const { userId: user1Id } = await withTestUser(t, { clerkId: 'user-1' });
      const { userId: user2Id } = await withTestUser(t, { clerkId: 'user-2' });

      await withTestCollection(t, user1Id, { name: 'User 1 Collection' });
      await withTestCollection(t, user1Id, { name: 'User 1 Collection 2' });
      await withTestCollection(t, user2Id, { name: 'User 2 Collection' });

      const user1Collections = await t.run(async (ctx) => {
        return await ctx.db
          .query('collections')
          .withIndex('by_user', (q) => q.eq('userId', user1Id))
          .collect();
      });

      expect(user1Collections).toHaveLength(2);
    });

    it('queries collections by visibility', async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);

      await withTestCollection(t, userId, { name: 'Public 1', visibility: 'public' });
      await withTestCollection(t, userId, { name: 'Public 2', visibility: 'public' });
      await withTestCollection(t, userId, { name: 'Private', visibility: 'private' });

      const publicCollections = await t.run(async (ctx) => {
        return await ctx.db
          .query('collections')
          .withIndex('by_visibility', (q) => q.eq('visibility', 'public'))
          .collect();
      });

      expect(publicCollections).toHaveLength(2);
    });
  });

  describe('collection mutations at data layer', () => {
    it('adds artwork to collection', async () => {
      const t = createTestContext();
      const { userId, clerkId } = await withTestUser(t);
      const artwork = await withTestArtwork(t, clerkId);
      const collectionId = await withTestCollection(t, userId, { name: 'Art' });

      await t.run(async (ctx) => {
        const collection = await ctx.db.get(collectionId);
        if (collection) {
          await ctx.db.patch(collectionId, {
            artworkIds: [...collection.artworkIds, artwork],
            updatedAt: new Date().toISOString(),
          });
        }
      });

      const collection = await t.run(async (ctx) => {
        return await ctx.db.get(collectionId);
      });

      expect(collection?.artworkIds).toContain(artwork);
    });

    it('removes artwork from collection', async () => {
      const t = createTestContext();
      const { userId, clerkId } = await withTestUser(t);
      const artwork1 = await withTestArtwork(t, clerkId);
      const artwork2 = await withTestArtwork(t, clerkId);
      const collectionId = await withTestCollection(t, userId, {
        name: 'Art',
        artworkIds: [artwork1, artwork2],
      });

      await t.run(async (ctx) => {
        const collection = await ctx.db.get(collectionId);
        if (collection) {
          await ctx.db.patch(collectionId, {
            artworkIds: collection.artworkIds.filter((id) => id !== artwork1),
            updatedAt: new Date().toISOString(),
          });
        }
      });

      const collection = await t.run(async (ctx) => {
        return await ctx.db.get(collectionId);
      });

      expect(collection?.artworkIds).toHaveLength(1);
      expect(collection?.artworkIds).toContain(artwork2);
      expect(collection?.artworkIds).not.toContain(artwork1);
    });

    it('updates collection name and visibility', async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);
      const collectionId = await withTestCollection(t, userId, {
        name: 'Old Name',
        visibility: 'private',
      });

      await t.run(async (ctx) => {
        await ctx.db.patch(collectionId, {
          name: 'New Name',
          visibility: 'public',
          updatedAt: new Date().toISOString(),
        });
      });

      const collection = await t.run(async (ctx) => {
        return await ctx.db.get(collectionId);
      });

      expect(collection?.name).toBe('New Name');
      expect(collection?.visibility).toBe('public');
    });

    it('deletes collection', async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);
      const collectionId = await withTestCollection(t, userId, { name: 'To Delete' });

      await t.run(async (ctx) => {
        await ctx.db.delete(collectionId);
      });

      const collection = await t.run(async (ctx) => {
        return await ctx.db.get(collectionId);
      });

      expect(collection).toBeNull();
    });
  });

  describe('collection-artwork relationship', () => {
    it('retrieves artworks from collection', async () => {
      const t = createTestContext();
      const { userId, clerkId } = await withTestUser(t);
      const artwork1 = await withTestArtwork(t, clerkId, { prompt: 'Art 1' });
      const artwork2 = await withTestArtwork(t, clerkId, { prompt: 'Art 2' });

      const collectionId = await withTestCollection(t, userId, {
        name: 'Art Set',
        artworkIds: [artwork1, artwork2],
      });

      const artworks = await t.run(async (ctx) => {
        const collection = await ctx.db.get(collectionId);
        if (!collection) return [];
        return await Promise.all(collection.artworkIds.map((id) => ctx.db.get(id)));
      });

      expect(artworks).toHaveLength(2);
      expect(artworks.map((a) => a?.prompt)).toContain('Art 1');
      expect(artworks.map((a) => a?.prompt)).toContain('Art 2');
    });

    it('handles deleted artwork in collection gracefully', async () => {
      const t = createTestContext();
      const { userId, clerkId } = await withTestUser(t);
      const artwork1 = await withTestArtwork(t, clerkId, { prompt: 'Art 1' });
      const artwork2 = await withTestArtwork(t, clerkId, { prompt: 'Art 2' });

      const collectionId = await withTestCollection(t, userId, {
        name: 'Art Set',
        artworkIds: [artwork1, artwork2],
      });

      // Delete one artwork
      await t.run(async (ctx) => {
        await ctx.db.delete(artwork1);
      });

      const artworks = await t.run(async (ctx) => {
        const collection = await ctx.db.get(collectionId);
        if (!collection) return [];
        const results = await Promise.all(
          collection.artworkIds.map((id) => ctx.db.get(id))
        );
        return results.filter(Boolean);
      });

      expect(artworks).toHaveLength(1);
      expect(artworks[0]?.prompt).toBe('Art 2');
    });

    it('prevents duplicate artworks in collection', async () => {
      const t = createTestContext();
      const { userId, clerkId } = await withTestUser(t);
      const artwork = await withTestArtwork(t, clerkId);
      const collectionId = await withTestCollection(t, userId, {
        name: 'Art',
        artworkIds: [artwork],
      });

      // Try to add same artwork again
      await t.run(async (ctx) => {
        const collection = await ctx.db.get(collectionId);
        if (collection && !collection.artworkIds.includes(artwork)) {
          await ctx.db.patch(collectionId, {
            artworkIds: [...collection.artworkIds, artwork],
          });
        }
      });

      const collection = await t.run(async (ctx) => {
        return await ctx.db.get(collectionId);
      });

      expect(collection?.artworkIds).toHaveLength(1);
    });
  });
});
