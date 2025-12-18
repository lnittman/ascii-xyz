// Artwork hooks - queries, mutations, and actions
export {
  useArtworks,
  useArtwork,
  usePublicGallery,
  useSearchArtworks,
} from "./queries";

export {
  useCreateArtwork,
  useUpdateArtworkVisibility,
  useDeleteArtwork,
} from "./mutations";

export {
  useSimilarArtworks,
  useSemanticSearch,
  type SimilarArtwork,
} from "./actions";
