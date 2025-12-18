"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Id, Doc } from "@repo/backend/convex/_generated/dataModel";
import { useState, useEffect, useCallback } from "react";

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

// State for action-based queries
export type ActionState<T> =
  | { status: "idle"; data: undefined; error: undefined }
  | { status: "loading"; data: undefined; error: undefined }
  | { status: "ready"; data: T; error: undefined }
  | { status: "error"; data: undefined; error: Error };

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

// ============================================
// Model Configuration Hooks
// ============================================

// Hook to list available models
export function useModels(options?: {
  provider?: string;
  includeDisabled?: boolean;
}): QueryState<Doc<"models">[]> {
  const models = useQuery(api.functions.queries.models.list, options ?? {});
  return createQueryState(models);
}

// Hook to get default model
export function useDefaultModel(): QueryState<Doc<"models"> | null> {
  const model = useQuery(api.functions.queries.models.getDefault, {});
  return createSingleQueryState(model);
}

// Hook to get model by ID
export function useModelById(modelId: string | undefined): QueryState<Doc<"models"> | null> {
  const model = useQuery(
    api.functions.queries.models.getById,
    modelId ? { modelId } : "skip"
  );
  return createSingleQueryState(model);
}

// Hook to get models grouped by provider
export function useModelsByProvider(options?: {
  includeDisabled?: boolean;
}): QueryState<Record<string, Doc<"models">[]>> {
  const grouped = useQuery(api.functions.queries.models.byProvider, options ?? {});
  if (grouped === undefined) {
    return { status: "loading", data: undefined };
  }
  if (Object.keys(grouped).length === 0) {
    return { status: "empty", data: grouped };
  }
  return { status: "ready", data: grouped };
}

// Hook for model management mutations
export function useModelManagement() {
  const seedModels = useMutation(api.functions.mutations.models.seed);
  const setEnabled = useMutation(api.functions.mutations.models.setEnabled);
  const setDefault = useMutation(api.functions.mutations.models.setDefault);
  const updateSortOrder = useMutation(api.functions.mutations.models.updateSortOrder);
  const addCustom = useMutation(api.functions.mutations.models.addCustom);

  return {
    seedModels,
    setEnabled,
    setDefault,
    updateSortOrder,
    addCustom,
  };
}

// ============================================
// Preset Hooks
// ============================================

// Hook to list system presets
export function useSystemPresets(): QueryState<Doc<"presets">[]> {
  const presets = useQuery(api.functions.queries.presets.listSystemPresets, {});
  return createQueryState(presets);
}

// Hook to list user presets
export function useUserPresets(userId: Id<"users"> | undefined): QueryState<Doc<"presets">[]> {
  const presets = useQuery(
    api.functions.queries.presets.listUserPresets,
    userId ? { userId } : "skip"
  );
  return createQueryState(presets);
}

// Hook to list all presets (system + user)
export function useAllPresets(userId: Id<"users"> | undefined): QueryState<Doc<"presets">[]> {
  const presets = useQuery(
    api.functions.queries.presets.listAllPresets,
    userId ? { userId } : "skip"
  );
  return createQueryState(presets);
}

// Hook to get a specific preset
export function usePreset(presetId: Id<"presets"> | undefined): QueryState<Doc<"presets"> | null> {
  const preset = useQuery(
    api.functions.queries.presets.getPreset,
    presetId ? { presetId } : "skip"
  );
  return createSingleQueryState(preset);
}

// Hook for preset management mutations
export function usePresetManagement() {
  const createPreset = useMutation(api.functions.mutations.presets.createUserPreset);
  const updatePreset = useMutation(api.functions.mutations.presets.updateUserPreset);
  const deletePreset = useMutation(api.functions.mutations.presets.deleteUserPreset);
  const seedSystemPresets = useMutation(api.functions.mutations.presets.seedSystemPresets);

  return {
    createPreset,
    updatePreset,
    deletePreset,
    seedSystemPresets,
  };
}

// ============================================
// Public Profile Hooks
// ============================================

// Type for public profile data
export interface PublicProfile {
  _id: Id<"users">;
  clerkId: string;
  email: string;
  name?: string;
  imageUrl?: string;
  createdAt: string;
  stats: {
    totalArtworks: number;
    publicArtworks: number;
    totalLikes: number;
    totalViews: number;
  };
  artworks: Doc<"artworks">[];
}

// Hook to get a user's public profile
export function usePublicProfile(clerkId: string | undefined, limit?: number): QueryState<PublicProfile | null> {
  const profile = useQuery(
    api.functions.queries.users.getPublicProfile,
    clerkId ? { clerkId, limit } : "skip"
  );
  return createSingleQueryState(profile as PublicProfile | null | undefined);
}

// Hook to get user by clerk ID (simpler version without stats/artworks)
export function useUserByClerkId(clerkId: string | undefined): QueryState<Doc<"users"> | null> {
  const user = useQuery(
    api.functions.queries.users.getByClerkId,
    clerkId ? { clerkId } : "skip"
  );
  return createSingleQueryState(user);
}
