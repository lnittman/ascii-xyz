"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import type { Id, Doc } from "@repo/backend/convex/_generated/dataModel";
import { createSingleQueryState, type QueryState } from "../shared/types";

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
