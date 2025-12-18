"use client";

// Re-export everything from feature folders for backwards compatibility
// New code should import directly from feature folders

// Shared types
export { type QueryState, type ActionState } from "./shared/types";

// Artwork hooks
export {
  useArtworks,
  useArtwork,
  usePublicGallery,
  useSearchArtworks,
  useCreateArtwork,
  useUpdateArtworkVisibility,
  useDeleteArtwork,
  useSimilarArtworks,
  useSemanticSearch,
  type SimilarArtwork,
} from "./artwork";

// Model hooks
export {
  useModels,
  useDefaultModel,
  useModelById,
  useModelsByProvider,
  useModelManagement,
} from "./models";

// Preset hooks
export {
  useSystemPresets,
  useUserPresets,
  useAllPresets,
  usePreset,
  usePresetManagement,
} from "./presets";

// User hooks
export {
  usePublicProfile,
  useUserByClerkId,
  type PublicProfile,
} from "./users";
