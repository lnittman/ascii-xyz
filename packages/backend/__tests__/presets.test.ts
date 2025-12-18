import { describe, expect, it } from 'vitest';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { createTestContext, withTestUser } from './setup';

describe('Presets', () => {
  describe('system presets', () => {
    it('lists system presets', async () => {
      const t = createTestContext();

      // Seed system presets
      await t.run(async (ctx) => {
        await ctx.db.insert('presets', {
          name: 'Minimal',
          description: 'Clean, minimal ASCII art',
          type: 'system',
          settings: {
            style: 'minimal',
            width: 60,
            height: 20,
            fps: 8,
          },
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await ctx.db.insert('presets', {
          name: 'Cinematic',
          description: 'Wide format, smooth animation',
          type: 'system',
          settings: {
            style: 'cinematic',
            width: 120,
            height: 40,
            fps: 24,
          },
          isEnabled: true,
          sortOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const presets = await t.query(api.functions.queries.presets.listSystemPresets);
      expect(presets).toHaveLength(2);
      expect(presets[0].name).toBe('Minimal');
      expect(presets[1].name).toBe('Cinematic');
    });

    it('filters out disabled system presets', async () => {
      const t = createTestContext();

      await t.run(async (ctx) => {
        await ctx.db.insert('presets', {
          name: 'Active Preset',
          description: 'Active',
          type: 'system',
          settings: { style: 'default', width: 80, height: 24, fps: 10 },
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await ctx.db.insert('presets', {
          name: 'Disabled Preset',
          description: 'Disabled',
          type: 'system',
          settings: { style: 'default', width: 80, height: 24, fps: 10 },
          isEnabled: false,
          sortOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const presets = await t.query(api.functions.queries.presets.listSystemPresets);
      expect(presets).toHaveLength(1);
      expect(presets[0].name).toBe('Active Preset');
    });
  });

  describe('user presets', () => {
    it('creates a user preset', async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);

      const presetId = await t.mutation(api.functions.mutations.presets.createUserPreset, {
        name: 'My Style',
        description: 'My favorite settings',
        settings: {
          style: 'retro',
          width: 80,
          height: 30,
          fps: 12,
          modelId: 'claude-3.5-sonnet',
        },
        promptTemplate: 'Create {{subject}} in a retro pixel style',
        userId,
      });

      expect(presetId).toBeDefined();

      // Verify it was created
      const preset = await t.run(async (ctx) => {
        return ctx.db.get(presetId);
      });

      expect(preset).toBeDefined();
      expect(preset!.name).toBe('My Style');
      expect(preset!.type).toBe('user');
      expect(preset!.settings.fps).toBe(12);
    });

    it('lists user presets for a specific user', async () => {
      const t = createTestContext();
      const { userId: userId1 } = await withTestUser(t, { clerkId: 'user_1' });
      const { userId: userId2 } = await withTestUser(t, { clerkId: 'user_2' });

      await t.run(async (ctx) => {
        // User 1's presets
        await ctx.db.insert('presets', {
          name: 'User 1 Preset',
          description: 'First preset',
          type: 'user',
          userId: userId1,
          settings: { style: 'default', width: 80, height: 24, fps: 10 },
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // User 2's preset
        await ctx.db.insert('presets', {
          name: 'User 2 Preset',
          description: 'Different user',
          type: 'user',
          userId: userId2,
          settings: { style: 'default', width: 80, height: 24, fps: 10 },
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const user1Presets = await t.query(api.functions.queries.presets.listUserPresets, {
        userId: userId1,
      });

      expect(user1Presets).toHaveLength(1);
      expect(user1Presets[0].name).toBe('User 1 Preset');
    });

    it('updates a user preset', async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);

      let presetId: Id<'presets'>;
      await t.run(async (ctx) => {
        presetId = await ctx.db.insert('presets', {
          name: 'Original Name',
          description: 'Original description',
          type: 'user',
          userId,
          settings: { style: 'default', width: 80, height: 24, fps: 10 },
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      await t.mutation(api.functions.mutations.presets.updateUserPreset, {
        presetId: presetId!,
        name: 'Updated Name',
        settings: { style: 'cinematic', width: 120, height: 40, fps: 24 },
      });

      const updated = await t.run(async (ctx) => {
        return ctx.db.get(presetId!);
      });

      expect(updated!.name).toBe('Updated Name');
      expect(updated!.settings.style).toBe('cinematic');
      expect(updated!.settings.fps).toBe(24);
    });

    it('deletes a user preset', async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);

      let presetId: Id<'presets'>;
      await t.run(async (ctx) => {
        presetId = await ctx.db.insert('presets', {
          name: 'To Delete',
          description: 'Will be deleted',
          type: 'user',
          userId,
          settings: { style: 'default', width: 80, height: 24, fps: 10 },
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      await t.mutation(api.functions.mutations.presets.deleteUserPreset, {
        presetId: presetId!,
      });

      const deleted = await t.run(async (ctx) => {
        return ctx.db.get(presetId!);
      });

      expect(deleted).toBeNull();
    });

    it('prevents deletion of system presets', async () => {
      const t = createTestContext();

      let presetId: Id<'presets'>;
      await t.run(async (ctx) => {
        presetId = await ctx.db.insert('presets', {
          name: 'System Preset',
          description: 'Cannot delete',
          type: 'system',
          settings: { style: 'default', width: 80, height: 24, fps: 10 },
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      await expect(
        t.mutation(api.functions.mutations.presets.deleteUserPreset, {
          presetId: presetId!,
        })
      ).rejects.toThrow('Cannot delete system presets');
    });
  });

  describe('preset retrieval', () => {
    it('gets a preset by id', async () => {
      const t = createTestContext();

      let presetId: Id<'presets'>;
      await t.run(async (ctx) => {
        presetId = await ctx.db.insert('presets', {
          name: 'Get Me',
          description: 'Retrieve this',
          type: 'system',
          settings: {
            style: 'neon',
            width: 100,
            height: 30,
            fps: 15,
            modelId: 'claude-3-opus',
          },
          promptTemplate: 'Create {{subject}} with neon lights',
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const preset = await t.query(api.functions.queries.presets.getPreset, {
        presetId: presetId!,
      });

      expect(preset).toBeDefined();
      expect(preset!.name).toBe('Get Me');
      expect(preset!.settings.style).toBe('neon');
      expect(preset!.promptTemplate).toBe('Create {{subject}} with neon lights');
    });

    it('returns null for non-existent preset', async () => {
      const t = createTestContext();

      // Create a dummy preset to get a valid ID format, then delete it
      let presetId: Id<'presets'>;
      await t.run(async (ctx) => {
        presetId = await ctx.db.insert('presets', {
          name: 'Temp',
          description: 'Temp',
          type: 'system',
          settings: { style: 'default', width: 80, height: 24, fps: 10 },
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await ctx.db.delete(presetId);
      });

      const preset = await t.query(api.functions.queries.presets.getPreset, {
        presetId: presetId!,
      });

      expect(preset).toBeNull();
    });
  });

  describe('all presets', () => {
    it('lists all available presets for a user (system + user)', async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);

      await t.run(async (ctx) => {
        // System preset
        await ctx.db.insert('presets', {
          name: 'System Preset',
          description: 'System',
          type: 'system',
          settings: { style: 'default', width: 80, height: 24, fps: 10 },
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // User's preset
        await ctx.db.insert('presets', {
          name: 'User Preset',
          description: 'User',
          type: 'user',
          userId,
          settings: { style: 'custom', width: 100, height: 30, fps: 12 },
          isEnabled: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      const allPresets = await t.query(api.functions.queries.presets.listAllPresets, {
        userId,
      });

      expect(allPresets).toHaveLength(2);
      expect(allPresets.map((p) => p.type)).toContain('system');
      expect(allPresets.map((p) => p.type)).toContain('user');
    });
  });

  describe('preset settings', () => {
    it('validates required settings fields', async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);

      const presetId = await t.mutation(api.functions.mutations.presets.createUserPreset, {
        name: 'Partial Settings',
        settings: {
          style: 'minimal',
          width: 80,
          height: 24,
          fps: 10,
        },
        userId,
      });

      const preset = await t.run(async (ctx) => {
        return ctx.db.get(presetId);
      });

      expect(preset!.settings.width).toBe(80);
      expect(preset!.settings.height).toBe(24);
      expect(preset!.settings.fps).toBe(10);
    });

    it('stores optional modelId and promptTemplate', async () => {
      const t = createTestContext();
      const { userId } = await withTestUser(t);

      const presetId = await t.mutation(api.functions.mutations.presets.createUserPreset, {
        name: 'Full Settings',
        description: 'With all options',
        settings: {
          style: 'matrix',
          width: 120,
          height: 40,
          fps: 30,
          modelId: 'gpt-4',
        },
        promptTemplate: 'Generate {{subject}} in Matrix green rain style',
        userId,
      });

      const preset = await t.run(async (ctx) => {
        return ctx.db.get(presetId);
      });

      expect(preset!.settings.modelId).toBe('gpt-4');
      expect(preset!.promptTemplate).toBe('Generate {{subject}} in Matrix green rain style');
    });
  });

  describe('seed system presets', () => {
    it('seeds default system presets', async () => {
      const t = createTestContext();

      const result = await t.mutation(api.functions.mutations.presets.seedSystemPresets);
      expect(result.seeded).toBeGreaterThan(0);

      const presets = await t.query(api.functions.queries.presets.listSystemPresets);
      expect(presets.length).toBe(result.seeded);
      expect(presets.some((p) => p.name === 'Minimal')).toBe(true);
      expect(presets.some((p) => p.name === 'Cinematic')).toBe(true);
    });

    it('is idempotent - does not duplicate presets', async () => {
      const t = createTestContext();

      await t.mutation(api.functions.mutations.presets.seedSystemPresets);
      const result = await t.mutation(api.functions.mutations.presets.seedSystemPresets);

      expect(result.seeded).toBe(0);
      expect(result.message).toBe('System presets already exist');
    });
  });
});
