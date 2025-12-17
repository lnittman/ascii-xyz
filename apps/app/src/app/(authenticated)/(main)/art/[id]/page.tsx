'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Eye, Share, Download, ArrowLeft, Play, Pause, Trash, SkipBack } from '@phosphor-icons/react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@repo/design/components/ui/button';
import { Badge } from '@repo/design/components/ui/badge';
import { Skeleton } from '@repo/design/components/ui/skeleton';

// Prevent static generation for this page as it uses Convex
export const dynamic = 'force-dynamic';
import { useArtwork, useDeleteArtwork, useUpdateArtworkVisibility } from '@/hooks/use-ascii';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { SimilarArtworks } from '@/components/artwork/similar-artworks';
import { AddToCollection } from '@/components/artwork/add-to-collection';
import { PresenceDot } from '@/components/presence/presence-indicator';
import { LikeButton } from '@/components/social/like-button';
import { useIncrementView } from '@/hooks/use-social';

export default function ArtworkPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const artworkId = params?.id as Id<"artworks">;
  const artworkState = useArtwork(artworkId!, user?.id);
  const deleteArtwork = useDeleteArtwork();
  const updateVisibility = useUpdateArtworkVisibility();
  const incrementView = useIncrementView();
  const hasTrackedView = useRef(false);

  const isLoading = artworkState.status === 'loading';
  const isEmpty = artworkState.status === 'empty';
  const artwork = artworkState.data;

  // Track view when artwork loads (once per page visit)
  useEffect(() => {
    if (artwork && artworkId && !hasTrackedView.current) {
      hasTrackedView.current = true;
      incrementView({ artworkId }).catch(console.error);
    }
  }, [artwork, artworkId, incrementView]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-sm" />
            <Skeleton className="h-6 w-64 rounded-sm" />
          </div>
          <Skeleton className="h-4 w-48 rounded-sm" />
        </div>
        <div className="px-6 py-10">
          <div className="max-w-5xl mx-auto">
            <Skeleton className="h-96 w-full rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  // Not found / empty state
  if (isEmpty || !artwork) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-10 h-10 bg-muted rounded-sm flex items-center justify-center mb-4">
            <span className="text-muted-foreground text-lg">?</span>
          </div>
          <h2 className="text-sm font-medium mb-1">artwork not found</h2>
          <p className="text-muted-foreground text-xs mb-4">
            this artwork may have been deleted or you don't have permission to view it
          </p>
          <Link href="/gallery">
            <Button size="sm" variant="outline" className="text-xs">back to gallery</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!user?.id) {
      alert('You must be signed in to delete artwork');
      return;
    }
    if (confirm('Are you sure you want to delete this artwork?')) {
      await deleteArtwork({ id: artworkId!, userId: user.id });
      router.push('/');
    }
  };

  const handleVisibilityToggle = async () => {
    const newVisibility = artwork.visibility === 'public' ? 'private' : 'public';
    await updateVisibility({ 
      id: artworkId!, 
      visibility: newVisibility 
    });
  };

  const handleDownload = () => {
    const content = JSON.stringify({
      prompt: artwork.prompt,
      frames: artwork.frames,
      metadata: artwork.metadata
    }, null, 2);
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ascii-art-${artwork._id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle animation playback
  useEffect(() => {
    if (!artwork || artwork.frames.length <= 1) return;
    
    if (isPlaying) {
      const fps = artwork.metadata.fps || 12;
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          const next = prev + 1;
          return next >= artwork.frames.length ? 0 : next;
        });
      }, 1000 / fps);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, artwork]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-3">
        {/* Top row with back button, title, and action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {/* Back button */}
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 border border-border/50 hover:border-border hover:bg-muted/50 rounded-sm transition-colors duration-0 cursor-default"
              >
                <ArrowLeft size={14} weight="bold" />
              </Button>
            </Link>

            {/* Title */}
            <h1 className="text-sm font-medium truncate">
              {artwork.prompt}
            </h1>
          </div>

          {/* Right-aligned action buttons */}
          <div className="flex items-center gap-1.5">
            <AddToCollection artworkId={artworkId} />

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="h-7 w-7 hover:bg-muted/50 rounded-sm transition-colors duration-0 cursor-default"
            >
              <Download size={14} weight="bold" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {}}
              className="h-7 w-7 hover:bg-muted/50 rounded-sm transition-colors duration-0 cursor-default"
            >
              <Share size={14} weight="bold" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 border border-border/50 hover:border-destructive/30 rounded-sm transition-colors duration-0 cursor-default"
            >
              <Trash size={14} />
            </Button>
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>{format(new Date(artwork.createdAt), 'MMM d, yyyy · h:mm a')}</span>
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" weight="bold" />
              <span>{artwork.views || 0}</span>
            </div>
            {artwork.visibility === 'public' && (
              <LikeButton artworkId={artworkId} size="sm" />
            )}
            <PresenceDot roomId={artworkId} />
          </div>

          <button
            onClick={handleVisibilityToggle}
            className="px-2 py-1 text-xs rounded-sm border border-border/50 hover:border-border hover:bg-muted/50 transition-colors duration-0 cursor-default"
          >
            {artwork.visibility}
          </button>
        </div>
      </div>

      {/* ASCII Display */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Animation Controls */}
          {artwork.frames.length > 1 && (
            <div className="mb-3 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePlayPause}
                  className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-muted/50 transition-colors duration-0 cursor-default"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" weight="fill" /> : <Play className="h-3.5 w-3.5" weight="fill" />}
                </button>
                <button
                  onClick={handleReset}
                  className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-muted/50 transition-colors duration-0 cursor-default"
                >
                  <SkipBack className="h-3.5 w-3.5" weight="fill" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <span>frame {currentFrame + 1}/{artwork.frames.length}</span>
                <span>·</span>
                <span>{artwork.metadata.fps || 12} fps</span>
              </div>
            </div>
          )}

          {/* ASCII Art Display */}
          <div className="bg-black rounded-sm p-6 overflow-auto border border-border/30">
            <pre className="text-green-400 font-mono text-sm leading-tight whitespace-pre">
              {artwork.frames[currentFrame] || 'No content available'}
            </pre>
          </div>

          {/* Metadata */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-card/50 border border-border/50 rounded-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">dimensions</div>
              <div className="text-xs font-mono">{artwork.metadata.width}×{artwork.metadata.height}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">model</div>
              <div className="text-xs font-mono">{artwork.metadata.model}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">generator</div>
              <div className="text-xs font-mono">{artwork.metadata.generator}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">style</div>
              <div className="text-xs font-mono">{artwork.metadata.style || 'default'}</div>
            </div>
          </div>

          {/* Similar Artworks */}
          <SimilarArtworks artworkId={artworkId} userId={user?.id} />
        </div>
      </div>
    </div>
  );
}
