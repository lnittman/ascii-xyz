"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Id, Doc } from "@repo/backend/convex/_generated/dataModel";

// Discriminated union for query states
export type QueryState<T> =
  | { status: "loading"; data: undefined }
  | { status: "ready"; data: T }
  | { status: "empty"; data: T }; // For arrays when length === 0

// Helper to create query state from Convex useQuery result
function createQueryState<T>(result: T | undefined): QueryState<T> {
  if (result === undefined) {
    return { status: "loading", data: undefined };
  }
  if (Array.isArray(result) && result.length === 0) {
    return { status: "empty", data: result };
  }
  return { status: "ready", data: result };
}

// Helper to create query state for nullable single items
function createSingleQueryState<T>(result: T | null | undefined): QueryState<T | null> {
  if (result === undefined) {
    return { status: "loading", data: undefined };
  }
  if (result === null) {
    return { status: "empty", data: null };
  }
  return { status: "ready", data: result };
}

// Hook to list user's artworks
export function useArtworks(visibility?: "public" | "private"): QueryState<Doc<"artworks">[]> {
  const artworks = useQuery(api.functions.queries.ascii.list, { visibility });
  return createQueryState(artworks);
}

// Hook to get a single artwork
export function useArtwork(id: Id<"artworks">, userId?: string): QueryState<Doc<"artworks"> | null> {
  const artwork = useQuery(api.functions.queries.ascii.get, { id, userId });
  return createSingleQueryState(artwork);
}

// Hook to get public gallery
export function usePublicGallery(limit?: number): QueryState<Doc<"artworks">[]> {
  const artworks = useQuery(api.functions.queries.ascii.getPublic, { limit });
  return createQueryState(artworks);
}

// Hook to create artwork
export function useCreateArtwork() {
  return useMutation(api.functions.mutations.ascii.save);
}

// Hook to update artwork visibility
export function useUpdateArtworkVisibility() {
  return useMutation(api.functions.mutations.ascii.updateVisibility);
}

// Hook to delete artwork
export function useDeleteArtwork() {
  return useMutation(api.functions.mutations.ascii.remove);
}

// Hook to search artworks
export function useSearchArtworks(query: string, limit?: number): QueryState<Doc<"artworks">[]> {
  const results = useQuery(
    api.functions.queries.ascii.search,
    query ? { query, limit } : "skip"
  );
  return createQueryState(results);
}

// Example component usage:
/*
function ArtworkGallery() {
  const artworks = useArtworks();
  const createArtwork = useCreateArtwork();
  
  const handleCreate = async () => {
    await createArtwork({
      prompt: "A beautiful sunset",
      frames: ["ASCII frame 1", "ASCII frame 2"],
      metadata: {
        width: 80,
        height: 24,
        fps: 10,
        generator: "ascii-ai",
        model: "gpt-4",
      },
      visibility: "public",
    });
  };
  
  return (
    <div>
      {artworks.map(artwork => (
        <div key={artwork._id}>
          <h3>{artwork.prompt}</h3>
          <pre>{artwork.frames[0]}</pre>
        </div>
      ))}
      <button onClick={handleCreate}>Create Artwork</button>
    </div>
  );
}
*/
