'use client';

import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Heart, Eye, ArrowLeft } from 'iconoir-react';
import Link from 'next/link';
import { Button } from '@repo/design/components/ui/button';
import { Badge } from '@repo/design/components/ui/badge';
import { Skeleton } from '@repo/design/components/ui/skeleton';
import { useSharedArtwork } from '@/hooks/use-shares';

// Prevent static generation for this page as it uses Convex
export const dynamic = 'force-dynamic';

export default function SharedArtworkPage() {
  const params = useParams();
  const shareCode = params?.token as string;

  const artworkState = useSharedArtwork(shareCode);

  // Loading state
  if (artworkState.status === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Empty state (not found)
  if (artworkState.status === 'empty' || !artworkState.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-medium">Artwork Not Found</h1>
          <p className="text-muted-foreground">
            This shared artwork link may have expired or been removed.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const artwork = artworkState.data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">{artwork.prompt}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-muted-foreground">
                    Created {format(new Date(artwork.createdAt), 'MMM d, yyyy')}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{artwork.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{artwork.likes || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Shared Link
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ASCII Display */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-ascii-display rounded-lg p-6 overflow-auto">
          <pre className="text-ascii font-mono text-sm leading-tight whitespace-pre">
            {artwork.frames[0] || 'No content available'}
          </pre>
        </div>

        {/* Animation frames if available */}
        {artwork.frames.length > 1 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            This artwork has {artwork.frames.length} animation frames
          </div>
        )}

        {/* Metadata */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-accent/30 rounded-lg">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Dimensions</div>
            <div className="text-sm">{artwork.metadata.width}×{artwork.metadata.height}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Model</div>
            <div className="text-sm">{artwork.metadata.model}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Generator</div>
            <div className="text-sm">{artwork.metadata.generator}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Style</div>
            <div className="text-sm">{artwork.metadata.style || 'Default'}</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Create your own ASCII art with AI
          </p>
          <Link href="/">
            <Button>
              Try ASCII Generator
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
