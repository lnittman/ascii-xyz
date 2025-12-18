"use client";

import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";

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
