'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { Label } from '@repo/design/components/ui/label';
import { Switch } from '@repo/design/components/ui/switch';
import { 
  User,
  Envelope,
  Key,
  Bell,
  Moon,
  Eye,
  Shield,
  SignOut,
  Camera,
  Check
} from '@phosphor-icons/react';
import { cn } from '@repo/design/lib/utils';
import { motion } from 'framer-motion';

export default function ProfileSettingsPage() {
  const { user } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState(user?.firstName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState('');

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUpdating(false);
  };

  const handleSignOut = () => {
    if (confirm('ARE YOU SURE YOU WANT TO SIGN OUT?')) {
      // Clerk sign out
      console.log('Signing out...');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-mono text-lg font-semibold uppercase tracking-wider">
          PROFILE
        </h2>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          MANAGE YOUR ACCOUNT AND PREFERENCES
        </p>
      </div>

      {/* Profile Information */}
      <div className="space-y-6">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          PROFILE INFORMATION
        </h3>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-border bg-muted">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.firstName || 'Profile'}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-muted">
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              PROFILE PICTURE
            </p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              JPG, PNG OR GIF. MAX 2MB.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="display-name"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                DISPLAY NAME
              </Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="JOHN DOE"
                className="font-mono text-xs uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                USERNAME
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@USERNAME"
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
            >
              EMAIL ADDRESS
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="email"
                type="email"
                value={user?.primaryEmailAddress?.emailAddress || ''}
                disabled
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs uppercase tracking-wider"
              >
                CHANGE
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="bio"
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
            >
              BIO
            </Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="TELL US ABOUT YOURSELF..."
              rows={3}
              className={cn(
                'w-full rounded-md border border-border bg-background px-3 py-2',
                'font-mono text-xs placeholder:text-muted-foreground/60',
                'focus:border-foreground focus:outline-none'
              )}
            />
            <p className="font-mono text-[10px] text-muted-foreground">
              {bio.length}/200 CHARACTERS
            </p>
          </div>
        </div>

        <Button
          onClick={handleUpdateProfile}
          disabled={isUpdating}
          className="font-mono text-xs uppercase tracking-wider"
        >
          {isUpdating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mr-2 h-4 w-4 rounded-full border-2 border-background border-t-transparent"
              />
              UPDATING...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              UPDATE PROFILE
            </>
          )}
        </Button>
      </div>

      {/* Privacy & Security */}
      <div className="space-y-4 border-t border-border/50 pt-8">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          PRIVACY & SECURITY
        </h3>

        <div className="space-y-3">
          {/* Email Notifications */}
          <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="email-notifications"
                  className="font-mono text-xs uppercase tracking-wider"
                >
                  EMAIL NOTIFICATIONS
                </Label>
                <p className="font-mono text-[10px] text-muted-foreground">
                  RECEIVE UPDATES ABOUT YOUR ARTWORKS
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          {/* Public Profile */}
          <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="public-profile"
                  className="font-mono text-xs uppercase tracking-wider"
                >
                  PUBLIC PROFILE
                </Label>
                <p className="font-mono text-[10px] text-muted-foreground">
                  ALLOW OTHERS TO VIEW YOUR PROFILE
                </p>
              </div>
            </div>
            <Switch
              id="public-profile"
              checked={publicProfile}
              onCheckedChange={setPublicProfile}
            />
          </div>

          {/* Two-Factor */}
          <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="two-factor"
                  className="font-mono text-xs uppercase tracking-wider"
                >
                  TWO-FACTOR AUTHENTICATION
                </Label>
                <p className="font-mono text-[10px] text-muted-foreground">
                  ADD AN EXTRA LAYER OF SECURITY
                </p>
              </div>
            </div>
            <Switch
              id="two-factor"
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="space-y-4 border-t border-border/50 pt-8">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-red-500">
          DANGER ZONE
        </h3>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="justify-start border-red-500/50 font-mono text-xs uppercase tracking-wider text-red-500 hover:bg-red-500/10"
          >
            <SignOut className="mr-2 h-4 w-4" />
            SIGN OUT
          </Button>

          <Button
            variant="outline"
            disabled
            className="justify-start font-mono text-xs uppercase tracking-wider opacity-50"
          >
            DELETE ACCOUNT
          </Button>
        </div>

        <p className="font-mono text-[10px] text-muted-foreground">
          DELETING YOUR ACCOUNT IS PERMANENT AND CANNOT BE UNDONE
        </p>
      </div>
    </div>
  );
}