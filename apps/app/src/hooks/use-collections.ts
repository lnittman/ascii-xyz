"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Id } from "@repo/backend/convex/_generated/dataModel";

// Hook to list user's collections
export function useCollections() {
  const collections = useQuery(api.collections.queries.list);
  return collections || [];
}

// Hook to get a collection with artworks
export function useCollection(id: Id<"collections">) {
  return useQuery(api.collections.queries.get, { id });
}

// Hook to create collection
export function useCreateCollection() {
  return useMutation(api.collections.queries.create);
}

// Hook to add artwork to collection
export function useAddToCollection() {
  return useMutation(api.collections.queries.addArtwork);
}

// Hook to remove artwork from collection
export function useRemoveFromCollection() {
  return useMutation(api.collections.queries.removeArtwork);
}

// Hook to update collection
export function useUpdateCollection() {
  return useMutation(api.collections.queries.update);
}

// Hook to delete collection
export function useDeleteCollection() {
  return useMutation(api.collections.queries.remove);
}

// Example usage:
/*
function CollectionManager() {
  const collections = useCollections();
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
  
  return (
    <div>
      {collections.map(collection => (
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