'use client';

import { useState } from 'react';
import { Plus, Folder, Lock, Globe, ArrowRight } from '@phosphor-icons/react';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@repo/design/lib/utils';
import { Button } from '@repo/design/components/ui/button';
import { Skeleton } from '@repo/design/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design/components/ui/dialog';
import { Input } from '@repo/design/components/ui/input';
import { Textarea } from '@repo/design/components/ui/textarea';
import { Label } from '@repo/design/components/ui/label';
import { useCollections, useCreateCollection } from '@/hooks/use-collections';

export const dynamic = 'force-dynamic';

export default function CollectionsPage() {
  const collectionsState = useCollections();
  const createCollection = useCreateCollection();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newVisibility, setNewVisibility] = useState<'private' | 'public'>('private');
  const [isCreating, setIsCreating] = useState(false);

  const isLoading = collectionsState.status === 'loading';
  const isEmpty = collectionsState.status === 'empty';
  const collections = collectionsState.data;

  const handleCreate = async () => {
    if (!newName.trim()) return;

    setIsCreating(true);
    try {
      await createCollection({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        visibility: newVisibility,
      });
      setNewName('');
      setNewDescription('');
      setNewVisibility('private');
      setIsCreateOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium mb-1">Collections</h1>
              <p className="text-sm text-muted-foreground">
                Organize your ASCII art into curated collections
              </p>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Collection</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="My Favorites"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="A collection of..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewVisibility('private')}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors',
                          newVisibility === 'private'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        )}
                      >
                        <Lock className="h-4 w-4" />
                        Private
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVisibility('public')}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors',
                          newVisibility === 'public'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        )}
                      >
                        <Globe className="h-4 w-4" />
                        Public
                      </button>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={!newName.trim() || isCreating}
                    className="w-full"
                  >
                    {isCreating ? 'Creating...' : 'Create Collection'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Collections Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border border-border/50 rounded-md p-5 bg-card/50">
                  <Skeleton className="h-5 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              ))}
            </div>
          ) : isEmpty || !collections || collections.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto w-14 h-14 bg-muted rounded-md flex items-center justify-center mb-6">
                <Folder className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No collections yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a collection to organize your ASCII art
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Collection
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collections.map((collection) => (
                <Link key={collection._id} href={`/collections/${collection._id}`}>
                  <article className="group border border-border/50 rounded-md p-5 hover:border-border hover:shadow-lg transition-all duration-200 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-muted-foreground" weight="duotone" />
                        <h3 className="font-medium line-clamp-1">{collection.name}</h3>
                      </div>
                      {collection.visibility === 'private' ? (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>

                    {collection.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{collection.artworkIds.length} artworks</span>
                      <span>{format(new Date(collection.createdAt), 'MMM d, yyyy')}</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Updated {format(new Date(collection.updatedAt), 'MMM d')}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
