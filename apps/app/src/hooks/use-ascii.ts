"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Id } from "@repo/backend/convex/_generated/dataModel";

// Hook to list user's artworks
export function useArtworks(visibility?: "public" | "private") {
  const artworks = useQuery(api.functions.queries.ascii.list, { visibility });
  return artworks || [];
}

// Hook to get a single artwork
export function useArtwork(id: Id<"artworks">, userId?: string) {
  return useQuery(api.functions.queries.ascii.get, { id, userId });
}

// Hook to get public gallery
export function usePublicGallery(limit?: number) {
  const artworks = useQuery(api.functions.queries.ascii.getPublic, { limit });
  return artworks || [];
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
export function useSearchArtworks(query: string, limit?: number) {
  const results = useQuery(
    api.functions.queries.ascii.search,
    query ? { query, limit } : "skip"
  );
  return results || [];
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
