'use client';

import { attachmentModalAtom } from '@/atoms/layout/modal';
import type { Attachment } from '@/components/shared/prompt-bar/components/attachment-row';
import { useAtom } from 'jotai';
import { useCallback } from 'react';

// This hook manages the state for attachment previews/modals using atoms
export function useAttachmentModals() {
  const [attachmentModalState, setAttachmentModalState] =
    useAtom(attachmentModalAtom);

  // Open a modal for the given attachment
  const showAttachmentModal = useCallback(
    (
      attachment: Attachment,
      type: 'preview' | 'edit' | 'details' = 'preview'
    ) => {
      setAttachmentModalState({
        open: true,
        attachmentId: attachment.id,
        attachmentType: attachment.type,
        modalType: type,
        metadata: {
          name: attachment.name,
          size: attachment.size,
          content: attachment.content,
          url: attachment.url,
          ...attachment.metadata,
        },
      });
    },
    [setAttachmentModalState]
  );

  // Close the modal
  const handleAttachmentModalClose = useCallback(() => {
    setAttachmentModalState((prev) => ({
      ...prev,
      open: false,
    }));
  }, [setAttachmentModalState]);

  // Preview an attachment (shorthand for common use case)
  const previewAttachment = useCallback(
    (attachment: Attachment) => {
      showAttachmentModal(attachment, 'preview');
    },
    [showAttachmentModal]
  );

  return {
    isModalOpen: attachmentModalState.open,
    currentAttachment: attachmentModalState.attachmentId
      ? ({
          id: attachmentModalState.attachmentId,
          type: attachmentModalState.attachmentType!,
          name: (attachmentModalState.metadata?.name as string) || '',
          size: attachmentModalState.metadata?.size as number,
          content: attachmentModalState.metadata?.content as string,
          url: attachmentModalState.metadata?.url as string,
        } as Attachment)
      : null,
    modalType: attachmentModalState.modalType,
    showAttachmentModal,
    handleAttachmentModalClose,
    previewAttachment,
  };
}
