"use client";

import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";

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
