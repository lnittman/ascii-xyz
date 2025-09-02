import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { getUserId } from '../../lib/auth';

export const getUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});

export const getFile = query({
  args: { fileId: v.id('files') },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) return null;
    const url = await ctx.storage.getUrl(file.storageId);
    return { ...file, url };
  },
});

export const listUserFiles = query({
  args: { artworkId: v.optional(v.id('artworks')) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', userId))
      .unique();
    if (!user) return [];

    const q = ctx.db
      .query('files')
      .withIndex('by_user', (qq) => qq.eq('userId', user._id));

    const files = await q.collect();

    if (args.artworkId) {
      return files.filter((f) => f.artworkId === args.artworkId);
    }

    return await Promise.all(
      files.map(async (file) => {
        const url = await ctx.storage.getUrl(file.storageId);
        return { ...file, url };
      })
    );
  },
});

