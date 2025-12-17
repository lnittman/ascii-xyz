import { describe, it, expect, beforeEach } from 'vitest';
import { internal } from '../convex/_generated/api';
import {
  createTestContext,
  withTestUser,
  withTestGeneration,
  type TestContext,
  type TestUser,
} from './setup';

// Note: Full action tests with external API mocking require integration test setup
// These tests focus on the mutation/query layer that actions depend on

describe('Generation Progress Tracking', () => {
  let t: TestContext;
  let testUser: TestUser;

  beforeEach(async () => {
    t = createTestContext();
    testUser = await withTestUser(t);
  });

  it('tracks frame-by-frame progress', async () => {
    const generationId = await withTestGeneration(t, {
      userId: testUser.clerkId,
      prompt: 'Progress test',
      status: 'generating',
      totalFrames: 10,
      currentFrame: 0,
    });

    // Simulate frame updates
    for (let i = 0; i < 5; i++) {
      await t.mutation(internal.functions.mutations.generations.updateGenerationFrame, {
        generationId,
        frame: `Frame ${i}`,
        frameIndex: i,
      });
    }

    const generation = await t.run(async (ctx) => {
      return await ctx.db.get(generationId);
    });

    expect(generation?.frames.length).toBe(5);
    expect(generation?.currentFrame).toBe(5); // frameIndex + 1
  });

  it('handles generation completion', async () => {
    const generationId = await withTestGeneration(t, {
      userId: testUser.clerkId,
      prompt: 'Completion test',
      status: 'generating',
      totalFrames: 3,
    });

    await t.mutation(internal.functions.mutations.generations.updateGeneration, {
      generationId,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    const generation = await t.run(async (ctx) => {
      return await ctx.db.get(generationId);
    });

    expect(generation?.status).toBe('completed');
    expect(generation?.completedAt).toBeDefined();
  });

  it('handles generation failure', async () => {
    const generationId = await withTestGeneration(t, {
      userId: testUser.clerkId,
      prompt: 'Failure test',
      status: 'generating',
    });

    await t.mutation(internal.functions.mutations.generations.updateGeneration, {
      generationId,
      status: 'failed',
      error: 'API timeout',
    });

    const generation = await t.run(async (ctx) => {
      return await ctx.db.get(generationId);
    });

    expect(generation?.status).toBe('failed');
    expect(generation?.error).toBe('API timeout');
  });
});
