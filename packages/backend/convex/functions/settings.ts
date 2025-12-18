import { v, ConvexError } from "convex/values";
import { action, mutation, query, internalQuery, internalMutation, MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import type { UserIdentity } from "convex/server";

// Helper to ensure user exists
const ensureUser = async (ctx: MutationCtx, identity: UserIdentity): Promise<Doc<"users"> | null> => {
  // Get user from database
  let user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) {
    // Auto-create user if they don't exist
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email || "",
      name: identity.name,
      imageUrl: identity.pictureUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    user = await ctx.db.get(userId);
  }

  return user;
};

// Get user settings
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) {
      // Return default settings for new users
      return {
        userId: null,
        theme: "dark" as const,
        defaultVisibility: "private" as const,
        emailNotifications: true,
        openrouterApiKey: undefined,
        openaiApiKey: undefined,
        anthropicApiKey: undefined,
        googleApiKey: undefined,
        enabledModels: {},
        defaultModelId: "openrouter/claude-3.5-sonnet",
        updatedAt: new Date().toISOString(),
      };
    }

    // Get settings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    // Return settings or default values
    return settings || {
      userId: user._id,
      theme: "dark" as const,
      defaultVisibility: "private" as const,
      emailNotifications: true,
      openrouterApiKey: undefined,
      openaiApiKey: undefined,
      anthropicApiKey: undefined,
      googleApiKey: undefined,
      enabledModels: {},
      defaultModelId: "openrouter/claude-3.5-sonnet",
      updatedAt: new Date().toISOString(),
    };
  },
});

// Update user settings
export const update = mutation({
  args: {
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    defaultVisibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
    emailNotifications: v.optional(v.boolean()),
    openrouterApiKey: v.optional(v.string()),
    openaiApiKey: v.optional(v.string()),
    anthropicApiKey: v.optional(v.string()),
    googleApiKey: v.optional(v.string()),
    enabledModels: v.optional(v.any()),
    defaultModelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Ensure user exists
    const user = await ensureUser(ctx, identity);
    if (!user) throw new Error("Failed to create or get user");

    // Get existing settings
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const updates = {
      ...args,
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      // Update existing settings
      await ctx.db.patch(existing._id, updates);
    } else {
      // Create new settings
      await ctx.db.insert("userSettings", {
        userId: user._id,
        theme: args.theme || "dark",
        defaultVisibility: args.defaultVisibility || "private",
        emailNotifications: args.emailNotifications ?? true,
        openrouterApiKey: args.openrouterApiKey,
        openaiApiKey: args.openaiApiKey,
        anthropicApiKey: args.anthropicApiKey,
        googleApiKey: args.googleApiKey,
        enabledModels: args.enabledModels || {},
        defaultModelId: args.defaultModelId || "openrouter/claude-3.5-sonnet",
        updatedAt: new Date().toISOString(),
      });
    }
  },
});

// Toggle model enabled status
export const toggleModel = mutation({
  args: {
    provider: v.string(),
    modelId: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, { provider, modelId, enabled }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Ensure user exists
    const user = await ensureUser(ctx, identity);
    if (!user) throw new Error("Failed to create or get user");

    // Get existing settings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const enabledModels = settings?.enabledModels || {};
    
    if (!enabledModels[provider]) {
      enabledModels[provider] = [];
    }

    if (enabled) {
      // Add model if not already enabled
      if (!enabledModels[provider].includes(modelId)) {
        enabledModels[provider].push(modelId);
      }
    } else {
      // Remove model
      enabledModels[provider] = enabledModels[provider].filter((id: string) => id !== modelId);
    }

    // Update settings
    if (settings) {
      await ctx.db.patch(settings._id, {
        enabledModels,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new settings with this model enabled
      await ctx.db.insert("userSettings", {
        userId: user._id,
        theme: "dark",
        defaultVisibility: "private",
        emailNotifications: true,
        enabledModels,
        defaultModelId: "openrouter/claude-3.5-sonnet",
        updatedAt: new Date().toISOString(),
      });
    }
  },
});

// Internal query to get user's API keys
export const getUserApiKeys = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return {
      openrouterApiKey: settings?.openrouterApiKey,
      openaiApiKey: settings?.openaiApiKey,
      anthropicApiKey: settings?.anthropicApiKey,
      googleApiKey: settings?.googleApiKey,
    };
  },
});

// Get user's enabled models
export const getEnabledModels = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) return {};

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return settings?.enabledModels || {};
  },
});

// Verify API key by making real API call to provider
export const verifyApiKey = action({
  args: {
    provider: v.string(),
    apiKey: v.string(),
  },
  handler: async (ctx, { provider, apiKey }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Validate input
    if (!apiKey || apiKey.trim().length === 0) {
      throw new ConvexError("API key cannot be empty");
    }

    // Verify based on provider
    switch (provider) {
      case "openrouter":
        return await verifyOpenRouterKey(apiKey);
      default:
        throw new ConvexError(`Unsupported provider: ${provider}`);
    }
  },
});

// Verify OpenRouter API key
async function verifyOpenRouterKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  let response: Response;

  try {
    response = await fetch("https://openrouter.ai/api/v1/key", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });
  } catch (fetchError) {
    throw new ConvexError(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Failed to connect to OpenRouter'}`);
  }

  // Parse body once
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ConvexError(`Failed to parse OpenRouter response (${response.status})`);
  }

  // Handle error responses
  if (!response.ok) {
    const errorData = data as { error?: { message?: string } };
    const errorMessage = errorData.error?.message || `API error (${response.status})`;
    throw new ConvexError(errorMessage);
  }

  // Verify success response has expected structure
  const successData = data as { data?: unknown };
  if (!successData.data) {
    throw new ConvexError("Unexpected response format from OpenRouter");
  }

  return { valid: true, message: "API key verified successfully" };
}