import { describe, it, expect, beforeEach } from 'vitest';
import { api } from '../convex/_generated/api';
import {
  createTestContext,
  withTestUser,
  type TestContext,
  type TestUser,
} from './setup';

describe('Combine Action', () => {
  let t: TestContext;
  let _testUser: TestUser;

  // Sample artworks for testing
  const artwork1 = {
    frames: [
      '****\n****\n****',
      '....\n....\n....',
      '####\n####\n####',
    ],
    metadata: {
      width: 4,
      height: 3,
      fps: 12,
    },
  };

  const artwork2 = {
    frames: [
      'AAAA\nAAAA\nAAAA',
      'BBBB\nBBBB\nBBBB',
    ],
    metadata: {
      width: 4,
      height: 3,
      fps: 10,
    },
  };

  beforeEach(async () => {
    t = createTestContext();
    _testUser = await withTestUser(t);
  });

  describe('sequence mode', () => {
    it('concatenates frames from both artworks', async () => {
      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1,
        artwork2,
        combinationType: 'sequence',
        prompt: 'Play one after another',
        apiKey: 'sk-or-v1-test-key',
      });

      expect(result.frames.length).toBe(artwork1.frames.length + artwork2.frames.length);
      expect(result.frames[0]).toBe(artwork1.frames[0]);
      expect(result.frames[artwork1.frames.length]).toBe(artwork2.frames[0]);
    });

    it('uses max dimensions from both artworks', async () => {
      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1,
        artwork2,
        combinationType: 'sequence',
        prompt: 'Sequential',
        apiKey: 'sk-or-v1-test-key',
      });

      expect(result.metadata.width).toBe(Math.max(artwork1.metadata.width, artwork2.metadata.width));
      expect(result.metadata.height).toBe(Math.max(artwork1.metadata.height, artwork2.metadata.height));
    });

    it('uses first artwork FPS', async () => {
      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1,
        artwork2,
        combinationType: 'sequence',
        prompt: 'Sequential',
        apiKey: 'sk-or-v1-test-key',
      });

      expect(result.metadata.fps).toBe(artwork1.metadata.fps);
    });
  });

  describe('interleave mode', () => {
    it('alternates frames from each artwork', async () => {
      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1,
        artwork2,
        combinationType: 'interleave',
        prompt: 'Alternate frames',
        apiKey: 'sk-or-v1-test-key',
      });

      // First frame should be from artwork1
      expect(result.frames[0]).toBe(artwork1.frames[0]);
      // Second frame should be from artwork2
      expect(result.frames[1]).toBe(artwork2.frames[0]);
      // Third frame should be from artwork1
      expect(result.frames[2]).toBe(artwork1.frames[1]);
    });

    it('handles different frame counts', async () => {
      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1, // 3 frames
        artwork2, // 2 frames
        combinationType: 'interleave',
        prompt: 'Alternate',
        apiKey: 'sk-or-v1-test-key',
      });

      // Should have 5 frames: a1[0], a2[0], a1[1], a2[1], a1[2]
      expect(result.frames.length).toBe(5);
    });

    it('uses max FPS from both artworks', async () => {
      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1,
        artwork2,
        combinationType: 'interleave',
        prompt: 'Alternate',
        apiKey: 'sk-or-v1-test-key',
      });

      expect(result.metadata.fps).toBe(Math.max(artwork1.metadata.fps, artwork2.metadata.fps));
    });
  });

  describe('split mode', () => {
    it('combines artworks side by side when small enough', async () => {
      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1,
        artwork2,
        combinationType: 'split',
        prompt: 'Side by side',
        apiKey: 'sk-or-v1-test-key',
      });

      // Width should be combined (4 + 4 + 2 for separator = 10)
      expect(result.metadata.width).toBe(artwork1.metadata.width + artwork2.metadata.width + 2);
      // Height should be max of both
      expect(result.metadata.height).toBe(Math.max(artwork1.metadata.height, artwork2.metadata.height));
    });

    it('loops shorter artwork to match longer', async () => {
      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1, // 3 frames
        artwork2, // 2 frames
        combinationType: 'split',
        prompt: 'Split view',
        apiKey: 'sk-or-v1-test-key',
      });

      // Should create 3 frames (max of both)
      expect(result.frames.length).toBe(Math.max(artwork1.frames.length, artwork2.frames.length));
    });

    it('includes separator in combined frames', async () => {
      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1,
        artwork2,
        combinationType: 'split',
        prompt: 'Side by side',
        apiKey: 'sk-or-v1-test-key',
      });

      // Each frame should contain the separator
      expect(result.frames[0]).toContain(' | ');
    });
  });

  describe('metadata', () => {
    it('includes combination type in metadata', async () => {
      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1,
        artwork2,
        combinationType: 'sequence',
        prompt: 'Test',
        apiKey: 'sk-or-v1-test-key',
      });

      expect(result.metadata.combinationType).toBe('sequence');
    });

    it('includes prompt in metadata', async () => {
      const prompt = 'Custom combination prompt';
      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1,
        artwork2,
        combinationType: 'sequence',
        prompt,
        apiKey: 'sk-or-v1-test-key',
      });

      expect(result.metadata.prompt).toBe(prompt);
    });

    it('includes correct frame count', async () => {
      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1,
        artwork2,
        combinationType: 'sequence',
        prompt: 'Test',
        apiKey: 'sk-or-v1-test-key',
      });

      expect(result.metadata.frameCount).toBe(result.frames.length);
    });

    it('includes generation timestamp', async () => {
      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1,
        artwork2,
        combinationType: 'sequence',
        prompt: 'Test',
        apiKey: 'sk-or-v1-test-key',
      });

      expect(result.metadata.generatedAt).toBeDefined();
      expect(new Date(result.metadata.generatedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('edge cases', () => {
    it('handles single-frame artworks', async () => {
      const singleFrameArtwork = {
        frames: ['X'],
        metadata: { width: 1, height: 1, fps: 1 },
      };

      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1: singleFrameArtwork,
        artwork2: singleFrameArtwork,
        combinationType: 'sequence',
        prompt: 'Single frames',
        apiKey: 'sk-or-v1-test-key',
      });

      expect(result.frames.length).toBe(2);
    });

    it('handles artworks with different dimensions', async () => {
      const wideArtwork = {
        frames: ['WIDE_FRAME'],
        metadata: { width: 10, height: 1, fps: 12 },
      };
      const tallArtwork = {
        frames: ['T\nA\nL\nL'],
        metadata: { width: 1, height: 4, fps: 12 },
      };

      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1: wideArtwork,
        artwork2: tallArtwork,
        combinationType: 'sequence',
        prompt: 'Different sizes',
        apiKey: 'sk-or-v1-test-key',
      });

      expect(result.metadata.width).toBe(10);
      expect(result.metadata.height).toBe(4);
    });

    it('handles artworks with very different FPS', async () => {
      const slowArtwork = {
        frames: ['S'],
        metadata: { width: 1, height: 1, fps: 1 },
      };
      const fastArtwork = {
        frames: ['F'],
        metadata: { width: 1, height: 1, fps: 60 },
      };

      const result = await t.action(api.functions.actions.combine.combine, {
        artwork1: slowArtwork,
        artwork2: fastArtwork,
        combinationType: 'interleave',
        prompt: 'Different speeds',
        apiKey: 'sk-or-v1-test-key',
      });

      expect(result.metadata.fps).toBe(60); // Max of both
    });
  });
});
