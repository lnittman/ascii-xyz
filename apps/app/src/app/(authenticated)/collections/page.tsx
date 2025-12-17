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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-sm font-medium mb-0.5">collections</h1>
              <p className="text-xs text-muted-foreground">
                organize your ASCII art into curated collections
              </p>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 text-xs h-7 px-2.5">
                  <Plus className="h-3.5 w-3.5" />
                  new
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-sm">create collection</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs">name</Label>
                    <Input
                      id="name"
                      placeholder="my favorites"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs">description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="a collection of..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">visibility</Label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNewVisibility('private')}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-medium transition-colors duration-0 cursor-default',
                          newVisibility === 'private'
                            ? 'border-foreground bg-foreground/5 text-foreground'
                            : 'border-border/50 text-muted-foreground hover:border-border hover:bg-muted/50'
                        )}
                      >
                        <Lock className="h-3.5 w-3.5" />
                        private
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVisibility('public')}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-medium transition-colors duration-0 cursor-default',
                          newVisibility === 'public'
                            ? 'border-foreground bg-foreground/5 text-foreground'
                            : 'border-border/50 text-muted-foreground hover:border-border hover:bg-muted/50'
                        )}
                      >
                        <Globe className="h-3.5 w-3.5" />
                        public
                      </button>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={!newName.trim() || isCreating}
                    size="sm"
                    className="w-full text-xs"
                  >
                    {isCreating ? 'creating...' : 'create collection'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Collections Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border border-border/50 rounded-sm p-4 bg-card/50">
                  <Skeleton className="h-4 w-1/2 mb-2 rounded-sm" />
                  <Skeleton className="h-3 w-3/4 mb-3 rounded-sm" />
                  <Skeleton className="h-3 w-1/4 rounded-sm" />
                </div>
              ))}
            </div>
          ) : isEmpty || !collections || collections.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-10 h-10 bg-muted rounded-sm flex items-center justify-center mb-4">
                <Folder className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium mb-1">no collections yet</h3>
              <p className="text-muted-foreground text-xs mb-4">
                create a collection to organize your ASCII art
              </p>
              <Button onClick={() => setIsCreateOpen(true)} size="sm" className="text-xs gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                create collection
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {collections.map((collection) => (
                <Link key={collection._id} href={`/collections/${collection._id}`}>
                  <article className="group border border-border/50 rounded-sm p-4 hover:border-border hover:bg-muted/30 transition-colors duration-0 bg-card/50">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Folder className="h-3.5 w-3.5 text-muted-foreground" weight="duotone" />
                        <h3 className="text-xs font-medium line-clamp-1">{collection.name}</h3>
                      </div>
                      {collection.visibility === 'private' ? (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Globe className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>

                    {collection.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{collection.artworkIds.length} artworks</span>
                      <span>{format(new Date(collection.createdAt), 'MMM d, yyyy')}</span>
                    </div>

                    <div className="mt-2.5 pt-2.5 border-t border-border/30 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        updated {format(new Date(collection.updatedAt), 'MMM d')}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors duration-0" />
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
