'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Eye, ShareIos, Download, ArrowLeft, Play, Pause } from 'iconoir-react';
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
    <div className="h-full">
      {/* Header */}
      <div className="border-b border-border px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-medium line-clamp-1">{artwork.prompt}</h1>
              <p className="text-sm text-muted-foreground">
                Created {format(new Date(artwork.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{artwork.views || 0}</span>
              </div>
              {artwork.visibility === 'public' && (
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{artwork.likes || 0}</span>
                </div>
              )}
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={() => {}}>
              <ShareIos className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleVisibilityToggle}
            >
              <Badge variant={artwork.visibility === 'public' ? 'default' : 'secondary'}>
                {artwork.visibility}
              </Badge>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* ASCII Display */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Animation Controls */}
          {artwork.frames.length > 1 && (
            <div className="mb-4 flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Frame {currentFrame + 1} of {artwork.frames.length}</span>
                <span>•</span>
                <span>{artwork.metadata.fps} FPS</span>
              </div>
            </div>
          )}
          
          {/* ASCII Art Display */}
          <div className="bg-black rounded-lg p-6 overflow-auto">
            <pre className="text-green-400 font-mono text-sm leading-tight whitespace-pre">
              {artwork.frames[currentFrame] || 'No content available'}
            </pre>
          </div>
          
          {/* Metadata */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-accent/50 rounded-lg">
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