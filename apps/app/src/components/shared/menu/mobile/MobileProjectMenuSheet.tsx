'use client';

import {
  mobileProjectMenuOpenAtom,
  mobileProjectMenuStateAtom,
} from '@/atoms/mobile-menus';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import { useModals } from '@/hooks/use-modals';
import { Archive, PencilSimple, Trash } from '@phosphor-icons/react';
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

export function MobileProjectMenuSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileProjectMenuOpenAtom);
  const [menuState] = useAtom(mobileProjectMenuStateAtom);
  const { openDeleteModal, openRenameModal, openArchiveModal } = useModals();

  const handleClose = () => setIsOpen(false);

  const handleAction = (action: () => void) => {
    handleClose();
    action();
  };

  const { projectId } = menuState;

  if (!projectId) {
    return null;
  }

  return (
    <MobileSheet isOpen={isOpen} onClose={handleClose} title="project actions">
      <div className="py-2">
        <MenuItem
          icon={<PencilSimple size={20} />}
          label="rename"
          onClick={() =>
            handleAction(() => openRenameModal(projectId, 'project'))
          }
        />
        <MenuItem
          icon={<Archive size={20} />}
          label="archive"
          onClick={() =>
            handleAction(() => openArchiveModal(projectId, 'project'))
          }
        />
        {/* Divider before destructive actions */}
        <div className="mx-3 my-1.5 border-border/20 border-t" />
        <MenuItem
          icon={<Trash size={20} />}
          label="delete"
          onClick={() =>
            handleAction(() => openDeleteModal(projectId, 'project'))
          }
          isDanger
        />
      </div>
    </MobileSheet>
  );
}
