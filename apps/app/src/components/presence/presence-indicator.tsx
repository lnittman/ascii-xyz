'use client';

import { cn } from '@repo/design/lib/utils';
import { usePresence, type PresenceUser } from '@/hooks/use-presence';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/design/components/ui/tooltip';

interface PresenceIndicatorProps {
  roomId: string | undefined;
  className?: string;
  /** Maximum avatars to show before +N indicator */
  maxVisible?: number;
}

/**
 * Shows a facepile of users currently viewing a room (e.g., artwork page)
 */
export function PresenceIndicator({
  roomId,
  className,
  maxVisible = 5,
}: PresenceIndicatorProps) {
  const { status, users, isConnected } = usePresence(roomId);

  // Don't show anything if not connected or no other users
  if (status === 'loading' || !isConnected || users.length <= 1) {
    return null;
  }

  // Filter out current user for display (they know they're here)
  const otherUsers = users.slice(0, maxVisible);
  const overflow = users.length - maxVisible;

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-1', className)}>
        <div className="flex -space-x-2">
          {otherUsers.map((user, index) => (
            <UserAvatar key={user.id} user={user} index={index} />
          ))}
          {overflow > 0 && (
            <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
              +{overflow}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground ml-2">
          {users.length} viewing
        </span>
      </div>
    </TooltipProvider>
  );
}

interface UserAvatarProps {
  user: PresenceUser;
  index: number;
}

function UserAvatar({ user, index }: UserAvatarProps) {
  // Generate consistent color from user ID
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-orange-500',
  ];
  const colorIndex = user.id.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  // Get initials
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-background text-xs font-medium text-white',
            bgColor
          )}
          style={{ zIndex: 10 - index }}
        >
          {initials || '?'}
          {/* Online indicator dot */}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-400" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {user.name}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Compact presence dot - shows online status without facepile
 */
export function PresenceDot({
  roomId,
  className,
}: {
  roomId: string | undefined;
  className?: string;
}) {
  const { status, users, isConnected } = usePresence(roomId);

  if (status === 'loading' || !isConnected) {
    return null;
  }

  const othersCount = Math.max(0, users.length - 1);

  if (othersCount === 0) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'flex items-center gap-1.5 text-xs text-muted-foreground',
            className
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span>{othersCount} other{othersCount !== 1 ? 's' : ''} viewing</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {users.map((u) => u.name).join(', ')}
      </TooltipContent>
    </Tooltip>
  );
}
