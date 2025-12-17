"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Id } from "@repo/backend/convex/_generated/dataModel";

// Re-export QueryState for consistency
import { QueryState } from "./use-ascii";

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

// ==================== LIKES ====================

/**
 * Hook to toggle like on an artwork
 */
export function useToggleLike() {
  return useMutation(api.social.toggleLike);
}

/**
 * Hook to check if current user has liked an artwork
 */
export function useHasLiked(artworkId: Id<"artworks"> | undefined) {
  const result = useQuery(
    api.social.hasLiked,
    artworkId ? { artworkId } : "skip"
  );
  return result ?? false;
}

/**
 * Hook to get likes data for an artwork
 */
export function useLikes(artworkId: Id<"artworks"> | undefined) {
  const result = useQuery(
    api.social.getLikes,
    artworkId ? { artworkId } : "skip"
  );
  return result ?? { count: 0, recentLikers: [] };
}

// ==================== VIEWS ====================

/**
 * Hook to increment view count
 */
export function useIncrementView() {
  return useMutation(api.social.incrementView);
}

// ==================== LEADERBOARDS ====================

interface Artwork {
  _id: Id<"artworks">;
  prompt: string;
  frames: string[];
  likes?: number;
  views?: number;
  createdAt: string;
  visibility: "public" | "private" | "unlisted";
  metadata: {
    width: number;
    height: number;
    fps: number;
    generator: string;
    model: string;
    style?: string;
    createdAt: string;
  };
}

/**
 * Hook to get top artworks by likes
 */
export function useTopByLikes(limit: number = 10): QueryState<Artwork[]> {
  const result = useQuery(api.social.getTopByLikes, { limit });
  return createQueryState(result);
}

/**
 * Hook to get trending artworks
 */
export function useTrending(limit: number = 10): QueryState<Artwork[]> {
  const result = useQuery(api.social.getTrending, { limit });
  return createQueryState(result);
}

// ==================== USER STATS ====================

export interface UserStats {
  userId: string;
  totalArtworks: number;
  publicArtworks: number;
  totalLikes: number;
  totalViews: number;
  collectionsCount: number;
}

/**
 * Hook to get stats for a user (defaults to current user)
 */
export function useUserStats(userId?: string): QueryState<UserStats | null> {
  const result = useQuery(api.social.getUserStats, userId ? { userId } : {});
  if (result === undefined) {
    return { status: "loading", data: undefined };
  }
  if (result === null) {
    return { status: "empty", data: null };
  }
  return { status: "ready", data: result };
}

// ==================== COMBINED LIKE STATE ====================

/**
 * Combined hook for like state with optimistic UI
 */
export function useLikeState(artworkId: Id<"artworks"> | undefined) {
  const hasLiked = useHasLiked(artworkId);
  const { count } = useLikes(artworkId);
  const toggleLike = useToggleLike();

  return {
    hasLiked,
    count,
    toggle: artworkId
      ? async () => {
          await toggleLike({ artworkId });
        }
      : undefined,
  };
}
