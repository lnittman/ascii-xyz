import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./artworks/queries";

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate a short-lived upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

// Store file metadata after upload
export const createFileRecord = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    artworkId: v.optional(v.id("artworks")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    // If artworkId is provided, verify ownership
    if (args.artworkId) {
      const artwork = await ctx.db.get(args.artworkId);
      if (!artwork || artwork.userId !== user._id) {
        throw new Error("Artwork not found or unauthorized");
      }
    }

    const fileId = await ctx.db.insert("files", {
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

// Get file URL
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});

// Get file metadata and URL
export const getFile = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) return null;

    const url = await ctx.storage.getUrl(file.storageId);
    
    return {
      ...file,
      url,
    };
  },
});

// List user's files
export const listUserFiles = query({
  args: {
    artworkId: v.optional(v.id("artworks")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) return [];

    let query = ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    const files = await query.collect();

    // Filter by artwork if specified
    if (args.artworkId) {
      return files.filter(f => f.artworkId === args.artworkId);
    }

    // Get URLs for all files
    return await Promise.all(
      files.map(async (file) => {
        const url = await ctx.storage.getUrl(file.storageId);
        return {
          ...file,
          url,
        };
      })
    );
  },
});

// Delete file
export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    const file = await ctx.db.get(args.fileId);
    if (!file || file.userId !== user._id) {
      throw new Error("File not found or unauthorized");
    }

    // Delete from storage
    await ctx.storage.delete(file.storageId);

    // Delete metadata
    await ctx.db.delete(args.fileId);
  },
});