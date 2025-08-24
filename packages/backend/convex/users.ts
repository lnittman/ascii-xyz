import { v } from "convex/values";
import { internalMutation, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";

// Get current user
export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

// Get user by ID
export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

// Internal mutation to upsert user from Clerk webhook
export const upsertFromClerk = internalMutation({
  args: { data: v.any() }, // Clerk UserJSON type
  handler: async (ctx, { data }) => {
    const clerkData = data as UserJSON;
    
    // Find existing user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkData.id))
      .unique();

    const userAttributes = {
      clerkId: clerkData.id,
      email: clerkData.email_addresses[0]?.email_address || "",
      name: `${clerkData.first_name || ""} ${clerkData.last_name || ""}`.trim() || undefined,
      imageUrl: clerkData.image_url || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, userAttributes);
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        ...userAttributes,
        createdAt: new Date().toISOString(),
      });
      
      // Create default settings for new user
      await ctx.db.insert("userSettings", {
        userId,
        theme: "dark",
        defaultVisibility: "private",
        emailNotifications: true,
        updatedAt: new Date().toISOString(),
      });
      
      return userId;
    }
  },
});

// Internal mutation to delete user from Clerk webhook
export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
      .unique();

    if (!user) {
      console.warn(`User not found for Clerk ID: ${clerkUserId}`);
      return;
    }

    // Delete user's artworks
    const artworks = await ctx.db
      .query("artworks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    for (const artwork of artworks) {
      await ctx.db.delete(artwork._id);
      
      // Delete associated embeddings
      const embeddings = await ctx.db
        .query("artworkEmbeddings")
        .withIndex("by_artwork", (q) => q.eq("artworkId", artwork._id))
        .collect();
      
      for (const embedding of embeddings) {
        await ctx.db.delete(embedding._id);
      }
      
      // Delete associated shares
      const shares = await ctx.db
        .query("shares")
        .withIndex("by_artwork", (q) => q.eq("artworkId", artwork._id))
        .collect();
      
      for (const share of shares) {
        await ctx.db.delete(share._id);
      }
    }

    // Delete user's collections
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    for (const collection of collections) {
      await ctx.db.delete(collection._id);
    }

    // Delete user settings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    
    if (settings) {
      await ctx.db.delete(settings._id);
    }

    // Finally, delete the user
    await ctx.db.delete(user._id);
  },
});

// Helper functions
export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return user;
}

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}