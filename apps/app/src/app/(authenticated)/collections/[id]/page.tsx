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
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-7 w-7 rounded-sm" />
              <Skeleton className="h-6 w-64 rounded-sm" />
            </div>
            <Skeleton className="h-4 w-96 mb-6 rounded-sm" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-sm" />
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
          <div className="mx-auto w-10 h-10 bg-muted rounded-sm flex items-center justify-center mb-4">
            <Folder className="h-4 w-4 text-muted-foreground" />
          </div>
          <h2 className="text-sm font-medium mb-1">collection not found</h2>
          <p className="text-muted-foreground text-xs mb-4">
            this collection may have been deleted or you don't have permission to view it
          </p>
          <Link href="/collections">
            <Button size="sm" variant="outline" className="text-xs">back to collections</Button>
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <Link href="/collections">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 border border-border/50 hover:border-border hover:bg-muted/50 rounded-sm transition-colors duration-0 cursor-default"
                  >
                    <ArrowLeft size={14} weight="bold" />
                  </Button>
                </Link>
                <div className="flex items-center gap-1.5">
                  <Folder className="h-4 w-4 text-muted-foreground" weight="duotone" />
                  <h1 className="text-sm font-medium">{collection.name}</h1>
                </div>
                {collection.visibility === 'private' ? (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <Globe className="h-3 w-3 text-muted-foreground" />
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={openEditDialog}
                  className="h-7 w-7 flex items-center justify-center hover:bg-muted/50 rounded-sm transition-colors duration-0 cursor-default"
                >
                  <Pencil size={14} weight="bold" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-7 w-7 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-sm transition-colors duration-0 cursor-default disabled:opacity-50"
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>

            {collection.description && (
              <p className="text-muted-foreground text-xs mb-3">{collection.description}</p>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{artworks.length} artworks</span>
              <span>·</span>
              <span>{format(new Date(collection.createdAt), 'MMM d, yyyy')}</span>
              <span>·</span>
              <span>updated {format(new Date(collection.updatedAt), 'MMM d')}</span>
            </div>
          </div>

          {/* Artworks Grid */}
          {artworks.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border/50 rounded-sm">
              <div className="mx-auto w-10 h-10 bg-muted rounded-sm flex items-center justify-center mb-4">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium mb-1">no artworks yet</h3>
              <p className="text-muted-foreground text-xs mb-4">
                add artworks to this collection from the artwork detail page
              </p>
              <Link href="/">
                <Button variant="outline" size="sm" className="text-xs">browse artworks</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {artworks.map((artwork) => {
                if (!artwork) return null;
                return (
                  <div key={artwork._id} className="group relative">
                    <Link href={`/art/${artwork._id}`}>
                      <article className="border border-border/50 rounded-sm overflow-hidden hover:border-border hover:bg-muted/30 transition-colors duration-0 bg-card/50">
                        {/* ASCII Preview */}
                        <div className="aspect-square bg-black p-2 overflow-hidden">
                          <pre className="text-[6px] leading-[1.1] text-green-400 font-mono whitespace-pre overflow-hidden h-full">
                            {artwork.frames[0]?.slice(0, 500) || ''}
                          </pre>
                        </div>

                        {/* Metadata */}
                        <div className="p-2.5">
                          <p className="text-xs font-medium line-clamp-1">{artwork.prompt}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {artwork.frames.length} frame{artwork.frames.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </article>
                    </Link>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveArtwork(artwork._id)}
                      className="absolute top-1.5 right-1.5 h-5 w-5 bg-black/80 hover:bg-destructive text-white rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-0 cursor-default"
                      title="Remove from collection"
                    >
                      <Trash size={10} />
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
              <Label className="text-xs">visibility</Label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditVisibility('private')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-medium transition-colors duration-0 cursor-default',
                    editVisibility === 'private'
                      ? 'border-foreground bg-foreground/5 text-foreground'
                      : 'border-border/50 text-muted-foreground hover:border-border hover:bg-muted/50'
                  )}
                >
                  <Lock className="h-3.5 w-3.5" />
                  private
                </button>
                <button
                  type="button"
                  onClick={() => setEditVisibility('public')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-medium transition-colors duration-0 cursor-default',
                    editVisibility === 'public'
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
              onClick={handleUpdate}
              disabled={!editName.trim() || isUpdating}
              size="sm"
              className="w-full text-xs"
            >
              {isUpdating ? 'saving...' : 'save changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
