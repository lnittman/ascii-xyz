import { atom } from 'jotai';

// UI state atoms for chat interactions
export const chatLoadingAtom = atom<boolean>(false);
export const currentChatIdAtom = atom<string | null>(null);
export const initialPromptAtom = atom<string>('');
export const isMessageSubmittedAtom = atom<boolean>(false);
export const promptFocusedAtom = atom<boolean>(false);
export const promptInputAtom = atom<string>('');
export const promptSubmittingAtom = atom<boolean>(false);

// Note: Chat data (chats, messages) is managed by SWR hooks
// We only use Jotai for UI state that doesn't come from the server
