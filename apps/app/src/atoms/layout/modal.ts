import { atom } from 'jotai';

export interface CommandModalState {
  open: boolean;
  activeItemId: string | null;
  searchQuery: string;
}

export interface CommandHoverState {
  hoveredItemId: string | null;
  // source indicates what caused the hover (mouse or keyboard)
  source: 'mouse' | 'keyboard' | null;
}

export const commandMenuOpenAtom = atom<boolean>(false);

export const commandModalAtom = atom<CommandModalState>({
  open: false,
  activeItemId: null,
  searchQuery: '',
});

export const commandHoverAtom = atom<CommandHoverState>({
  hoveredItemId: null,
  source: null,
});

export const projectModalOpenAtom = atom<boolean>(false);

export const settingsModalOpenAtom = atom<boolean>(false);

export interface ItemModalState {
  open: boolean;
  itemId: string | null;
  itemType: 'chat' | 'project';
}

export const deleteChatModalAtom = atom<ItemModalState>({
  open: false,
  itemId: null,
  itemType: 'chat',
});

export const archiveChatModalAtom = atom<ItemModalState>({
  open: false,
  itemId: null,
  itemType: 'chat',
});

export const renameChatModalAtom = atom<ItemModalState>({
  open: false,
  itemId: null,
  itemType: 'chat',
});

export const shareChatModalAtom = atom<ItemModalState>({
  open: false,
  itemId: null,
  itemType: 'chat',
});

export const addToProjectChatModalAtom = atom<ItemModalState>({
  open: false,
  itemId: null,
  itemType: 'chat',
});

export const projectFilesModalAtom = atom<ItemModalState>({
  open: false,
  itemId: null,
  itemType: 'project',
});

export const projectInstructionsModalAtom = atom<ItemModalState>({
  open: false,
  itemId: null,
  itemType: 'project',
});

export interface ToolDetailModalState {
  open: boolean;
  toolName: string;
  toolArgs: Record<string, any>;
  toolResult?: any;
}

export const toolDetailModalAtom = atom<ToolDetailModalState>({
  open: false,
  toolName: '',
  toolArgs: {},
  toolResult: undefined,
});

export interface AttachmentModalState {
  open: boolean;
  attachmentId: string | null;
  attachmentType:
    | 'image'
    | 'text'
    | 'file'
    | 'code'
    | 'pdf'
    | 'doc'
    | 'spreadsheet'
    | 'audio'
    | 'video'
    | null;
  modalType: 'preview' | 'edit' | 'details';
  metadata?: Record<string, any>;
}

export const attachmentModalAtom = atom<AttachmentModalState>({
  open: false,
  attachmentId: null,
  attachmentType: null,
  modalType: 'preview',
  metadata: {},
});

export interface ModelsModalState {
  open: boolean;
}

export const modelsModalAtom = atom<ModelsModalState>({
  open: false,
});

export interface ProviderModelsModalState {
  open: boolean;
  providerId: string | null;
  providerName: string | null;
}

export const providerModelsModalAtom = atom<ProviderModelsModalState>({
  open: false,
  providerId: null,
  providerName: null,
});

// Avatar upload modal state
export interface AvatarUploadModalState {
  open: boolean;
  file: File | null;
}

export const avatarUploadModalAtom = atom<AvatarUploadModalState>({
  open: false,
  file: null,
});
