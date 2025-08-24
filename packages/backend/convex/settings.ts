import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./artworks";

// Get user settings
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) return null;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    return settings;
  },
});

// Update user settings
export const update = mutation({
  args: {
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    defaultVisibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
    emailNotifications: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (args.theme !== undefined) updates.theme = args.theme;
    if (args.defaultVisibility !== undefined) updates.defaultVisibility = args.defaultVisibility;
    if (args.emailNotifications !== undefined) updates.emailNotifications = args.emailNotifications;

    if (settings) {
      await ctx.db.patch(settings._id, updates);
    } else {
      // Create settings if they don't exist
      await ctx.db.insert("userSettings", {
        userId: user._id,
        theme: args.theme || "dark",
        defaultVisibility: args.defaultVisibility || "private",
        emailNotifications: args.emailNotifications ?? true,
        updatedAt: new Date().toISOString(),
      });
    }
  },
});

// Store API key
export const addApiKey = mutation({
  args: {
    name: v.string(),
    key: v.string(),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const newApiKey = {
      name: args.name,
      key: args.key,
      provider: args.provider,
      createdAt: new Date().toISOString(),
    };

    if (settings) {
      const apiKeys = settings.apiKeys || [];
      await ctx.db.patch(settings._id, {
        apiKeys: [...apiKeys, newApiKey],
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create settings with the API key
      await ctx.db.insert("userSettings", {
        userId: user._id,
        theme: "dark",
        defaultVisibility: "private",
        emailNotifications: true,
        apiKeys: [newApiKey],
        updatedAt: new Date().toISOString(),
      });
    }
  },
});

// Remove API key
export const removeApiKey = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) throw new Error("User not found");

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (settings && settings.apiKeys) {
      const filteredKeys = settings.apiKeys.filter(key => key.name !== args.name);
      await ctx.db.patch(settings._id, {
        apiKeys: filteredKeys,
        updatedAt: new Date().toISOString(),
      });
    }
  },
});