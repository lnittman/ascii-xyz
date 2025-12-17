'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Folder,
  Lock,
  Globe,
  Pencil,
  Trash,
  Image as ImageIcon,
} from '@phosphor-icons/react';
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
} from '@repo/design/components/ui/dialog';
import { Input } from '@repo/design/components/ui/input';
import { Textarea } from '@repo/design/components/ui/textarea';
import { Label } from '@repo/design/components/ui/label';
import {
  useCollection,
  useUpdateCollection,
  useDeleteCollection,
  useRemoveFromCollection,
} from '@/hooks/use-collections';
import { Id } from '@repo/backend/convex/_generated/dataModel';

export const dynamic = 'force-dynamic';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params?.id as Id<'collections'>;

  const collectionState = useCollection(collectionId);
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();
  const removeFromCollection = useRemoveFromCollection();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVisibility, setEditVisibility] = useState<'private' | 'public'>('private');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoading = collectionState.status === 'loading';
  const isEmpty = collectionState.status === 'empty';
  const collection = collectionState.data;

  const openEditDialog = () => {
    if (collection) {
      setEditName(collection.name);
      setEditDescription(collection.description || '');
      setEditVisibility(collection.visibility);
      setIsEditOpen(true);
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim()) return;

    setIsUpdating(true);
    try {
      await updateCollection({
        id: collectionId,
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        visibility: editVisibility,
      });
      setIsEditOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this collection? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCollection({ id: collectionId });
      router.push('/collections');
    } catch {
      setIsDeleting(false);
    }
  };

  const handleRemoveArtwork = async (artworkId: Id<'artworks'>) => {
    if (!confirm('Remove this artwork from the collection?')) {
      return;
    }

    await removeFromCollection({
      collectionId,
      artworkId,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Skeleton className="h-4 w-96 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found / empty state
  if (isEmpty || !collection) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-muted rounded-md flex items-center justify-center mb-6">
            <Folder className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium mb-2">Collection not found</h2>
          <p className="text-muted-foreground mb-4">
            This collection may have been deleted or you don't have permission to view it.
          </p>
          <Link href="/collections">
            <Button>Back to Collections</Button>
          </Link>
        </div>
      </div>
    );
  }

  const artworks = collection.artworks.filter(Boolean);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Link href="/collections">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 border border-border hover:border-primary/20 rounded-md"
                  >
                    <ArrowLeft size={16} weight="duotone" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-muted-foreground" weight="duotone" />
                  <h1 className="text-2xl font-medium">{collection.name}</h1>
                </div>
                {collection.visibility === 'private' ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openEditDialog}
                  className="h-8 w-8 hover:bg-muted/50 rounded-md"
                >
                  <Pencil size={16} weight="duotone" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
                >
                  <Trash size={16} />
                </Button>
              </div>
            </div>

            {collection.description && (
              <p className="text-muted-foreground mb-4">{collection.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{artworks.length} artworks</span>
              <span>Created {format(new Date(collection.createdAt), 'MMM d, yyyy')}</span>
              <span>Updated {format(new Date(collection.updatedAt), 'MMM d')}</span>
            </div>
          </div>

          {/* Artworks Grid */}
          {artworks.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border/50 rounded-md">
              <div className="mx-auto w-14 h-14 bg-muted rounded-md flex items-center justify-center mb-6">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No artworks yet</h3>
              <p className="text-muted-foreground mb-4">
                Add artworks to this collection from the artwork detail page
              </p>
              <Link href="/">
                <Button variant="outline">Browse Artworks</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artworks.map((artwork) => {
                if (!artwork) return null;
                return (
                  <div key={artwork._id} className="group relative">
                    <Link href={`/art/${artwork._id}`}>
                      <article className="border border-border/50 rounded-md overflow-hidden hover:border-border hover:shadow-lg transition-all duration-200 bg-card/50 backdrop-blur-sm">
                        {/* ASCII Preview */}
                        <div className="aspect-square bg-black p-2 overflow-hidden">
                          <pre className="text-[6px] leading-[1.1] text-green-400 font-mono whitespace-pre overflow-hidden h-full">
                            {artwork.frames[0]?.slice(0, 500) || ''}
                          </pre>
                        </div>

                        {/* Metadata */}
                        <div className="p-3">
                          <p className="text-sm font-medium line-clamp-1">{artwork.prompt}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {artwork.frames.length} frame{artwork.frames.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </article>
                    </Link>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveArtwork(artwork._id)}
                      className="absolute top-2 right-2 h-6 w-6 bg-black/80 hover:bg-destructive text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from collection"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditVisibility('private')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors',
                    editVisibility === 'private'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  )}
                >
                  <Lock className="h-4 w-4" />
                  Private
                </button>
                <button
                  type="button"
                  onClick={() => setEditVisibility('public')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors',
                    editVisibility === 'public'
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
              onClick={handleUpdate}
              disabled={!editName.trim() || isUpdating}
              className="w-full"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
