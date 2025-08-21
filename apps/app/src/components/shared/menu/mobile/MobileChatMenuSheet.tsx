'use client';

import {
  mobileChatMenuOpenAtom,
  mobileChatMenuStateAtom,
} from '@/atoms/mobile-menus';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import { useModals } from '@/hooks/use-modals';
import {
  Archive,
  Export,
  FolderSimple,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react';
import { useAtom } from 'jotai';
import type React from 'react';

const MenuItem = ({
  icon,
  label,
  onClick,
  isDanger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isDanger?: boolean;
}) => (
  <div className="px-3 py-1">
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-none px-3 py-3 text-left text-sm transition-all duration-300 ${
        isDanger
          ? 'text-red-500/70 hover:bg-red-500/10 hover:text-red-500'
          : 'text-foreground hover:bg-accent'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  </div>
);

export function MobileChatMenuSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileChatMenuOpenAtom);
  const [menuState] = useAtom(mobileChatMenuStateAtom);
  const {
    openDeleteModal,
    openRenameModal,
    openShareModal,
    openArchiveModal,
    openAddToProjectModal,
  } = useModals();

  const handleClose = () => setIsOpen(false);

  const handleAction = (action: () => void) => {
    handleClose();
    action();
  };

  const { chatId, isProject } = menuState;

  if (!chatId) {
    return null;
  }

  return (
    <MobileSheet isOpen={isOpen} onClose={handleClose} title="chat actions">
      <div className="py-2">
        <MenuItem
          icon={<PencilSimple size={20} />}
          label="rename"
          onClick={() =>
            handleAction(() =>
              openRenameModal(chatId, isProject ? 'project' : 'chat')
            )
          }
        />
        {!isProject && (
          <>
            <MenuItem
              icon={<Export size={20} />}
              label="share"
              onClick={() => handleAction(() => openShareModal(chatId))}
            />
            <MenuItem
              icon={<FolderSimple size={20} />}
              label="add to project"
              onClick={() => handleAction(() => openAddToProjectModal(chatId))}
            />
            {/* Divider before destructive actions */}
            <div className="mx-3 my-1.5 border-border/20 border-t" />
          </>
        )}
        <MenuItem
          icon={<Archive size={20} />}
          label="archive"
          onClick={() =>
            handleAction(() =>
              openArchiveModal(chatId, isProject ? 'project' : 'chat')
            )
          }
        />
        <MenuItem
          icon={<Trash size={20} />}
          label="delete"
          onClick={() =>
            handleAction(() =>
              openDeleteModal(chatId, isProject ? 'project' : 'chat')
            )
          }
          isDanger
        />
      </div>
    </MobileSheet>
  );
}
