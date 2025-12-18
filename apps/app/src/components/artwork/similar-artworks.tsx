'use client';

import { Id } from '@repo/backend/convex/_generated/dataModel';
import { useSimilarArtworks, SimilarArtwork } from '@/hooks/use-ascii';
import { Skeleton } from '@repo/design/components/ui/skeleton';
import Link from 'next/link';
import { Sparkle } from '@phosphor-icons/react';

interface SimilarArtworksProps {
  artworkId: Id<'artworks'>;
  userId?: string;
  limit?: number;
}

function ArtworkCard({ item }: { item: SimilarArtwork }) {
  const { artwork, score } = item;
  const firstFrame = artwork.frames[0] || '';
  // Truncate frame for preview
  const previewLines = firstFrame.split('\n').slice(0, 8);
  const preview = previewLines.join('\n');

  return (
    <Link
      href={`/art/${artwork._id}`}
      className="group block bg-card/50 border border-border/50 rounded-md overflow-hidden hover:border-primary/30 transition-colors"
    >
      {/* ASCII Preview */}
      <div className="bg-ascii-display p-3 overflow-hidden">
        <pre className="text-ascii/80 font-mono text-[8px] leading-tight whitespace-pre overflow-hidden h-16 group-hover:text-ascii transition-colors">
          {preview}
        </pre>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <p className="text-xs text-foreground truncate">
          {artwork.prompt}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {Math.round(score * 100)}% similar
        </p>
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card/50 border border-border/50 rounded-md overflow-hidden">
          <Skeleton className="h-16 w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SimilarArtworks({ artworkId, userId, limit = 6 }: SimilarArtworksProps) {
  const similarState = useSimilarArtworks(artworkId, userId, limit);

  // Don't render section if idle or loading (to prevent layout shift)
  if (similarState.status === 'idle') {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-border/30">
      <div className="flex items-center gap-2 mb-4">
        <Sparkle className="h-4 w-4 text-primary" weight="duotone" />
        <h2 className="text-sm font-medium text-foreground">More like this</h2>
      </div>

      {similarState.status === 'loading' && <LoadingSkeleton />}

      {similarState.status === 'error' && (
        <p className="text-xs text-muted-foreground">
          Unable to load similar artworks.
        </p>
      )}

      {similarState.status === 'ready' && similarState.data.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No similar artworks found yet. Generate embeddings to enable discovery.
        </p>
      )}

      {similarState.status === 'ready' && similarState.data.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {similarState.data.map((item) => (
            <ArtworkCard key={item.artwork._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
