'use client';

import { Empty, Plus } from '@phosphor-icons/react';
import { useAtom } from 'jotai';
import { useTransitionRouter } from 'next-view-transitions';
import type React from 'react';

import { mobileWorkspaceDropdownOpenAtom } from '@/atoms/mobile-menus';
import { currentWorkspaceIdAtom, workspacesAtom } from '@/atoms/workspace';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';

const MenuItem = ({
  children,
  onClick,
  isSelected = false,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isSelected?: boolean;
  icon?: React.ReactNode;
}) => (
  <div className="px-3 py-1">
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-none px-3 py-3 text-left text-foreground text-sm transition-colors hover:bg-accent"
    >
      <div className="flex items-center gap-3">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
      </div>
      {isSelected && (
        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
      )}
    </button>
  </div>
);

export function MobileWorkspaceSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileWorkspaceDropdownOpenAtom);
  const [workspaces] = useAtom(workspacesAtom);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useAtom(
    currentWorkspaceIdAtom
  );
  const router = useTransitionRouter();

  const handleClose = () => setIsOpen(false);

  const handleSelectWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    handleClose();
  };

  const handleCreateWorkspace = () => {
    handleClose();
    router.push('/code/settings/workspaces?action=create');
  };

  return (
    <MobileSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="select workspace"
      position="bottom"
    >
      <div>
        {workspaces.length === 0 ? (
          <>
            {/* Empty State - matching ModelPicker style */}
            <div className="flex flex-1 items-center justify-center py-8">
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-muted/40">
                  <Empty
                    weight="duotone"
                    className="h-6 w-6 text-muted-foreground"
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  no workspaces configured
                </p>
              </div>
            </div>

            {/* Bottom action button - matching ModelPicker style */}
            <div className="border-border/50 border-t py-2">
              <MenuItem
                onClick={handleCreateWorkspace}
                icon={<Plus size={20} weight="duotone" />}
              >
                create workspace
              </MenuItem>
            </div>
          </>
        ) : (
          <>
            {/* Existing Workspaces */}
            <div className="border-border/50 border-b py-2 pb-2">
              {workspaces.map((workspace) => (
                <MenuItem
                  key={workspace.id}
                  onClick={() => handleSelectWorkspace(workspace.id)}
                  isSelected={workspace.id === currentWorkspaceId}
                >
                  {workspace.name}
                </MenuItem>
              ))}
            </div>

            {/* Create New Workspace */}
            <div className="py-2">
              <MenuItem
                onClick={handleCreateWorkspace}
                icon={<Plus size={20} weight="duotone" />}
              >
                create new
              </MenuItem>
            </div>
          </>
        )}
      </div>
    </MobileSheet>
  );
}
