import type { Project } from '@repo/database/types';
import { atom } from 'jotai';

// UI state atoms for project interactions
export const currentProjectAtom = atom<Project | null>(null);
export const projectLoadingAtom = atom<boolean>(false);

// Note: Project data is managed by SWR hooks
// We only use Jotai for UI state
