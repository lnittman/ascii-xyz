'use client';

import { Heart, Eye, Plus, MagnifyingGlass, GridFour, Globe, X } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@repo/design/lib/utils';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { Skeleton } from '@repo/design/components/ui/skeleton';
import { useArtworks, usePublicGallery, useSearchArtworks, type QueryState } from '@/hooks/use-ascii';
import type { Doc } from '@repo/backend/convex/_generated/dataModel';

// Prevent static generation for this page as it uses Convex
export const dynamic = 'force-dynamic';

export default function AsciiGalleryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'my-art' | 'public' | 'search'>('my-art');
  const inputRef = useRef<HTMLInputElement>(null);

  const myArtworksState = useArtworks();
  const publicArtworksState = usePublicGallery(50);
  const searchResultsState = useSearchArtworks(searchQuery);

  const artworksState: QueryState<Doc<"artworks">[]> = view === 'search' ? searchResultsState :
                  view === 'public' ? publicArtworksState :
                  myArtworksState;

  const isLoading = artworksState.status === 'loading';
  const isEmpty = artworksState.status === 'empty';
  const artworks = artworksState.data;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header - Search bar full width with filter toggle */}
          <div className="mb-8 flex items-center gap-3">
            {/* Search - Full width */}
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" weight="bold" />
              <Input
                placeholder="search artworks..."
                ref={inputRef}
                className="pl-9 pr-10 w-full h-10 bg-muted/30 border-border/50 focus:bg-background focus:border-border transition-colors duration-0 rounded-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) setView('search');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    setSearchQuery('');
                    setView('my-art');
                    if (inputRef.current) {
                      inputRef.current.value = '';
                      inputRef.current.blur();
                    }
                  }
                }}
              />
              {/* Clear button / ESC hint */}
              {!!searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setView('my-art');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 cursor-default items-center justify-center rounded-sm text-muted-foreground transition-colors duration-0 hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" weight="bold" />
                </button>
              )}
            </div>
            
            {/* Filter Toggle */}
            <div className="flex overflow-hidden rounded-sm border border-border" role="tablist" aria-label="Gallery view filter">
              <button
                onClick={() => setView('my-art')}
                role="tab"
                aria-selected={view === 'my-art'}
                aria-label="View my artworks"
                className={cn(
                  "flex cursor-default items-center justify-center gap-2 py-2 px-3 text-xs font-medium transition-colors duration-0",
                  view === 'my-art'
                    ? "bg-background text-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <GridFour className="w-3.5 h-3.5" weight={view === 'my-art' ? 'duotone' : 'regular'} aria-hidden="true" />
                <span className="hidden sm:inline">my art</span>
              </button>
              <button
                onClick={() => setView('public')}
                role="tab"
                aria-selected={view === 'public'}
                aria-label="View public gallery"
                className={cn(
                  "flex cursor-default items-center justify-center gap-2 py-2 px-3 text-xs font-medium transition-colors duration-0",
                  view === 'public'
                    ? "bg-background text-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Globe className="w-3.5 h-3.5" weight={view === 'public' ? 'duotone' : 'regular'} aria-hidden="true" />
                <span className="hidden sm:inline">public</span>
              </button>
            </div>
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border border-border/50 rounded-sm p-4 bg-card/50">
                  <Skeleton className="h-32 w-full rounded-sm mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : !isEmpty && artworks && artworks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Artworks gallery">
            {artworks.map((artwork) => (
              <Link key={artwork._id} href={`/art/${artwork._id}`} aria-label={`View artwork: ${artwork.prompt.slice(0, 50)}${artwork.prompt.length > 50 ? '...' : ''}`}>
                <article className="group border border-border/50 rounded-sm p-4 hover:border-border hover:bg-muted/30 transition-colors duration-0 bg-card/50 focus-within:ring-2 focus-within:ring-primary/50">
                  {/* ASCII Preview */}
                  <div className="bg-black rounded-sm p-3 mb-3 overflow-hidden" aria-hidden="true">
                    <pre className="text-green-400 text-xs leading-none font-mono whitespace-pre">
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
                        {artwork.visibility === 'public' && (
                          <div className="flex items-center gap-1" aria-label={`${artwork.likes || 0} likes`}>
                            <Heart className="h-3 w-3" aria-hidden="true" />
                            <span>{artwork.likes || 0}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1" aria-label={`${artwork.views || 0} views`}>
                          <Eye className="h-3 w-3" aria-hidden="true" />
                          <span>{artwork.views || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs",
                        artwork.visibility === 'public'
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {artwork.visibility}
                      </span>
                      {artwork.frames.length > 1 && (
                        <span className="text-xs text-muted-foreground">
                          {artwork.frames.length} frames
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-sm flex items-center justify-center mb-4">
              {view === 'search' ? <MagnifyingGlass className="h-5 w-5 text-muted-foreground" weight="duotone" /> :
               <Heart className="h-5 w-5 text-muted-foreground" weight="duotone" />}
            </div>
            <h3 className="text-sm font-medium mb-1">
              {view === 'search' ? `no results for "${searchQuery}"` :
               view === 'public' ? 'no public artwork yet' :
               'create your first ASCII art'}
            </h3>
            <p className="text-muted-foreground text-xs mb-4">
              {view === 'search' ? 'try a different search term' :
               view === 'public' ? 'check back later for community creations' :
               'generate beautiful ASCII art from text prompts'}
            </p>
            {view !== 'search' && (
              <Link href="/">
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  create
                </Button>
              </Link>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
