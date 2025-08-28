'use client';

import { Heart, Eye, Plus, MagnifyingGlass, GridFour, Globe } from '@phosphor-icons/react';
import { useState } from 'react';
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
  
  const myArtworks = useArtworks();
  const publicArtworks = usePublicGallery(50);
  const searchResults = useSearchArtworks(searchQuery);
  
  const artworks = view === 'search' ? searchResults :
                  view === 'public' ? publicArtworks :
                  myArtworks;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-mono font-bold tracking-tight text-foreground mb-1">ascii gallery</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-48 sm:w-64 h-9 bg-muted/50 border-transparent focus:bg-background focus:border-border"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) setView('search');
                  }}
                />
              </div>
              
              {/* Filter Toggle */}
              <div className="flex items-center bg-muted border border-border rounded-lg">
                <div className="relative p-1">
                  <button
                    onClick={() => setView('my-art')}
                    className={cn(
                      "flex items-center justify-center gap-1.5 px-3 py-1.5 m-px transition-all duration-300 rounded-md text-sm font-medium",
                      view === 'my-art'
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <GridFour className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">my art</span>
                  </button>
                </div>
                <div className="relative pr-1">
                  <button
                    onClick={() => setView('public')}
                    className={cn(
                      "flex items-center justify-center gap-1.5 px-3 py-1.5 m-px transition-all duration-300 rounded-md text-sm font-medium",
                      view === 'public'
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">public</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Grid */}
          {artworks && artworks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {artworks.map((artwork: any) => (
              <Link key={artwork._id} href={`/art/${artwork._id}`}>
                <div className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  {/* ASCII Preview */}
                  <div className="bg-black rounded p-2 mb-3 overflow-hidden">
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
          <div className="text-center py-16">
            <div className="mx-auto w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
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
            <Link href="/generate">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate ASCII Art
              </Button>
            </Link>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}