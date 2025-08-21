import type { Workspace } from '@repo/database/types';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Store current workspace ID in localStorage
export const currentWorkspaceIdAtom = atomWithStorage<string | null>(
  'currentWorkspaceId',
  null
);

// Workspaces data - populated from SWR hooks
export const workspacesAtom = atom<Workspace[]>([]);

// Derived atom for current workspace data
export const currentWorkspaceAtom = atom((get) => {
  const workspaces = get(workspacesAtom);
  const currentId = get(currentWorkspaceIdAtom);
  return workspaces.find((w) => w.id === currentId) || null;
});
