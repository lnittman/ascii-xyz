import { describe, expect, it } from 'vitest';
import { api } from '../convex/_generated/api';
import { createTestContext, withTestUser, withTestGeneration } from './setup';

describe('Generations Queries', () => {
  describe('getGeneration', () => {
    it('returns null for non-existent generation', async () => {
      const t = createTestContext();

      // Create a generation first, then delete it to get a valid but non-existent ID
      const genId = await withTestGeneration(t);
      await t.run(async (ctx) => {
        await ctx.db.delete(genId);
      });

      const result = await t.query(api.functions.queries.generations.getGeneration, {
        generationId: genId,
      });

      expect(result).toBeNull();
    });

    it('returns generation data for valid ID', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      const genId = await withTestGeneration(t, {
        userId: clerkId,
        prompt: 'A beautiful sunset',
        modelId: 'gpt-4',
        status: 'planning',
      });

      const result = await t.query(api.functions.queries.generations.getGeneration, {
        generationId: genId,
      });

      expect(result).not.toBeNull();
      expect(result?.prompt).toBe('A beautiful sunset');
      expect(result?.modelId).toBe('gpt-4');
      expect(result?.status).toBe('planning');
    });

    it('returns generation with progress data', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      const genId = await withTestGeneration(t, {
        userId: clerkId,
        prompt: 'Animated waves',
        status: 'generating',
        currentFrame: 5,
        totalFrames: 10,
        frames: ['f1', 'f2', 'f3', 'f4', 'f5'],
      });

      const result = await t.query(api.functions.queries.generations.getGeneration, {
        generationId: genId,
      });

      expect(result?.status).toBe('generating');
      expect(result?.currentFrame).toBe(5);
      expect(result?.totalFrames).toBe(10);
      expect(result?.frames).toHaveLength(5);
    });

    it('does not expose API key', async () => {
      const t = createTestContext();

      const genId = await withTestGeneration(t, {
        prompt: 'Test prompt',
        apiKey: 'sk-secret-key-12345',
      });

      const result = await t.query(api.functions.queries.generations.getGeneration, {
        generationId: genId,
      });

      expect(result).not.toBeNull();
      expect(result?.prompt).toBe('Test prompt');
      // API key should not be exposed
      expect((result as Record<string, unknown>)?.apiKey).toBeUndefined();
    });
  });

  describe('getUserGenerations', () => {
    it('returns empty array for user with no generations', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      const result = await t.query(api.functions.queries.generations.getUserGenerations, {
        userId: clerkId,
      });

      expect(result).toEqual([]);
    });

    it('returns generations for user', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      await withTestGeneration(t, { userId: clerkId, prompt: 'Gen 1' });
      await withTestGeneration(t, { userId: clerkId, prompt: 'Gen 2' });

      const result = await t.query(api.functions.queries.generations.getUserGenerations, {
        userId: clerkId,
      });

      expect(result).toHaveLength(2);
    });

    it('respects limit parameter', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      // Create 5 generations
      for (let i = 0; i < 5; i++) {
        await withTestGeneration(t, { userId: clerkId, prompt: `Gen ${i}` });
      }

      const result = await t.query(api.functions.queries.generations.getUserGenerations, {
        userId: clerkId,
        limit: 3,
      });

      expect(result).toHaveLength(3);
    });

    it('does not return other users generations', async () => {
      const t = createTestContext();
      const user1 = await withTestUser(t);
      const user2 = await withTestUser(t);

      await withTestGeneration(t, { userId: user1.clerkId, prompt: 'User 1 gen' });
      await withTestGeneration(t, { userId: user2.clerkId, prompt: 'User 2 gen' });

      const result = await t.query(api.functions.queries.generations.getUserGenerations, {
        userId: user1.clerkId,
      });

      expect(result).toHaveLength(1);
      expect(result[0].prompt).toBe('User 1 gen');
    });

    it('does not expose API keys in list', async () => {
      const t = createTestContext();
      const { clerkId } = await withTestUser(t);

      await withTestGeneration(t, {
        userId: clerkId,
        prompt: 'Test',
        apiKey: 'sk-secret',
      });

      const result = await t.query(api.functions.queries.generations.getUserGenerations, {
        userId: clerkId,
      });

      expect(result).toHaveLength(1);
      expect((result[0] as Record<string, unknown>)?.apiKey).toBeUndefined();
    });
  });

  describe('getActiveGenerations', () => {
    it('returns empty array when no active generations', async () => {
      const t = createTestContext();

      const result = await t.query(api.functions.queries.generations.getActiveGenerations, {});

      expect(result).toEqual([]);
    });

    it('returns planning generations', async () => {
      const t = createTestContext();

      await withTestGeneration(t, { status: 'planning', prompt: 'Planning gen' });

      const result = await t.query(api.functions.queries.generations.getActiveGenerations, {});

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('planning');
    });

    it('returns generating generations', async () => {
      const t = createTestContext();

      await withTestGeneration(t, { status: 'generating', prompt: 'Generating gen' });

      const result = await t.query(api.functions.queries.generations.getActiveGenerations, {});

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('generating');
    });

    it('does not return completed generations', async () => {
      const t = createTestContext();

      await withTestGeneration(t, { status: 'completed', prompt: 'Completed gen' });
      await withTestGeneration(t, { status: 'planning', prompt: 'Active gen' });

      const result = await t.query(api.functions.queries.generations.getActiveGenerations, {});

      expect(result).toHaveLength(1);
      expect(result[0].prompt).toBe('Active gen');
    });

    it('does not return failed generations', async () => {
      const t = createTestContext();

      await withTestGeneration(t, { status: 'failed', error: 'Error', prompt: 'Failed gen' });
      await withTestGeneration(t, { status: 'generating', prompt: 'Active gen' });

      const result = await t.query(api.functions.queries.generations.getActiveGenerations, {});

      expect(result).toHaveLength(1);
      expect(result[0].prompt).toBe('Active gen');
    });

    it('limits results to 20', async () => {
      const t = createTestContext();

      // Create 25 active generations
      for (let i = 0; i < 25; i++) {
        await withTestGeneration(t, { status: 'planning', prompt: `Gen ${i}` });
      }

      const result = await t.query(api.functions.queries.generations.getActiveGenerations, {});

      expect(result).toHaveLength(20);
    });

    it('does not expose API keys', async () => {
      const t = createTestContext();

      await withTestGeneration(t, {
        status: 'planning',
        apiKey: 'sk-secret',
      });

      const result = await t.query(api.functions.queries.generations.getActiveGenerations, {});

      expect(result).toHaveLength(1);
      expect((result[0] as Record<string, unknown>)?.apiKey).toBeUndefined();
    });
  });
});

describe('Generation Progress Flow', () => {
  it('tracks progress from planning to completion', async () => {
    const t = createTestContext();
    const { clerkId } = await withTestUser(t);

    // Create generation in planning state
    const genId = await withTestGeneration(t, {
      userId: clerkId,
      status: 'planning',
      prompt: 'Test animation',
    });

    // Verify initial state
    let gen = await t.query(api.functions.queries.generations.getGeneration, { generationId: genId });
    expect(gen?.status).toBe('planning');
    expect(gen?.currentFrame).toBe(0);

    // Simulate transition to generating with totalFrames
    await t.run(async (ctx) => {
      await ctx.db.patch(genId, {
        status: 'generating',
        totalFrames: 5,
      });
    });

    gen = await t.query(api.functions.queries.generations.getGeneration, { generationId: genId });
    expect(gen?.status).toBe('generating');
    expect(gen?.totalFrames).toBe(5);

    // Simulate frame updates
    await t.run(async (ctx) => {
      await ctx.db.patch(genId, {
        frames: ['frame1'],
        currentFrame: 1,
      });
    });

    gen = await t.query(api.functions.queries.generations.getGeneration, { generationId: genId });
    expect(gen?.currentFrame).toBe(1);
    expect(gen?.frames).toHaveLength(1);

    // Simulate completion
    await t.run(async (ctx) => {
      await ctx.db.patch(genId, {
        status: 'completed',
        frames: ['f1', 'f2', 'f3', 'f4', 'f5'],
        currentFrame: 5,
        completedAt: new Date().toISOString(),
      });
    });

    gen = await t.query(api.functions.queries.generations.getGeneration, { generationId: genId });
    expect(gen?.status).toBe('completed');
    expect(gen?.currentFrame).toBe(5);
    expect(gen?.frames).toHaveLength(5);
    expect(gen?.completedAt).toBeDefined();
  });

  it('tracks error state correctly', async () => {
    const t = createTestContext();

    const genId = await withTestGeneration(t, {
      status: 'generating',
      currentFrame: 3,
      totalFrames: 10,
    });

    // Simulate error
    await t.run(async (ctx) => {
      await ctx.db.patch(genId, {
        status: 'failed',
        error: 'API rate limit exceeded',
      });
    });

    const gen = await t.query(api.functions.queries.generations.getGeneration, { generationId: genId });
    expect(gen?.status).toBe('failed');
    expect(gen?.error).toBe('API rate limit exceeded');
    // Progress data should still be available
    expect(gen?.currentFrame).toBe(3);
    expect(gen?.totalFrames).toBe(10);
  });
});

describe('retryGeneration mutation', () => {
  it('creates a new generation from a failed one', async () => {
    const t = createTestContext();
    const { clerkId } = await withTestUser(t);

    const originalId = await withTestGeneration(t, {
      userId: clerkId,
      prompt: 'A dancing robot',
      modelId: 'claude-3.5-sonnet',
      status: 'failed',
      error: 'Rate limited',
    });

    const newGenerationId = await t.mutation(api.functions.mutations.generations.retryGeneration, {
      generationId: originalId,
    });

    expect(newGenerationId).toBeDefined();

    // Verify new generation has same prompt and model
    const newGen = await t.run(async (ctx) => ctx.db.get(newGenerationId));
    expect(newGen).toBeDefined();
    expect(newGen!.prompt).toBe('A dancing robot');
    expect(newGen!.modelId).toBe('claude-3.5-sonnet');
    expect(newGen!.status).toBe('pending');
    expect(newGen!.userId).toBe(clerkId);
    // Should have a fresh start
    expect(newGen!.frames).toEqual([]);
    expect(newGen!.currentFrame).toBe(0);
    expect(newGen!.error).toBeUndefined();
  });

  it('links retry to original generation', async () => {
    const t = createTestContext();
    const { clerkId } = await withTestUser(t);

    const originalId = await withTestGeneration(t, {
      userId: clerkId,
      prompt: 'Test prompt',
      status: 'failed',
    });

    const newGenerationId = await t.mutation(api.functions.mutations.generations.retryGeneration, {
      generationId: originalId,
    });

    const newGen = await t.run(async (ctx) => ctx.db.get(newGenerationId));
    expect(newGen!.retriedFrom).toBe(originalId);
  });

  it('allows retry of completed generation', async () => {
    const t = createTestContext();
    const { clerkId } = await withTestUser(t);

    const originalId = await withTestGeneration(t, {
      userId: clerkId,
      prompt: 'Completed art',
      modelId: 'gpt-4',
      status: 'completed',
      frames: ['frame1', 'frame2'],
    });

    const newGenerationId = await t.mutation(api.functions.mutations.generations.retryGeneration, {
      generationId: originalId,
    });

    const newGen = await t.run(async (ctx) => ctx.db.get(newGenerationId));
    expect(newGen!.prompt).toBe('Completed art');
    expect(newGen!.modelId).toBe('gpt-4');
    expect(newGen!.status).toBe('pending');
    expect(newGen!.frames).toEqual([]);
  });

  it('allows override of model', async () => {
    const t = createTestContext();
    const { clerkId } = await withTestUser(t);

    const originalId = await withTestGeneration(t, {
      userId: clerkId,
      prompt: 'Test',
      modelId: 'old-model',
      status: 'failed',
    });

    const newGenerationId = await t.mutation(api.functions.mutations.generations.retryGeneration, {
      generationId: originalId,
      overrides: { modelId: 'new-model' },
    });

    const newGen = await t.run(async (ctx) => ctx.db.get(newGenerationId));
    expect(newGen!.modelId).toBe('new-model');
  });

  it('allows override of prompt', async () => {
    const t = createTestContext();
    const { clerkId } = await withTestUser(t);

    const originalId = await withTestGeneration(t, {
      userId: clerkId,
      prompt: 'Original prompt',
      status: 'failed',
    });

    const newGenerationId = await t.mutation(api.functions.mutations.generations.retryGeneration, {
      generationId: originalId,
      overrides: { prompt: 'Modified prompt' },
    });

    const newGen = await t.run(async (ctx) => ctx.db.get(newGenerationId));
    expect(newGen!.prompt).toBe('Modified prompt');
  });

  it('throws for non-existent generation', async () => {
    const t = createTestContext();

    // Create and delete to get valid ID format
    const genId = await withTestGeneration(t, { prompt: 'temp' });
    await t.run(async (ctx) => {
      await ctx.db.delete(genId);
    });

    await expect(
      t.mutation(api.functions.mutations.generations.retryGeneration, {
        generationId: genId,
      })
    ).rejects.toThrow('Generation not found');
  });

  it('throws for in-progress generation', async () => {
    const t = createTestContext();

    const genId = await withTestGeneration(t, {
      prompt: 'In progress',
      status: 'generating',
    });

    await expect(
      t.mutation(api.functions.mutations.generations.retryGeneration, {
        generationId: genId,
      })
    ).rejects.toThrow('Cannot retry an active generation');
  });

  it('throws for planning generation', async () => {
    const t = createTestContext();

    const genId = await withTestGeneration(t, {
      prompt: 'Planning',
      status: 'planning',
    });

    await expect(
      t.mutation(api.functions.mutations.generations.retryGeneration, {
        generationId: genId,
      })
    ).rejects.toThrow('Cannot retry an active generation');
  });
});
