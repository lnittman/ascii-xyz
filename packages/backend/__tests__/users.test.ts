import { describe, expect, it } from 'vitest';
import { api } from '../convex/_generated/api';
import { createTestContext, withTestUser, withTestArtwork } from './setup';

// Use the correct API path for users queries
const usersApi = api.functions.queries.users;

describe('Users', () => {
  describe('current', () => {
    it('returns null when not authenticated', async () => {
      const t = createTestContext();

      const result = await t.query(usersApi.current, {});

      expect(result).toBe(null);
    });

    it('returns user when authenticated', async () => {
      const t = createTestContext();
      const { clerkId, email } = await withTestUser(t);

      const result = await t
        .withIdentity({ subject: clerkId })
        .query(usersApi.current, {});

      expect(result).not.toBe(null);
      expect(result?.clerkId).toBe(clerkId);
      expect(result?.email).toBe(email);
    });
  });

  describe('get', () => {
    it('returns user by ID', async () => {
      const t = createTestContext();
      const { userId, email } = await withTestUser(t);

      const result = await t.query(usersApi.get, { userId });

      expect(result).not.toBe(null);
      expect(result?.email).toBe(email);
    });

    it('returns null for non-existent user', async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);
      // Delete the user
      await t.run(async (ctx) => ctx.db.delete(userId));

      const result = await t.query(usersApi.get, { userId });

      expect(result).toBe(null);
    });
  });

  describe('getPublicProfile', () => {
    it('returns public profile by clerk ID', async () => {
      const t = createTestContext();
      const { clerkId, email } = await withTestUser(t, { name: 'Test Artist' });

      const result = await t.query(usersApi.getPublicProfile, { clerkId });

      expect(result).not.toBe(null);
      expect(result?.email).toBe(email);
      expect(result?.name).toBe('Test Artist');
    });

    it('includes user stats', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create some public artworks
      await withTestArtwork(t, clerkId, { visibility: 'public', likes: 5, views: 100 });
      await withTestArtwork(t, clerkId, { visibility: 'public', likes: 10, views: 50 });
      await withTestArtwork(t, clerkId, { visibility: 'private' });

      const result = await t.query(usersApi.getPublicProfile, { clerkId });

      expect(result?.stats).toBeDefined();
      expect(result?.stats.totalArtworks).toBe(3);
      expect(result?.stats.publicArtworks).toBe(2);
      expect(result?.stats.totalLikes).toBe(15);
      expect(result?.stats.totalViews).toBe(150);
    });

    it('includes public artworks', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      await withTestArtwork(t, clerkId, { prompt: 'Public 1', visibility: 'public' });
      await withTestArtwork(t, clerkId, { prompt: 'Public 2', visibility: 'public' });
      await withTestArtwork(t, clerkId, { prompt: 'Private', visibility: 'private' });

      const result = await t.query(usersApi.getPublicProfile, { clerkId });

      expect(result?.artworks).toBeDefined();
      expect(result?.artworks.length).toBe(2);
      expect(result?.artworks.every(a => a.visibility === 'public')).toBe(true);
    });

    it('returns null for non-existent user', async () => {
      const t = createTestContext();

      const result = await t.query(usersApi.getPublicProfile, { clerkId: 'non-existent' });

      expect(result).toBe(null);
    });

    it('respects artwork limit', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create many artworks
      for (let i = 0; i < 15; i++) {
        await withTestArtwork(t, clerkId, { prompt: `Art ${i}`, visibility: 'public' });
      }

      const result = await t.query(usersApi.getPublicProfile, { clerkId, limit: 5 });

      expect(result?.artworks.length).toBe(5);
    });

    it('sorts artworks by creation date descending', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create artworks in sequence
      await withTestArtwork(t, clerkId, { prompt: 'First', visibility: 'public' });
      await withTestArtwork(t, clerkId, { prompt: 'Second', visibility: 'public' });
      await withTestArtwork(t, clerkId, { prompt: 'Third', visibility: 'public' });

      const result = await t.query(usersApi.getPublicProfile, { clerkId });

      // Most recent should be first (sorted by _creationTime desc)
      expect(result?.artworks[0].prompt).toBe('Third');
    });
  });

  describe('getByClerkId', () => {
    it('returns user by clerk ID', async () => {
      const t = createTestContext();
      const { clerkId, email } = await withTestUser(t);

      const result = await t.query(usersApi.getByClerkId, { clerkId });

      expect(result).not.toBe(null);
      expect(result?.email).toBe(email);
    });

    it('returns null for non-existent clerk ID', async () => {
      const t = createTestContext();

      const result = await t.query(usersApi.getByClerkId, { clerkId: 'non-existent-clerk-id' });

      expect(result).toBe(null);
    });
  });
});
