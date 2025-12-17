"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Doc, Id } from "@repo/backend/convex/_generated/dataModel";
import { QueryState } from "./use-ascii";

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

// Hook to create shareable link
export function useCreateShare() {
  return useMutation(api.functions.queries.shares.create);
}

// Hook to get artwork by share code
export function useSharedArtwork(shareCode: string): QueryState<Doc<"artworks"> | null> {
  const result = useQuery(
    api.functions.queries.shares.getByCode,
    shareCode ? { shareCode } : "skip"
  );
  return createSingleQueryState(result);
}

// Hook to list user's shares
export function useShares(): QueryState<Doc<"shares">[]> {
  const shares = useQuery(api.functions.queries.shares.list);
  return createQueryState(shares);
}

// Hook to revoke share
export function useRevokeShare() {
  return useMutation(api.functions.queries.shares.revoke);
}

// Example usage:
/*
function ShareManager({ artworkId }: { artworkId: Id<"artworks"> }) {
  const createShare = useCreateShare();
  const sharesState = useShares();
  const revokeShare = useRevokeShare();

  const handleCreateShare = async () => {
    const { shareCode } = await createShare({
      artworkId,
      expiresIn: 24, // 24 hours
      maxViews: 100,
    });

    const shareUrl = `${window.location.origin}/share/${shareCode}`;
    await navigator.clipboard.writeText(shareUrl);
    alert("Share link copied to clipboard!");
  };

  const handleRevoke = async (shareId: Id<"shares">) => {
    await revokeShare({ shareId });
  };

  if (sharesState.status === 'loading') {
    return <div>Loading shares...</div>;
  }

  if (sharesState.status === 'empty') {
    return (
      <div>
        <p>No shares yet</p>
        <button onClick={handleCreateShare}>Create Share Link</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleCreateShare}>
        Create Share Link
      </button>

      <div>
        {sharesState.data.map(share => (
          <div key={share._id}>
            <span>{share.shareCode}</span>
            <span>{share.viewCount} views</span>
            <button onClick={() => handleRevoke(share._id)}>
              Revoke
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
*/
