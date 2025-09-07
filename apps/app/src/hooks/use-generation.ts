import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Id } from "@repo/backend/convex/_generated/dataModel";

export function useGeneration(generationId: Id<"artworkGenerations"> | null) {
  return useQuery(
    api.functions.queries.generations.getGeneration,
    generationId ? { generationId } : "skip"
  );
}

export function useUserGenerations(userId: string | undefined, limit?: number) {
  return useQuery(
    api.functions.queries.generations.getUserGenerations,
    userId ? { userId, limit } : "skip"
  );
}

export function useActiveGenerations() {
  return useQuery(api.functions.queries.generations.getActiveGenerations);
}