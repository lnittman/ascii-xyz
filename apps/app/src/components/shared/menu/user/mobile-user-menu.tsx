'use client';

import { useUser } from '@repo/auth/client';
import { useAtom } from 'jotai';
import { mobileUserMenuOpenAtom } from '@/atoms/menus';

export function MobileUserMenu() {
  const { user } = useUser();
  const [, setIsOpen] = useAtom(mobileUserMenuOpenAtom);

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : user.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || '?';

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium hover-transition hover:bg-muted/80"
      aria-label="User menu"
    >
      {user.imageUrl ? (
        <img
          src={user.imageUrl}
          alt="User avatar"
          className="h-full w-full object-cover rounded-full"
        />
      ) : (
        initials
      )}
    </button>
  );
}
