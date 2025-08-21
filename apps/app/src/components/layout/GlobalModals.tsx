'use client';

import { AddToProjectModal } from '@/components/layout/modal/AddToProjectModal';
import { ProjectFilesModal } from '@/components/layout/modal/ProjectFilesModal';
import { ProjectInstructionsModal } from '@/components/layout/modal/ProjectInstructionsModal';
import { ProjectModal } from '@/components/layout/modal/ProjectModal';
import { RenameModal } from '@/components/layout/modal/RenameChatModal';
import { ShareChatModal } from '@/components/layout/modal/ShareChatModal';
import { ToolDetailModal } from '@/components/layout/modal/ToolDetailModal';
import { FilePreviewModal } from '@/components/layout/modal/attachments/FilePreviewModal';
import { ImagePreviewModal } from '@/components/layout/modal/attachments/ImagePreviewModal';
import { TextPreviewModal } from '@/components/layout/modal/attachments/TextPreviewModal';
import { CommandMenuModal } from '@/components/layout/modal/command-menu';
import { DeleteModal } from '@/components/layout/modal/delete';

import { ModelsModal } from '@/components/code/settings/components/ModelsModal';
import { AvatarUploadModal } from '@/components/layout/modal/AvatarUploadModal';
import { ProviderModelsModal } from '@/components/layout/modal/ProviderModelsModal';
import { ArchiveModal } from '@/components/layout/modal/archive';
import { useModals } from '@/hooks/use-modals';

/**
 * Shared component containing all global modals
 * This ensures consistent modal availability across all layouts
 */
export function Modals() {
  const {
    modals,
    closeArchiveModal,
    closeDeleteModal,
    closeRenameModal,
    closeShareModal,
    closeAddToProjectModal,
    closeProjectFilesModal,
    closeProjectInstructionsModal,
    closeToolDetailModal,
    closeModelsModal,
    closeProviderModelsModal,
    closeAvatarUploadModal,
  } = useModals();

  return (
    <>
      <CommandMenuModal />

      <ArchiveModal
        isOpen={modals.archive.open}
        onClose={closeArchiveModal}
        itemId={modals.archive.itemId}
        itemType={modals.archive.itemType}
      />

      <DeleteModal
        isOpen={modals.delete.open}
        onClose={closeDeleteModal}
        itemId={modals.delete.itemId}
        itemType={modals.delete.itemType}
      />

      <RenameModal
        isOpen={modals.rename.open}
        onClose={closeRenameModal}
        itemId={modals.rename.itemId}
        itemType={modals.rename.itemType}
      />

      <ShareChatModal
        isOpen={modals.share.open}
        onClose={closeShareModal}
        chatId={modals.share.itemId || ''}
      />

      <ToolDetailModal
        isOpen={modals.toolDetail.open}
        onClose={closeToolDetailModal}
        toolName={modals.toolDetail.toolName}
        toolArgs={modals.toolDetail.toolArgs}
        toolResult={modals.toolDetail.toolResult}
      />

      {/* Attachment modals */}
      <ImagePreviewModal />
      <TextPreviewModal />
      <FilePreviewModal />

      <ProjectModal />

      <AddToProjectModal
        isOpen={modals.addToProject.open}
        onClose={closeAddToProjectModal}
        chatId={modals.addToProject.itemId}
      />

      <ProjectFilesModal
        isOpen={modals.projectFiles.open}
        onClose={closeProjectFilesModal}
        projectId={modals.projectFiles.itemId}
      />

      <ProjectInstructionsModal
        isOpen={modals.projectInstructions.open}
        onClose={closeProjectInstructionsModal}
        projectId={modals.projectInstructions.itemId}
      />

      <ModelsModal isOpen={modals.models.open} onClose={closeModelsModal} />

      <ProviderModelsModal
        isOpen={modals.providerModels.open}
        onClose={closeProviderModelsModal}
        providerId={modals.providerModels.providerId}
        providerName={modals.providerModels.providerName}
      />

      <AvatarUploadModal />
    </>
  );
}
