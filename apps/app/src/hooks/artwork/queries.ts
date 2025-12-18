"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import type { Id, Doc } from "@repo/backend/convex/_generated/dataModel";
import { createQueryState, createSingleQueryState, type QueryState } from "../shared/types";

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

// Hook to search artworks
export function useSearchArtworks(query: string, limit?: number): QueryState<Doc<"artworks">[]> {
  const results = useQuery(
    api.functions.queries.ascii.search,
    query ? { query, limit } : "skip"
  );
  return createQueryState(results);
}
