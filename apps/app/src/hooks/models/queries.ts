"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import type { Doc } from "@repo/backend/convex/_generated/dataModel";
import { createQueryState, createSingleQueryState, type QueryState } from "../shared/types";

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
