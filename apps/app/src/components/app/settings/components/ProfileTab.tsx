'use client';

import type React from 'react';
import { useRef } from 'react';

import { useUser } from '@clerk/nextjs';

import { TransitionAvatar } from '@/components/shared/avatar/TransitionAvatar';
import { toast } from '@/components/shared/ui/custom-toast';
import { useModals } from '@/hooks/use-modals';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { Label } from '@repo/design/components/ui/label';
import { cn } from '@repo/design/lib/utils';

export function ProfileTab() {
  const { user } = useUser();
  const { openAvatarUploadModal } = useModals();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    // Would implement profile saving logic here
  };

  const handleChangeAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('file size must be less than 5mb');
      return;
    }

    // Open modal with selected file
    openAvatarUploadModal(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get user initials for avatar fallback
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || '?';

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Avatar Section */}
      <div className="flex items-center gap-4 border-border/10 border-b pb-4">
        <TransitionAvatar
          src={user?.imageUrl}
          alt={user?.fullName || 'Avatar'}
          className="flex h-20 w-20 items-center justify-center rounded-none"
          imageClassName="h-20 w-20 object-cover"
          fallback={
            <div
              className={cn(
                'flex h-20 w-20 flex-shrink-0 items-center justify-center border border-border/40 bg-background font-medium text-2xl text-foreground transition-all duration-150 hover:border-border'
              )}
            >
              {initials}
            </div>
          }
        />
        <div>
          <p className="font-medium text-foreground">{user?.fullName}</p>
          <p className="text-muted-foreground text-sm">
            {user?.emailAddresses?.[0]?.emailAddress}
          </p>
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-foreground"
              onClick={handleChangeAvatarClick}
            >
              change avatar
            </Button>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-foreground">
              first name
            </Label>
            <Input
              id="firstName"
              defaultValue={user?.firstName || ''}
              className="text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-foreground">
              last name
            </Label>
            <Input
              id="lastName"
              defaultValue={user?.lastName || ''}
              className="text-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-foreground">
            username
          </Label>
          <Input
            id="username"
            defaultValue={user?.username || ''}
            className="text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-foreground">
            bio
          </Label>
          <textarea
            id="bio"
            className="min-h-[100px] w-full border border-input bg-transparent px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="tell us about yourself"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveProfile}
          className="text-foreground"
          variant="accent"
        >
          save changes
        </Button>
      </div>
    </div>
  );
}
