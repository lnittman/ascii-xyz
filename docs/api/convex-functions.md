# Convex functions inventory

Grouping by file path. Function signatures are derived from source as of 2025‑09‑05.

> Import pattern in the app: `import { api } from '@repo/backend/convex/_generated/api'` then `useQuery(api.functions.queries....)` or `useMutation(api.functions.mutations....)`. Some files in `queries/` export mutations for convenience; the generated path still places them under `api.functions.queries.<file>.<fn>`.

## actions/ascii.ts

```ts
generate(args: {
  prompt: string;
  apiKey?: string;
  userId?: string;
  modelId?: string;
}): Promise<{ frames: string[]; metadata: {
  prompt: string;
  interpretation: string; style: string; movement: string;
  frameCount: number; width: number; height: number; fps: number;
  characters: string[]; colorHints?: string; metadata?: Record<string, unknown>;
  generatedAt: string; model: string; userId?: string;
}}>

generateVariation(args: {
  originalFrames: string[];
  variationPrompt: string;
  apiKey?: string; userId?: string; modelId?: string;
}): Promise<{ frames: string[]; metadata: { prompt: string; originalFrameCount: number; generatedAt: string; model: string; userId?: string } }>

enhance(args: {
  frames: string[];
  enhancementType: 'double-resolution' | 'add-detail' | 'smooth-animation' | 'stylize';
  apiKey?: string;
}): Promise<{ frames: string[]; enhancementType: string }>
```

## mutations/ascii.ts

```ts
save({
  userId: string;
  prompt: string;
  frames: string[];
  metadata: { width: number; height: number; frameCount: number; fps: number;
    interpretation: string; style: string; movement: string; characters: string[];
    colorHints?: string; metadata?: { mood: string; complexity: string; dynamism: string };
    generatedAt: string; model: string;
  };
  visibility?: 'public' | 'private' | 'unlisted';
}): Promise<Id<'artworks'>>

updateVisibility({ id: Id<'artworks'>; visibility: 'public'|'private'|'unlisted' }): { success: true }

remove({ id: Id<'artworks'>; userId: string }): { success: true }

incrementViews({ id: Id<'artworks'> }): void

toggleLike({ id: Id<'artworks'>; userId: string; liked: boolean }): void
```

## queries/ascii.ts

```ts
list({ userId?: string; visibility?: 'public'|'private'|'unlisted'; limit?: number }): Doc<'artworks'>[]
get({ id: Id<'artworks'>; userId?: string }): Doc<'artworks'> | null
getPublic({ limit?: number; cursor?: string }): Doc<'artworks'>[]
search({ query: string; userId?: string; limit?: number }): Doc<'artworks'>[]
getTrending({ limit?: number; timeframe?: 'day'|'week'|'month' }): Doc<'artworks'>[]
```

## queries/collections.ts

```ts
// queries
list(): Doc<'collections'>[]
get({ id: Id<'collections'> }): (Doc<'collections'> & { artworks: (Doc<'artworks'> | null)[] }) | null

// mutations co-located under queries
create({ name: string; description?: string; visibility?: 'public'|'private' }): Id<'collections'>
addArtwork({ collectionId: Id<'collections'>; artworkId: Id<'artworks'> }): void
removeArtwork({ collectionId: Id<'collections'>; artworkId: Id<'artworks'> }): void
update({ id: Id<'collections'>; name?: string; description?: string; visibility?: 'public'|'private' }): void
remove({ id: Id<'collections'> }): void
```

## queries/files.ts

```ts
getUrl({ storageId: Id<'_storage'> }): string | null
getFile({ fileId: Id<'files'> }): (Doc<'files'> & { url: string | null }) | null
listUserFiles({ artworkId?: Id<'artworks'> }): (Doc<'files'> & { url: string | null })[]
```

## queries/shares.ts

```ts
// mutation
create({ artworkId: Id<'artworks'>; expiresIn?: number; maxViews?: number }): { shareId: Id<'shares'>; shareCode: string }

// queries
getByCode({ shareCode: string }): Doc<'artworks'> | null
list(): Array<Doc<'shares'> & { artworkPrompt: string }>

// mutation
revoke({ shareId: Id<'shares'> }): void
```

## queries/users.ts

```ts
current(): Doc<'users'> | null
get({ userId: Id<'users'> }): Doc<'users'> | null
// helpers for server-side use inside other functions
getCurrentUser(ctx), getCurrentUserOrThrow(ctx)
```

## mutations/files.ts

```ts
generateUploadUrl(): string
createFileRecord({ storageId: Id<'_storage'>; filename: string; mimeType: string; size: number; artworkId?: Id<'artworks'> }): Id<'files'>
deleteFile({ fileId: Id<'files'> }): void
```

## mutations/settings.ts

```ts
update({ theme?: 'light'|'dark'|'system'; defaultVisibility?: 'public'|'private'; emailNotifications?: boolean; preferredModel?: string; preferredProvider?: string }): void
addApiKey({ name: string; key: string; provider: string }): void
removeApiKey({ name: string }): void
```

## internal/users.ts

```ts
upsertFromClerk({ data: UserJSON }): Id<'users'>
deleteFromClerk({ clerkUserId: string }): void
```

Notes and caveats
- Some mutations live in `queries/*` files (e.g., `shares.ts`), so their generated path is under `api.functions.queries.shares.*`.
