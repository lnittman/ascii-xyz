import { atom } from 'jotai';

interface User {
  id: string;
  clerkId: string;
  activeModel?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Initial user data from server-side rendering
export const initialUserAtom = atom<User | undefined>(undefined);

// Store user preferences (will be hydrated from localStorage on client)
export const userPreferencesAtom = atom({
  compactView: false,
  showTimestamps: true,
  hideSharedWarning: false,
});

// Track user authentication state
export const isUserAuthenticatedAtom = atom(false);
