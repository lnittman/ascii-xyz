"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Id, Doc } from "@repo/backend/convex/_generated/dataModel";

// Re-export QueryState from use-ascii for consistency
import { QueryState } from "./use-ascii";
export type { QueryState };

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

// Helper to create query state for nullable single items
function createSingleQueryState<T>(result: T | null | undefined): QueryState<T | null> {
  if (result === undefined) {
    return { status: "loading", data: undefined };
  }
  if (result === null) {
    return { status: "empty", data: null };
  }
  return { status: "ready", data: result };
}

// Collection with populated artworks (returned by get query)
// Note: artworks array may contain null for deleted items (filtered by backend but TS doesn't narrow)
export interface CollectionWithArtworks extends Doc<"collections"> {
  artworks: (Doc<"artworks"> | null)[];
}

// Hook to list user's collections
export function useCollections(): QueryState<Doc<"collections">[]> {
  const collections = useQuery(api.functions.queries.collections.list);
  return createQueryState(collections);
}

// Hook to get a collection with artworks
export function useCollection(id: Id<"collections">): QueryState<CollectionWithArtworks | null> {
  const collection = useQuery(api.functions.queries.collections.get, { id });
  return createSingleQueryState(collection);
}

// Hook to create collection
export function useCreateCollection() {
  return useMutation(api.functions.mutations.collections.create);
}

// Hook to add artwork to collection
export function useAddToCollection() {
  return useMutation(api.functions.mutations.collections.addArtwork);
}

// Hook to remove artwork from collection
export function useRemoveFromCollection() {
  return useMutation(api.functions.mutations.collections.removeArtwork);
}

// Hook to update collection
export function useUpdateCollection() {
  return useMutation(api.functions.mutations.collections.update);
}

// Hook to delete collection
export function useDeleteCollection() {
  return useMutation(api.functions.mutations.collections.remove);
}

// Example usage:
/*
function CollectionManager() {
  const collectionsState = useCollections();
  const createCollection = useCreateCollection();
  const addToCollection = useAddToCollection();

  const handleCreateCollection = async () => {
    const collectionId = await createCollection({
      name: "My Favorites",
      description: "Collection of my favorite ASCII art",
      visibility: "private",
    });

    // Add artwork to collection
    await addToCollection({
      collectionId,
      artworkId: "someArtworkId",
    });
  };

  // Handle loading, empty, and ready states explicitly
  if (collectionsState.status === 'loading') {
    return <div>Loading collections...</div>;
  }

  if (collectionsState.status === 'empty') {
    return (
      <div>
        <p>No collections yet</p>
        <button onClick={handleCreateCollection}>Create Collection</button>
      </div>
    );
  }

  return (
    <div>
      {collectionsState.data.map(collection => (
        <div key={collection._id}>
          <h3>{collection.name}</h3>
          <p>{collection.description}</p>
          <span>{collection.artworkIds.length} artworks</span>
        </div>
      ))}
      <button onClick={handleCreateCollection}>
        Create Collection
      </button>
    </div>
  );
}
*/
