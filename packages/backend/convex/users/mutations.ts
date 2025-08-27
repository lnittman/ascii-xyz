import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { UserJSON } from "@clerk/backend";

// Upsert user from Clerk webhook
export const upsertFromClerk = internalMutation({
  args: { 
    data: v.any() 
  },
  handler: async (ctx, { data }) => {
    const userData = data as UserJSON;
    
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userData.id))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: userData.email_addresses[0]?.email_address ?? "",
        name: `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim() || undefined,
        imageUrl: userData.image_url || undefined,
        updatedAt: new Date().toISOString(),
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: userData.id,
        email: userData.email_addresses[0]?.email_address ?? "",
        name: `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim() || undefined,
        imageUrl: userData.image_url || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return userId;
    }
  },
});

// Delete user from Clerk webhook
export const deleteFromClerk = internalMutation({
  args: { 
    clerkUserId: v.string() 
  },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
      .unique();

    if (user) {
      // Delete user's artworks
      const artworks = await ctx.db
        .query("artworks")
        .withIndex("by_user", (q) => q.eq("userId", clerkUserId))
        .collect();
      
      for (const artwork of artworks) {
        await ctx.db.delete(artwork._id);
      }

      // Delete user's collections
      const collections = await ctx.db
        .query("collections")
        .filter(q => q.eq(q.field("userId"), user._id))
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
    }
  },
});