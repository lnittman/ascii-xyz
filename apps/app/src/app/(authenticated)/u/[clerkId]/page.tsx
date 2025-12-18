'use client';

import { useParams } from 'next/navigation';
import { ArrowLeft, Eye, Heart, GridFour, Calendar } from '@phosphor-icons/react';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@repo/design/components/ui/button';
import { Skeleton } from '@repo/design/components/ui/skeleton';
import { usePublicProfile, type QueryState } from '@/hooks/use-ascii';

// Prevent static generation for this page as it uses Convex
export const dynamic = 'force-dynamic';

export default function UserProfilePage() {
  const params = useParams();
  const clerkId = params?.clerkId as string;

  const profileState = usePublicProfile(clerkId);

  const isLoading = profileState.status === 'loading';
  const isEmpty = profileState.status === 'empty';
  const profile = profileState.data;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Profile header skeleton */}
          <div className="flex items-start gap-4 mb-8">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-sm" />
            ))}
          </div>

          {/* Gallery skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-border/50 rounded-sm p-4 bg-card/50">
                <Skeleton className="h-32 w-full rounded-sm mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (isEmpty || !profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-muted-foreground text-lg">?</span>
          </div>
          <h2 className="text-sm font-medium mb-1">user not found</h2>
          <p className="text-muted-foreground text-xs mb-4">
            this user may not exist or has no public profile
          </p>
          <Link href="/gallery">
            <Button size="sm" variant="outline" className="text-xs">browse gallery</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/gallery">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={14} weight="bold" />
              back to gallery
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="flex items-start gap-4 mb-8">
          {/* Avatar */}
          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted border border-border/50">
            {profile.imageUrl ? (
              <Image
                src={profile.imageUrl}
                alt={profile.name || 'User avatar'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xl font-medium">
                {(profile.name || profile.email || '?')[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-medium truncate">
              {profile.name || 'anonymous artist'}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Calendar size={12} weight="bold" />
              <span>joined {format(new Date(profile.createdAt), 'MMM yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-card/50 border border-border/50 rounded-sm p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <GridFour size={12} weight="bold" />
              <span className="text-xs">artworks</span>
            </div>
            <div className="text-lg font-medium">{profile.stats.publicArtworks}</div>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-sm p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Heart size={12} weight="bold" />
              <span className="text-xs">likes</span>
            </div>
            <div className="text-lg font-medium">{profile.stats.totalLikes}</div>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-sm p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Eye size={12} weight="bold" />
              <span className="text-xs">views</span>
            </div>
            <div className="text-lg font-medium">{profile.stats.totalViews}</div>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-sm p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <GridFour size={12} weight="bold" />
              <span className="text-xs">total</span>
            </div>
            <div className="text-lg font-medium">{profile.stats.totalArtworks}</div>
          </div>
        </div>

        {/* Public Artworks */}
        <div className="mb-4">
          <h2 className="text-sm font-medium">public artworks</h2>
        </div>

        {profile.artworks.length === 0 ? (
          <div className="text-center py-12 border border-border/50 rounded-sm bg-card/30">
            <div className="mx-auto w-10 h-10 bg-muted rounded-sm flex items-center justify-center mb-3">
              <GridFour size={16} className="text-muted-foreground" weight="duotone" />
            </div>
            <p className="text-sm text-muted-foreground">no public artworks yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="User artworks">
            {profile.artworks.map((artwork) => (
              <Link key={artwork._id} href={`/art/${artwork._id}`} aria-label={`View artwork: ${artwork.prompt.slice(0, 50)}${artwork.prompt.length > 50 ? '...' : ''}`}>
                <article className="group border border-border/50 rounded-sm p-4 hover:border-border hover:bg-muted/30 transition-colors duration-0 bg-card/50 focus-within:ring-2 focus-within:ring-primary/50">
                  {/* ASCII Preview */}
                  <div className="bg-ascii-display rounded-sm p-3 mb-3 overflow-hidden" aria-hidden="true">
                    <pre className="text-ascii text-xs leading-none font-mono whitespace-pre">
                      {artwork.frames[0]?.slice(0, 200) || 'No preview available'}
                    </pre>
                  </div>

                  {/* Artwork Info */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium line-clamp-2">
                      {artwork.prompt}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <time dateTime={artwork.createdAt}>{format(new Date(artwork.createdAt), 'MMM d, yyyy')}</time>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1" aria-label={`${artwork.likes || 0} likes`}>
                          <Heart className="h-3 w-3" aria-hidden="true" />
                          <span>{artwork.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1" aria-label={`${artwork.views || 0} views`}>
                          <Eye className="h-3 w-3" aria-hidden="true" />
                          <span>{artwork.views || 0}</span>
                        </div>
                      </div>
                    </div>
                    {artwork.frames.length > 1 && (
                      <span className="text-xs text-muted-foreground">
                        {artwork.frames.length} frames
                      </span>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
