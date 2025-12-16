import { convexTest } from 'convex-test';
import type { Id } from '../convex/_generated/dataModel';
import schema from '../convex/schema';
import { modules } from '../test-setup/convex.setup';

export type TestContext = ReturnType<typeof convexTest<typeof schema>>;

export interface TestUser {
  userId: Id<'users'>;
  clerkId: string;
  email: string;
}

export function createTestContext(): TestContext {
  return convexTest(schema, modules);
}

export async function withTestUser(
  t: TestContext,
  overrides: Partial<{
    clerkId: string;
    email: string;
    name: string;
    imageUrl: string;
  }> = {}
): Promise<TestUser> {
  const clerkId =
    overrides.clerkId ??
    `test-clerk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = overrides.email ?? `test-${clerkId}@example.com`;

  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert('users', {
      clerkId,
      email,
      name: overrides.name,
      imageUrl: overrides.imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  return { userId, clerkId, email };
}

export async function withTestSettings(
  t: TestContext,
  userId: Id<'users'>,
  overrides: Partial<{
    theme: 'light' | 'dark' | 'system';
    defaultVisibility: 'public' | 'private';
    emailNotifications: boolean;
    defaultModelId: string;
  }> = {}
): Promise<Id<'userSettings'>> {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('userSettings', {
      userId,
      theme: overrides.theme ?? 'dark',
      defaultVisibility: overrides.defaultVisibility ?? 'private',
      emailNotifications: overrides.emailNotifications ?? true,
      defaultModelId: overrides.defaultModelId,
      updatedAt: new Date().toISOString(),
    });
  });
}

export async function withTestArtwork(
  t: TestContext,
  clerkId: string,
  overrides: Partial<{
    prompt: string;
    frames: string[];
    visibility: 'public' | 'private' | 'unlisted';
  }> = {}
): Promise<Id<'artworks'>> {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('artworks', {
      userId: clerkId,
      prompt: overrides.prompt ?? 'Test artwork',
      frames: overrides.frames ?? ['test frame'],
      metadata: {
        width: 80,
        height: 24,
        fps: 1,
        generator: 'test',
        model: 'test-model',
        createdAt: new Date().toISOString(),
      },
      visibility: overrides.visibility ?? 'private',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });
}

export { modules };
