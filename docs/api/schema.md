# Database schema (Convex)

Defined in `packages/backend/convex/schema.ts`. Summary below; see file for exact validators.

```ts
users: {
  clerkId: string; email: string; name?: string; imageUrl?: string;
  createdAt: string; updatedAt: string;
} // indexes: by_clerk_id, by_email

artworks: {
  userId: string; // Clerk user id
  prompt: string;
  frames: string[]; // JSON array of frames
  metadata: { width: number; height: number; fps: number; generator: string; model: string; style?: string; createdAt: string };
  visibility: 'public'|'private'|'unlisted'; featured?: boolean; likes?: number; views?: number;
  createdAt: string; updatedAt: string;
} // indexes: by_user, by_visibility, by_created, by_featured; searchIndex: search_prompt

artworkEmbeddings: {
  artworkId: Id<'artworks'>;
  embedding: float64[]; model: string; createdAt: string;
} // vectorIndex: by_embedding (1536 dims)

collections: {
  userId: Id<'users'>; name: string; description?: string;
  artworkIds: Id<'artworks'>[]; visibility: 'public'|'private';
  createdAt: string; updatedAt: string;
} // indexes: by_user, by_visibility

shares: {
  artworkId: Id<'artworks'>; shareCode: string; expiresAt?: string; maxViews?: number; viewCount: number; createdAt: string;
} // indexes: by_share_code, by_artwork

userSettings: {
  userId: Id<'users'>; theme: 'light'|'dark'|'system'; defaultVisibility: 'public'|'private'; emailNotifications: boolean;
  preferredModel?: string; preferredProvider?: string; apiKeys?: { name: string; key: string; provider: string; createdAt: string }[];
  updatedAt: string;
} // index: by_user

generations: {
  userId?: Id<'users'>; prompt: string; success: boolean; error?: string; duration: number; model: string; cost?: number; createdAt: string;
} // indexes: by_user, by_created

files: {
  storageId: Id<'_storage'>; userId: Id<'users'>; artworkId?: Id<'artworks'>;
  filename: string; mimeType: string; size: number; createdAt: string;
} // indexes: by_user, by_artwork
```

Relationships
- `artworks.userId` is a string (Clerk subject), not a foreign key to `users`.
- `collections` aggregates `artworkIds` for ordering and grouping.

Indexing considerations
- Keep frequently filtered fields indexed (`visibility`, `userId`, `createdAt`). Search index on `prompt` enables simple full‑text filtering.
- Vector search over `artworkEmbeddings` enables semantic retrieval when populated.
