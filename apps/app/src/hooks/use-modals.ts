'use client';

import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { useAtom } from 'jotai';

import {
  addToProjectChatModalAtom,
  archiveChatModalAtom,
  avatarUploadModalAtom,
  commandHoverAtom,
  commandModalAtom,
  deleteChatModalAtom,
  modelsModalAtom,
  projectFilesModalAtom,
  projectInstructionsModalAtom,
  providerModelsModalAtom,
  renameChatModalAtom,
  shareChatModalAtom,
  toolDetailModalAtom,
} from '@/atoms/layout/modal';

import {
  mobileAddToProjectModalOpenAtom,
  mobileAddToProjectModalStateAtom,
  mobileArchiveModalOpenAtom,
  mobileArchiveModalStateAtom,
  mobileAvatarUploadModalOpenAtom,
  mobileAvatarUploadModalStateAtom,
  mobileDeleteModalOpenAtom,
  mobileDeleteModalStateAtom,
  mobileProjectFilesModalOpenAtom,
  mobileProjectFilesModalStateAtom,
  mobileProjectInstructionsModalOpenAtom,
  mobileProjectInstructionsModalStateAtom,
  mobileProviderModelsModalOpenAtom,
  mobileProviderModelsModalStateAtom,
  mobileRenameModalOpenAtom,
  mobileRenameModalStateAtom,
  mobileShareModalOpenAtom,
  mobileShareModalStateAtom,
} from '@/atoms/mobile-menus';

type ItemType = 'chat' | 'project';

export function useModals() {
  const { isMobile } = useIsMobile();

  // Desktop modal atoms
  const [deleteModal, setDeleteModal] = useAtom(deleteChatModalAtom);
  const [archiveModal, setArchiveModal] = useAtom(archiveChatModalAtom);
  const [renameModal, setRenameModal] = useAtom(renameChatModalAtom);
  const [shareModal, setShareModal] = useAtom(shareChatModalAtom);
  const [addToProjectModal, setAddToProjectModal] = useAtom(
    addToProjectChatModalAtom
  );
  const [projectFilesModal, setProjectFilesModal] = useAtom(
    projectFilesModalAtom
  );
  const [projectInstructionsModal, setProjectInstructionsModal] = useAtom(
    projectInstructionsModalAtom
  );
  const [toolDetailModal, setToolDetailModal] = useAtom(toolDetailModalAtom);
  const [commandModal, setCommandModal] = useAtom(commandModalAtom);
  const [commandHover, setCommandHover] = useAtom(commandHoverAtom);
  const [modelsModal, setModelsModal] = useAtom(modelsModalAtom);
  const [providerModelsModal, setProviderModelsModal] = useAtom(
    providerModelsModalAtom
  );
  const [avatarUploadModal, setAvatarUploadModal] = useAtom(
    avatarUploadModalAtom
  );

  // Mobile modal atoms
  const [, setMobileRenameOpen] = useAtom(mobileRenameModalOpenAtom);
  const [, setMobileRenameState] = useAtom(mobileRenameModalStateAtom);
  const [, setMobileShareOpen] = useAtom(mobileShareModalOpenAtom);
  const [, setMobileShareState] = useAtom(mobileShareModalStateAtom);
  const [, setMobileAddToProjectOpen] = useAtom(
    mobileAddToProjectModalOpenAtom
  );
  const [, setMobileAddToProjectState] = useAtom(
    mobileAddToProjectModalStateAtom
  );
  const [, setMobileDeleteOpen] = useAtom(mobileDeleteModalOpenAtom);
  const [, setMobileDeleteState] = useAtom(mobileDeleteModalStateAtom);
  const [, setMobileArchiveOpen] = useAtom(mobileArchiveModalOpenAtom);
  const [, setMobileArchiveState] = useAtom(mobileArchiveModalStateAtom);
  const [, setMobileProviderModelsOpen] = useAtom(
    mobileProviderModelsModalOpenAtom
  );
  const [, setMobileProviderModelsState] = useAtom(
    mobileProviderModelsModalStateAtom
  );
  const [, setMobileProjectFilesOpen] = useAtom(
    mobileProjectFilesModalOpenAtom
  );
  const [, setMobileProjectFilesState] = useAtom(
    mobileProjectFilesModalStateAtom
  );
  const [, setMobileProjectInstructionsOpen] = useAtom(
    mobileProjectInstructionsModalOpenAtom
  );
  const [, setMobileProjectInstructionsState] = useAtom(
    mobileProjectInstructionsModalStateAtom
  );
  const [, setMobileAvatarUploadOpen] = useAtom(
    mobileAvatarUploadModalOpenAtom
  );
  const [, setMobileAvatarUploadState] = useAtom(
    mobileAvatarUploadModalStateAtom
  );

  return {
    // Modal state
    modals: {
      delete: deleteModal,
      archive: archiveModal,
      rename: renameModal,
      share: shareModal,
      addToProject: addToProjectModal,
      projectFiles: projectFilesModal,
      projectInstructions: projectInstructionsModal,
      toolDetail: toolDetailModal,
      command: commandModal,
      commandHover,
      models: modelsModal,
      providerModels: providerModelsModal,
      avatarUpload: avatarUploadModal,
    },

    // Modal management
    openDeleteModal: (itemId: string, itemType: ItemType = 'chat') => {
      if (isMobile) {
        setMobileDeleteState({ itemId, itemType });
        setMobileDeleteOpen(true);
      } else {
        setDeleteModal({ open: true, itemId, itemType });
      }
    },

    closeDeleteModal: () =>
      setDeleteModal((prev) => {
        if (!prev.open) {
          return prev;
        }
        return { open: false, itemId: null, itemType: 'chat' };
      }),

    openArchiveModal: (itemId: string, itemType: ItemType = 'chat') => {
      if (isMobile) {
        setMobileArchiveState({ itemId, itemType });
        setMobileArchiveOpen(true);
      } else {
        setArchiveModal({ open: true, itemId, itemType });
      }
    },

    closeArchiveModal: () =>
      setArchiveModal((prev) => {
        if (!prev.open) {
          return prev;
        }
        return { open: false, itemId: null, itemType: 'chat' };
      }),

    openRenameModal: (itemId: string, itemType: ItemType = 'chat') => {
      if (isMobile) {
        setMobileRenameState({ itemId, itemType });
        setMobileRenameOpen(true);
      } else {
        setRenameModal({ open: true, itemId, itemType });
      }
    },

    closeRenameModal: () =>
      setRenameModal((prev) => {
        if (!prev.open) {
          return prev;
        }
        return { open: false, itemId: null, itemType: 'chat' };
      }),

    // Share is only for chats, not projects
    openShareModal: (itemId: string) => {
      if (isMobile) {
        setMobileShareState({ chatId: itemId });
        setMobileShareOpen(true);
      } else {
        setShareModal({ open: true, itemId, itemType: 'chat' });
      }
    },

    closeShareModal: () =>
      setShareModal((prev) => {
        if (!prev.open) {
          return prev;
        }
        return { open: false, itemId: null, itemType: 'chat' };
      }),

    openAddToProjectModal: (itemId: string) => {
      if (isMobile) {
        setMobileAddToProjectState({ itemId });
        setMobileAddToProjectOpen(true);
      } else {
        setAddToProjectModal({ open: true, itemId, itemType: 'chat' });
      }
    },

    closeAddToProjectModal: () =>
      setAddToProjectModal((prev) => {
        if (!prev.open) {
          return prev;
        }
        return { open: false, itemId: null, itemType: 'chat' };
      }),

    // Project modals
    openProjectFilesModal: (itemId: string) => {
      if (isMobile) {
        setMobileProjectFilesState({ projectId: itemId });
        setMobileProjectFilesOpen(true);
      } else {
        setProjectFilesModal({ open: true, itemId, itemType: 'project' });
      }
    },

    closeProjectFilesModal: () =>
      setProjectFilesModal((prev) => {
        if (!prev.open) {
          return prev;
        }
        return { open: false, itemId: null, itemType: 'project' };
      }),

    openProjectInstructionsModal: (itemId: string) => {
      if (isMobile) {
        setMobileProjectInstructionsState({ projectId: itemId });
        setMobileProjectInstructionsOpen(true);
      } else {
        setProjectInstructionsModal({
          open: true,
          itemId,
          itemType: 'project',
        });
      }
    },

    closeProjectInstructionsModal: () =>
      setProjectInstructionsModal((prev) => {
        if (!prev.open) {
          return prev;
        }
        return { open: false, itemId: null, itemType: 'project' };
      }),

    // Tool detail modal
    openToolDetailModal: (
      toolName: string,
      toolArgs: Record<string, any>,
      toolResult?: any
    ) => setToolDetailModal({ open: true, toolName, toolArgs, toolResult }),

    closeToolDetailModal: () =>
      setToolDetailModal((prev) => {
        if (!prev.open) {
          return prev;
        }
        return {
          open: false,
          toolName: '',
          toolArgs: {},
          toolResult: undefined,
        };
      }),

    // Command modal
    openCommandModal: (initialQuery = '') =>
      setCommandModal({
        open: true,
        activeItemId: null,
        searchQuery: initialQuery,
      }),

    closeCommandModal: () =>
      setCommandModal((prev) => {
        // Only update if the modal is currently open to prevent infinite loops
        if (!prev.open) {
          return prev;
        }
        return { open: false, activeItemId: null, searchQuery: '' };
      }),

    setCommandActiveItem: (itemId: string | null) =>
      setCommandModal((prev) => {
        // Only update if the itemId has changed to prevent infinite loops
        if (prev.activeItemId === itemId) {
          return prev;
        }
        return { ...prev, activeItemId: itemId };
      }),

    setCommandSearchQuery: (query: string) =>
      setCommandModal((prev) => {
        // Only update if the query has changed to prevent infinite loops
        if (prev.searchQuery === query) {
          return prev;
        }
        return { ...prev, searchQuery: query };
      }),

    // Command modal hover state management
    setCommandHoveredItem: (
      itemId: string | null,
      source: 'mouse' | 'keyboard' | null = 'mouse'
    ) => {
      if (
        commandHover.hoveredItemId === itemId &&
        commandHover.source === source
      ) {
        return;
      }

      // Update hover state
      setCommandHover({ hoveredItemId: itemId, source });

      // Update active item in main state only if we have a valid item ID
      // Critical: Don't set to null on mouse leave, which causes the preview to disappear
      if (itemId !== null) {
        setCommandModal((prev) => {
          if (prev.activeItemId === itemId) {
            return prev;
          }
          return { ...prev, activeItemId: itemId };
        });
      }
    },

    clearCommandHover: () => {
      // Just clear the hover state, don't affect the active item
      setCommandHover({ hoveredItemId: null, source: null });
    },

    // Models modal
    openModelsModal: () => setModelsModal({ open: true }),

    closeModelsModal: () =>
      setModelsModal((prev) => {
        if (!prev.open) {
          return prev;
        }
        return { open: false };
      }),

    // Provider models modal
    openProviderModelsModal: (providerId: string, providerName: string) => {
      if (isMobile) {
        setMobileProviderModelsState({ providerId, providerName });
        setMobileProviderModelsOpen(true);
      } else {
        setProviderModelsModal({ open: true, providerId, providerName });
      }
    },

    closeProviderModelsModal: () =>
      setProviderModelsModal((prev) => {
        if (!prev.open) {
          return prev;
        }
        return { open: false, providerId: null, providerName: null };
      }),

    // Avatar upload modal
    openAvatarUploadModal: (file: File | null = null) => {
      if (isMobile) {
        setMobileAvatarUploadState({ file });
        setMobileAvatarUploadOpen(true);
      } else {
        setAvatarUploadModal({ open: true, file });
      }
    },

    closeAvatarUploadModal: () =>
      setAvatarUploadModal((prev) => {
        if (!prev.open) {
          return prev;
        }
        return { open: false, file: null };
      }),
  };
}
