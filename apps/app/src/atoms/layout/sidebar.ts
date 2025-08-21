import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Sidebar state
export const sidebarOpenAtom = atomWithStorage<boolean>('sidebarOpen', true); // Default to open on desktop

// Right sidebar states for logs page
export const groupStatsSidebarAtom = atom(false);
export const groupDetailsSidebarAtom = atom(false);

// Active right sidebar (only one can be open at a time)
export type RightSidebarType = 'stats' | 'details' | null;
export const activeRightSidebarAtom = atom<RightSidebarType>(null);
