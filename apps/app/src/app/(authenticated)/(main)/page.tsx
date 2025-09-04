'use client';

import { Heart, Eye, Plus, MagnifyingGlass, GridFour, Globe } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@repo/design/lib/utils';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { useArtworks, usePublicGallery, useSearchArtworks } from '@/hooks/use-ascii';

// Prevent static generation for this page as it uses Convex
export const dynamic = 'force-dynamic';

export default function AsciiGalleryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'my-art' | 'public' | 'search'>('my-art');
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const myArtworks = useArtworks();
  const publicArtworks = usePublicGallery(50);
  const searchResults = useSearchArtworks(searchQuery);
  
  const artworks = view === 'search' ? searchResults :
                  view === 'public' ? publicArtworks :
                  myArtworks;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header - Search bar full width with filter toggle */}
          <div className="mb-10 flex items-center gap-3">
            {/* Search - Full width on desktop, compact on mobile */}
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder="Search artworks..."
                ref={inputRef}
                className="pl-10 pr-14 w-full h-10 bg-muted/30 border-border/50 focus:bg-background focus:border-border transition-all duration-200 rounded-md hidden sm:block"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) setView('search');
                }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    // Clear and blur instantly; prevent any parent handlers
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
              {/* Desktop ESC keycap hint (right-aligned). 0ms in/out visibility */}
              {!!searchQuery && (
                <span
                  className="hidden sm:inline-flex items-center h-6 px-2 rounded-sm border border-border/60 bg-background/80 text-[11px] font-medium text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 select-none pointer-events-none"
                  aria-hidden="true"
                >
                  esc
                </span>
              )}
              {/* Mobile search button */}
              <button
                className="sm:hidden flex items-center gap-2 px-4 py-2 h-10 bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all duration-200 rounded-md text-sm font-medium text-muted-foreground"
                onClick={() => {
                  // Could open a search modal on mobile
                  const input = prompt('Search artworks:');
                  if (input) {
                    setSearchQuery(input);
                    setView('search');
                  }
                }}
              >
                <MagnifyingGlass className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
            
            {/* Filter Toggle */}
            <div className="flex items-center h-10 bg-muted/40 border border-border/60 rounded-md p-1 gap-1">
              <div className="relative h-full">
                <button
                  onClick={() => setView('my-art')}
                  className={cn(
                    "flex items-center justify-center gap-2 h-full px-3 transition-colors duration-150 rounded-md text-sm font-medium",
                    view === 'my-art'
                      ? "bg-background text-foreground"
                      : "text-muted-foreground/80 hover:text-foreground hover:bg-background/40"
                  )}
                >
                  <GridFour className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">my art</span>
                </button>
              </div>
              <div className="relative h-full">
                <button
                  onClick={() => setView('public')}
                  className={cn(
                    "flex items-center justify-center gap-2 h-full px-3 transition-colors duration-150 rounded-md text-sm font-medium",
                    view === 'public'
                      ? "bg-background text-foreground"
                      : "text-muted-foreground/80 hover:text-foreground hover:bg-background/40"
                  )}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">public</span>
                </button>
              </div>
            </div>
          </div>

          {/* Gallery Grid */}
          {artworks && artworks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {artworks.map((artwork: any) => (
              <Link key={artwork._id} href={`/art/${artwork._id}`}>
                <div className="group border border-border/50 rounded-md p-5 hover:border-border hover:shadow-lg transition-all duration-200 bg-card/50 backdrop-blur-sm">
                  {/* ASCII Preview */}
                  <div className="bg-black rounded-md p-3 mb-4 overflow-hidden group-hover:shadow-xl transition-shadow duration-200">
                    <pre className="text-green-400 text-xs leading-none font-mono whitespace-pre">
                      {artwork.frames[0]?.slice(0, 200) || 'No preview available'}
                    </pre>
                  </div>
                  
                  {/* Artwork Info */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium line-clamp-2">
                      {artwork.prompt}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{format(new Date(artwork.createdAt), 'MMM d, yyyy')}</span>
                      <div className="flex items-center gap-2">
                        {artwork.visibility === 'public' && (
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{artwork.likes || 0}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{artwork.views || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs",
                        artwork.visibility === 'public' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
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
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="mx-auto w-14 h-14 bg-muted rounded-md flex items-center justify-center mb-6">
              {view === 'search' ? <MagnifyingGlass className="h-6 w-6 text-muted-foreground" /> :
               <Heart className="h-6 w-6 text-muted-foreground" />}
            </div>
            <h3 className="text-lg font-medium mb-2">
              {view === 'search' ? 'No results found' :
               view === 'public' ? 'No public artwork yet' :
               'Create your first ASCII art'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {view === 'search' ? 'Try a different search term' :
               view === 'public' ? 'Check back later for community creations' :
               'Generate beautiful ASCII art from text prompts'}
            </p>
            <Link href="/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create ASCII Art
              </Button>
            </Link>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
