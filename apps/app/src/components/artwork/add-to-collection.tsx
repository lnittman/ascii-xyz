'use client';

import { useState } from 'react';
import { FolderPlus, Check, Plus, Folder } from '@phosphor-icons/react';
import { cn } from '@repo/design/lib/utils';
import { Button } from '@repo/design/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@repo/design/components/ui/dialog';
import { Input } from '@repo/design/components/ui/input';
import { Label } from '@repo/design/components/ui/label';
import { Skeleton } from '@repo/design/components/ui/skeleton';
import {
  useCollections,
  useAddToCollection,
  useRemoveFromCollection,
  useCreateCollection,
} from '@/hooks/use-collections';
import { Id } from '@repo/backend/convex/_generated/dataModel';

interface AddToCollectionProps {
  artworkId: Id<'artworks'>;
}

export function AddToCollection({ artworkId }: AddToCollectionProps) {
  const collectionsState = useCollections();
  const addToCollection = useAddToCollection();
  const removeFromCollection = useRemoveFromCollection();
  const createCollection = useCreateCollection();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

  const isLoading = collectionsState.status === 'loading';
  const collections = collectionsState.data || [];

  const isInCollection = (collectionId: Id<'collections'>) => {
    const collection = collections.find((c) => c._id === collectionId);
    return collection?.artworkIds.includes(artworkId) ?? false;
  };

  const handleToggle = async (collectionId: Id<'collections'>) => {
    setPendingActions((prev) => new Set(prev).add(collectionId));

    try {
      if (isInCollection(collectionId)) {
        await removeFromCollection({ collectionId, artworkId });
      } else {
        await addToCollection({ collectionId, artworkId });
      }
    } finally {
      setPendingActions((prev) => {
        const next = new Set(prev);
        next.delete(collectionId);
        return next;
      });
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;

    setIsCreating(true);
    try {
      const collectionId = await createCollection({
        name: newName.trim(),
        visibility: 'private',
      });
      // Add artwork to new collection
      await addToCollection({ collectionId, artworkId });
      setNewName('');
      setIsCreateOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const collectionsWithArtwork = collections.filter((c) =>
    c.artworkIds.includes(artworkId)
  ).length;

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 hover:bg-muted/50 rounded-md',
              collectionsWithArtwork > 0 && 'text-primary'
            )}
            title={
              collectionsWithArtwork > 0
                ? `In ${collectionsWithArtwork} collection${collectionsWithArtwork !== 1 ? 's' : ''}`
                : 'Add to collection'
            }
          >
            <FolderPlus size={16} weight={collectionsWithArtwork > 0 ? 'fill' : 'duotone'} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="end">
          <div className="p-3 border-b border-border">
            <p className="text-sm font-medium">Add to collection</p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : collections.length === 0 ? (
              <div className="p-4 text-center">
                <Folder className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No collections yet</p>
              </div>
            ) : (
              <div className="p-1">
                {collections.map((collection) => {
                  const inCollection = isInCollection(collection._id);
                  const isPending = pendingActions.has(collection._id);

                  return (
                    <button
                      key={collection._id}
                      onClick={() => handleToggle(collection._id)}
                      disabled={isPending}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                        'hover:bg-muted/50 disabled:opacity-50',
                        inCollection && 'bg-primary/5'
                      )}
                    >
                      <div
                        className={cn(
                          'h-4 w-4 rounded border flex items-center justify-center',
                          inCollection
                            ? 'bg-primary border-primary'
                            : 'border-border'
                        )}
                      >
                        {inCollection && <Check size={12} className="text-primary-foreground" />}
                      </div>
                      <span className="flex-1 text-left truncate">{collection.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {collection.artworkIds.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                setIsOpen(false);
                setIsCreateOpen(true);
              }}
            >
              <Plus size={14} />
              Create new collection
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Create Collection Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="collection-name">Name</Label>
              <Input
                id="collection-name"
                placeholder="My Favorites"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newName.trim()) {
                    handleCreate();
                  }
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The artwork will be added to this collection automatically.
            </p>
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || isCreating}
              className="w-full"
            >
              {isCreating ? 'Creating...' : 'Create & Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
