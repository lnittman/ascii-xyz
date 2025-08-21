import { atom } from 'jotai';

// Global state to control the main blur overlay.
// This ensures smooth transitions between different mobile menus.
export const isMobileMenuOpenAtom = atom(false);

// --- Individual Menu Atoms ---

// For Chat Menu (in ChatMenu.tsx)
export const mobileChatMenuOpenAtom = atom(false);
export const mobileChatMenuStateAtom = atom<{
  chatId: string | null;
  isProject: boolean;
}>({
  chatId: null,
  isProject: false,
});

// For Project Menu (in ChatList.tsx)
export const mobileProjectMenuOpenAtom = atom(false);
export const mobileProjectMenuStateAtom = atom<{ projectId: string | null }>({
  projectId: null,
});

// For Project Modal (create new project)
export const mobileProjectModalOpenAtom = atom(false);

// For Project Files Modal
export const mobileProjectFilesModalOpenAtom = atom(false);
export const mobileProjectFilesModalStateAtom = atom<{
  projectId: string | null;
}>({
  projectId: null,
});

// For Project Instructions Modal
export const mobileProjectInstructionsModalOpenAtom = atom(false);
export const mobileProjectInstructionsModalStateAtom = atom<{
  projectId: string | null;
}>({
  projectId: null,
});

// Add atoms for modals you want to convert later
// Example for RenameChatModal
export const mobileRenameModalOpenAtom = atom(false);
export const mobileRenameModalStateAtom = atom<{
  itemId: string | null;
  itemType: 'chat' | 'project';
}>({
  itemId: null,
  itemType: 'chat',
});

// For ShareChatModal
export const mobileShareModalOpenAtom = atom(false);
export const mobileShareModalStateAtom = atom<{ chatId: string | null }>({
  chatId: null,
});

// For AddToProjectModal
export const mobileAddToProjectModalOpenAtom = atom(false);
export const mobileAddToProjectModalStateAtom = atom<{ itemId: string | null }>(
  {
    itemId: null,
  }
);

// For DeleteChatModal
export const mobileDeleteModalOpenAtom = atom(false);
export const mobileDeleteModalStateAtom = atom<{
  itemId: string | null;
  itemType: 'chat' | 'project';
}>({
  itemId: null,
  itemType: 'chat',
});

// For ArchiveChatModal
export const mobileArchiveModalOpenAtom = atom(false);
export const mobileArchiveModalStateAtom = atom<{
  itemId: string | null;
  itemType: 'chat' | 'project';
}>({
  itemId: null,
  itemType: 'chat',
});

// For PlusMenu
export const mobilePlusMenuOpenAtom = atom(false);

// For ModelPicker
export const mobileModelPickerOpenAtom = atom(false);

// For Command/Search Menu
export const mobileCommandMenuOpenAtom = atom(false);

// For User Menu
export const mobileUserMenuOpenAtom = atom(false);

// For Provider Models Modal/Sheet
export const mobileProviderModelsModalOpenAtom = atom(false);
export const mobileProviderModelsModalStateAtom = atom<{
  providerId: string | null;
  providerName: string | null;
}>({
  providerId: null,
  providerName: null,
});

// For Avatar Upload Modal/Sheet
export const mobileAvatarUploadModalOpenAtom = atom(false);
export const mobileAvatarUploadModalStateAtom = atom<{
  file: File | null;
}>({
  file: null,
});

// For Code User Menu
export const mobileCodeUserMenuOpenAtom = atom(false);

// For Code Workspace Dropdown
export const mobileWorkspaceDropdownOpenAtom = atom(false);

// Global handlers for mobile sheets
export const mobilePlusMenuHandlersAtom = atom<{
  onFileSelect?: (files: FileList) => void;
  onScreenshotCapture?: (attachment: any) => void;
}>({});

export const mobileModelPickerHandlersAtom = atom<{
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
}>({});
