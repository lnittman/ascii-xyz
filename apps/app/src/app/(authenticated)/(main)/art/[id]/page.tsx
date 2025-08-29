'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Eye, Share, Download, ArrowLeft, Play, Pause, Trash } from '@phosphor-icons/react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@repo/design/components/ui/button';
import { Badge } from '@repo/design/components/ui/badge';
import { cn } from '@repo/design/lib/utils';

// Prevent static generation for this page as it uses Convex
export const dynamic = 'force-dynamic';
import { useArtwork, useDeleteArtwork, useUpdateArtworkVisibility } from '@/hooks/use-ascii';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';

export default function ArtworkPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  
  const artworkId = params?.id as Id<"artworks">;
  const artwork = useArtwork(artworkId!, user?.id);
  const deleteArtwork = useDeleteArtwork();
  const updateVisibility = useUpdateArtworkVisibility();

  if (!artwork) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Artwork not found</h2>
          <p className="text-muted-foreground mb-4">
            This artwork may have been deleted or you don't have permission to view it.
          </p>
          <Link href="/">
            <Button>Back to Gallery</Button>
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

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted/50">
                <ArrowLeft className="h-4 w-4" weight="bold" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-medium line-clamp-1">{artwork.prompt}</h1>
              <p className="text-sm text-muted-foreground/80 mt-0.5">
                Created {format(new Date(artwork.createdAt), 'MMM d, yyyy · h:mm a')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground/80 mr-3">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" weight="duotone" />
                <span>{artwork.views || 0}</span>
              </div>
              {artwork.visibility === 'public' && (
                <div className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4" weight="duotone" />
                  <span>{artwork.likes || 0}</span>
                </div>
              )}
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleDownload} className="rounded-xl hover:bg-muted/50">
              <Download className="h-4 w-4" weight="bold" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => {}} className="rounded-xl hover:bg-muted/50">
              <Share className="h-4 w-4" weight="bold" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleVisibilityToggle}
              className="rounded-xl border-border/50 hover:bg-muted/50"
            >
              <Badge variant={artwork.visibility === 'public' ? 'default' : 'secondary'} className="rounded-lg">
                {artwork.visibility}
              </Badge>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDelete}
              className="rounded-xl text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            >
              <Trash className="h-4 w-4" weight="bold" />
            </Button>
          </div>
        </div>
        </div>
      </div>

      {/* ASCII Display */}
      <div className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          {/* Animation Controls */}
          {artwork.frames.length > 1 && (
            <div className="mb-4 flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" weight="fill" /> : <Play className="h-4 w-4" weight="fill" />}
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Frame {currentFrame + 1} of {artwork.frames.length}</span>
                <span>•</span>
                <span>{artwork.metadata.fps} FPS</span>
              </div>
            </div>
          )}
          
          {/* ASCII Art Display */}
          <div className="bg-black rounded-xl p-8 overflow-auto shadow-2xl">
            <pre className="text-green-400 font-mono text-sm leading-tight whitespace-pre">
              {artwork.frames[currentFrame] || 'No content available'}
            </pre>
          </div>
          
          {/* Metadata */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl">
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
        </div>
      </div>
    </div>
  );
}