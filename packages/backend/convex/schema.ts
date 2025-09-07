import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (synced from Clerk)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Live artwork generations - track progress frame by frame
  artworkGenerations: defineTable({
    userId: v.optional(v.string()), // Clerk user ID
    prompt: v.string(),
    status: v.union(
      v.literal("planning"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    plan: v.optional(v.object({
      interpretation: v.string(),
      style: v.string(),
      movement: v.any(),
      frameCount: v.number(),
      width: v.number(),
      height: v.number(),
      fps: v.number(),
      characters: v.array(v.string()),
      colorHints: v.optional(v.any()),
      metadata: v.optional(v.any()),
    })),
    frames: v.array(v.string()), // Frames generated so far
    currentFrame: v.number(), // Current frame index being generated
    totalFrames: v.number(), // Total expected frames
    thinkingTraces: v.optional(v.array(v.object({
      trace: v.string(),
      type: v.union(v.literal("system"), v.literal("planning"), v.literal("frame")),
      metadata: v.optional(v.any()),
      timestamp: v.number(),
    }))), // Agent thinking traces for UI display
    error: v.optional(v.string()),
    modelId: v.string(),
    apiKey: v.optional(v.string()), // For tracking (not exposed)
    createdAt: v.string(),
    completedAt: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // ASCII artworks
  artworks: defineTable({
    userId: v.string(), // Clerk user ID, not a reference to users table
    generationId: v.optional(v.id("artworkGenerations")), // Link to generation
    prompt: v.string(),
    frames: v.array(v.string()), // Array of ASCII frames for animation
    metadata: v.object({
      width: v.number(),
      height: v.number(),
      fps: v.number(),
      generator: v.string(),
      model: v.string(),
      style: v.optional(v.string()),
      createdAt: v.string(),
      // Remix/combination tracking
      remixedFrom: v.optional(v.id("artworks")),
      remixType: v.optional(v.string()),
      combinedFrom: v.optional(v.array(v.id("artworks"))),
      combinationType: v.optional(v.string()),
      blendRatio: v.optional(v.number()),
    }),
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("unlisted")),
    featured: v.optional(v.boolean()),
    likes: v.optional(v.number()),
    views: v.optional(v.number()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_visibility", ["visibility"])
    .index("by_created", ["createdAt"])
    .index("by_featured", ["featured", "createdAt"])
    .searchIndex("search_prompt", {
      searchField: "prompt",
      filterFields: ["visibility", "userId"],
    }),

  // Artwork embeddings for vector search (semantic similarity)
  artworkEmbeddings: defineTable({
    artworkId: v.id("artworks"),
    embedding: v.array(v.float64()),
    model: v.string(), // e.g., "text-embedding-ada-002"
    createdAt: v.string(),
  })
    .index("by_artwork", ["artworkId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536, // OpenAI embeddings dimension
    }),

  // Collections for organizing artworks
  collections: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    artworkIds: v.array(v.id("artworks")),
    visibility: v.union(v.literal("public"), v.literal("private")),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_visibility", ["visibility"]),

  // Shares for temporary public access
  shares: defineTable({
    artworkId: v.id("artworks"),
    shareCode: v.string(),
    expiresAt: v.optional(v.string()),
    maxViews: v.optional(v.number()),
    viewCount: v.number(),
    createdAt: v.string(),
  })
    .index("by_share_code", ["shareCode"])
    .index("by_artwork", ["artworkId"]),

  // User preferences and settings
  userSettings: defineTable({
    userId: v.id("users"),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    defaultVisibility: v.union(v.literal("public"), v.literal("private")),
    emailNotifications: v.boolean(),
    
    // API Keys (BYOK)
    openrouterApiKey: v.optional(v.string()),
    openaiApiKey: v.optional(v.string()),
    anthropicApiKey: v.optional(v.string()),
    googleApiKey: v.optional(v.string()),
    
    // Model settings
    enabledModels: v.optional(v.any()), // Record<provider, modelIds[]>
    defaultModelId: v.optional(v.string()),
    
    updatedAt: v.string(),
  })
    .index("by_user", ["userId"]),

  // Generation history for debugging and analytics
  generations: defineTable({
    userId: v.optional(v.id("users")),
    prompt: v.string(),
    success: v.boolean(),
    error: v.optional(v.string()),
    duration: v.number(), // milliseconds
    model: v.string(),
    cost: v.optional(v.number()),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

  // Files stored in Convex storage
  files: defineTable({
    storageId: v.id("_storage"),
    userId: v.id("users"),
    artworkId: v.optional(v.id("artworks")),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_artwork", ["artworkId"]),
  
  // Track remixes
  remixes: defineTable({
    sourceArtworkId: v.id("artworks"),
    remixArtworkId: v.id("artworks"),
    userId: v.string(),
    remixType: v.string(),
    prompt: v.string(),
    createdAt: v.string(),
  })
    .index("by_source", ["sourceArtworkId"])
    .index("by_remix", ["remixArtworkId"])
    .index("by_user", ["userId"]),
  
  // Track combinations
  combinations: defineTable({
    sourceArtworkIds: v.array(v.id("artworks")),
    combinedArtworkId: v.id("artworks"),
    userId: v.string(),
    combinationType: v.string(),
    blendRatio: v.optional(v.number()),
    prompt: v.string(),
    createdAt: v.string(),
  })
    .index("by_combined", ["combinedArtworkId"])
    .index("by_user", ["userId"]),
});