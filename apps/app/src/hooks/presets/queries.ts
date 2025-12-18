"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import type { Id, Doc } from "@repo/backend/convex/_generated/dataModel";
import { createQueryState, createSingleQueryState, type QueryState } from "../shared/types";

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
