"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { Id } from "@repo/backend/convex/_generated/dataModel";

// Hook to create shareable link
export function useCreateShare() {
  return useMutation(api.shares.create);
}

// Hook to get artwork by share code
export function useSharedArtwork(shareCode: string) {
  return useQuery(
    api.shares.getByCode,
    shareCode ? { shareCode } : "skip"
  );
}

// Hook to list user's shares
export function useShares() {
  const shares = useQuery(api.shares.list);
  return shares || [];
}

// Hook to revoke share
export function useRevokeShare() {
  return useMutation(api.shares.revoke);
}

// Example usage:
/*
function ShareManager({ artworkId }: { artworkId: Id<"artworks"> }) {
  const createShare = useCreateShare();
  const shares = useShares();
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
  
  return (
    <div>
      <button onClick={handleCreateShare}>
        Create Share Link
      </button>
      
      <div>
        {shares.map(share => (
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