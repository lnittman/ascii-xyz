import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { getUserId } from '../../lib/auth';

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    return await ctx.storage.generateUploadUrl();
  },
});

export const createFileRecord = mutation({
  args: {
    storageId: v.id('_storage'),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    artworkId: v.optional(v.id('artworks')),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', userId))
      .unique();
    if (!user) throw new Error('User not found');

    if (args.artworkId) {
      const artwork = await ctx.db.get(args.artworkId);
      if (!artwork || artwork.userId !== user._id) {
        throw new Error('Artwork not found or unauthorized');
      }
    }

    const fileId = await ctx.db.insert('files', {
      storageId: args.storageId,
      userId: user._id,
      artworkId: args.artworkId,
      filename: args.filename,
      mimeType: args.mimeType,
      size: args.size,
      createdAt: new Date().toISOString(),
    });

    return fileId;
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id('files') },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', userId))
      .unique();
    if (!user) throw new Error('User not found');

    const file = await ctx.db.get(args.fileId);
    if (!file || file.userId !== user._id) {
      throw new Error('File not found or unauthorized');
    }

    await ctx.storage.delete(file.storageId);
    await ctx.db.delete(args.fileId);
  },
});

