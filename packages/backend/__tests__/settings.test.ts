import { convexTest } from 'convex-test';
import { describe, expect, it } from 'vitest';
import { api } from '../convex/_generated/api';
import schema from '../convex/schema';
import { modules, withTestUser, createTestContext } from './setup';

describe('Settings Functions', () => {
  describe('get', () => {
    it('returns default settings for unauthenticated user', async () => {
      const t = createTestContext();

      const result = await t.query(api.functions.settings.get, {});

      expect(result).toBeNull();
    });

    it('returns default settings for new user without settings', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      const result = await t
        .withIdentity({ subject: clerkId })
        .query(api.functions.settings.get, {});

      expect(result).not.toBeNull();
      expect(result?.theme).toBe('dark');
      expect(result?.defaultVisibility).toBe('private');
      expect(result?.emailNotifications).toBe(true);
    });

    it('returns stored settings for user with existing settings', async () => {
      const t = createTestContext();
      const { userId, clerkId } = await withTestUser(t);

      await t.run(async (ctx) => {
        await ctx.db.insert('userSettings', {
          userId,
          theme: 'light',
          defaultVisibility: 'public',
          emailNotifications: false,
          defaultModelId: 'custom-model',
          updatedAt: new Date().toISOString(),
        });
      });

      const result = await t
        .withIdentity({ subject: clerkId })
        .query(api.functions.settings.get, {});

      expect(result?.theme).toBe('light');
      expect(result?.defaultVisibility).toBe('public');
      expect(result?.emailNotifications).toBe(false);
      expect(result?.defaultModelId).toBe('custom-model');
    });
  });

  describe('update', () => {
    it('throws for unauthenticated user', async () => {
      const t = createTestContext();

      await expect(
        t.mutation(api.functions.settings.update, { theme: 'light' })
      ).rejects.toThrow('Not authenticated');
    });

    it('creates settings for new user', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      await t
        .withIdentity({ subject: clerkId, email: 'test@example.com' })
        .mutation(api.functions.settings.update, {
          theme: 'light',
          defaultVisibility: 'public',
        });

      const result = await t
        .withIdentity({ subject: clerkId })
        .query(api.functions.settings.get, {});

      expect(result?.theme).toBe('light');
      expect(result?.defaultVisibility).toBe('public');
    });

    it('updates existing settings', async () => {
      const t = createTestContext();
      const { userId, clerkId } = await withTestUser(t);

      await t.run(async (ctx) => {
        await ctx.db.insert('userSettings', {
          userId,
          theme: 'dark',
          defaultVisibility: 'private',
          emailNotifications: true,
          updatedAt: new Date().toISOString(),
        });
      });

      await t
        .withIdentity({ subject: clerkId, email: 'test@example.com' })
        .mutation(api.functions.settings.update, {
          theme: 'light',
        });

      const result = await t
        .withIdentity({ subject: clerkId })
        .query(api.functions.settings.get, {});

      expect(result?.theme).toBe('light');
      // Should preserve other settings
      expect(result?.defaultVisibility).toBe('private');
    });
  });

  describe('toggleModel', () => {
    it('throws for unauthenticated user', async () => {
      const t = createTestContext();

      await expect(
        t.mutation(api.functions.settings.toggleModel, {
          provider: 'openai',
          modelId: 'gpt-4',
          enabled: true,
        })
      ).rejects.toThrow('Not authenticated');
    });

    it('enables model for user', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      await t
        .withIdentity({ subject: clerkId, email: 'test@example.com' })
        .mutation(api.functions.settings.toggleModel, {
          provider: 'openai',
          modelId: 'gpt-4',
          enabled: true,
        });

      const result = await t
        .withIdentity({ subject: clerkId })
        .query(api.functions.settings.getEnabledModels, {});

      expect(result?.openai).toContain('gpt-4');
    });

    it('disables model for user', async () => {
      const t = createTestContext();
      const { userId, clerkId } = await withTestUser(t);

      await t.run(async (ctx) => {
        await ctx.db.insert('userSettings', {
          userId,
          theme: 'dark',
          defaultVisibility: 'private',
          emailNotifications: true,
          enabledModels: { openai: ['gpt-4', 'gpt-3.5-turbo'] },
          updatedAt: new Date().toISOString(),
        });
      });

      await t
        .withIdentity({ subject: clerkId, email: 'test@example.com' })
        .mutation(api.functions.settings.toggleModel, {
          provider: 'openai',
          modelId: 'gpt-4',
          enabled: false,
        });

      const result = await t
        .withIdentity({ subject: clerkId })
        .query(api.functions.settings.getEnabledModels, {});

      expect(result?.openai).not.toContain('gpt-4');
      expect(result?.openai).toContain('gpt-3.5-turbo');
    });
  });

  describe('getEnabledModels', () => {
    it('returns empty object for unauthenticated user', async () => {
      const t = createTestContext();

      const result = await t.query(api.functions.settings.getEnabledModels, {});

      expect(result).toEqual({});
    });

    it('returns enabled models for user', async () => {
      const t = createTestContext();
      const { userId, clerkId } = await withTestUser(t);

      await t.run(async (ctx) => {
        await ctx.db.insert('userSettings', {
          userId,
          theme: 'dark',
          defaultVisibility: 'private',
          emailNotifications: true,
          enabledModels: {
            openai: ['gpt-4'],
            anthropic: ['claude-3'],
          },
          updatedAt: new Date().toISOString(),
        });
      });

      const result = await t
        .withIdentity({ subject: clerkId })
        .query(api.functions.settings.getEnabledModels, {});

      expect(result?.openai).toEqual(['gpt-4']);
      expect(result?.anthropic).toEqual(['claude-3']);
    });
  });
});
