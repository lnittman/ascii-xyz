"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import type { Id, Doc } from "@repo/backend/convex/_generated/dataModel";
import type { ActionState } from "../shared/types";

// Similar artwork result type
export type SimilarArtwork = {
  artwork: Doc<"artworks">;
  score: number;
};

// Hook to find similar artworks (uses action + query pattern)
export function useSimilarArtworks(
  artworkId: Id<"artworks"> | undefined,
  userId?: string,
  limit: number = 6
): ActionState<SimilarArtwork[]> & { refetch: () => void } {
  const [similarIds, setSimilarIds] = useState<Array<{ _id: Id<"artworks">; _score: number }>>([]);
  const [actionState, setActionState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [actionError, setActionError] = useState<Error | undefined>();

  const findSimilar = useAction(api.embeddings.findSimilar);

  // Fetch artwork data for the similar IDs
  const artworkIds = similarIds.map(s => s._id);
  const artworks = useQuery(
    api.functions.queries.ascii.getMany,
    artworkIds.length > 0 ? { ids: artworkIds, userId } : "skip"
  );

  const fetchSimilar = useCallback(async () => {
    if (!artworkId) return;

    setActionState("loading");
    setActionError(undefined);

    try {
      const results = await findSimilar({ artworkId, limit });
      setSimilarIds(results);
      setActionState("ready");
    } catch (err) {
      setActionError(err instanceof Error ? err : new Error(String(err)));
      setActionState("error");
    }
  }, [artworkId, limit, findSimilar]);

  useEffect(() => {
    if (artworkId) {
      fetchSimilar();
    }
  }, [artworkId, fetchSimilar]);

  // Combine action state with query state
  if (actionState === "idle") {
    return { status: "idle", data: undefined, error: undefined, refetch: fetchSimilar };
  }

  if (actionState === "loading") {
    return { status: "loading", data: undefined, error: undefined, refetch: fetchSimilar };
  }

  if (actionState === "error") {
    return { status: "error", data: undefined, error: actionError!, refetch: fetchSimilar };
  }

  // Action is ready, check if query data is loaded
  if (artworks === undefined) {
    return { status: "loading", data: undefined, error: undefined, refetch: fetchSimilar };
  }

  // Build combined result with scores
  const scoreMap = new Map(similarIds.map(s => [s._id, s._score]));
  const result: SimilarArtwork[] = artworks
    .map(artwork => ({
      artwork,
      score: scoreMap.get(artwork._id) ?? 0
    }))
    .sort((a, b) => b.score - a.score);

  return { status: "ready", data: result, error: undefined, refetch: fetchSimilar };
}

// Hook to search artworks by semantic text query
export function useSemanticSearch(
  query: string | undefined,
  limit: number = 10
): ActionState<Array<{ _id: Id<"artworks">; _score: number }>> & { search: (q: string) => void } {
  const [state, setState] = useState<ActionState<Array<{ _id: Id<"artworks">; _score: number }>>>({
    status: "idle",
    data: undefined,
    error: undefined,
  });

  const searchByText = useAction(api.embeddings.searchByText);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setState({ status: "loading", data: undefined, error: undefined });

    try {
      const results = await searchByText({ query: searchQuery, limit });
      setState({ status: "ready", data: results, error: undefined });
    } catch (err) {
      setState({
        status: "error",
        data: undefined,
        error: err instanceof Error ? err : new Error(String(err))
      });
    }
  }, [limit, searchByText]);

  // Auto-search when query changes
  useEffect(() => {
    if (query?.trim()) {
      search(query);
    }
  }, [query, search]);

  return { ...state, search };
}
