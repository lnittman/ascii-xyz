"use client";

import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";

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
