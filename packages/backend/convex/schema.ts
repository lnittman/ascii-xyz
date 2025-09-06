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

  // ASCII artworks
  artworks: defineTable({
    userId: v.string(), // Clerk user ID, not a reference to users table
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
    preferredModel: v.optional(v.string()),
    preferredProvider: v.optional(v.string()),
    apiKeys: v.optional(v.array(v.object({
      name: v.string(),
      key: v.string(),
      provider: v.string(),
      createdAt: v.string(),
    }))),
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