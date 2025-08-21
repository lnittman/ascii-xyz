'use client';

import {
  CaretDown,
  CaretUp,
  Circle,
  Desktop,
  Empty,
  Plus,
} from '@phosphor-icons/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useTransitionRouter } from 'next-view-transitions';
import React, { useMemo } from 'react';

import { mobileWorkspaceDropdownOpenAtom } from '@/atoms/mobile-menus';
import {
  currentWorkspaceAtom,
  currentWorkspaceIdAtom,
  workspacesAtom,
} from '@/atoms/workspace';
import { Menu, type MenuGroup } from '@/components/shared/menu';
import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import { cn } from '@repo/design/lib/utils';

interface WorkspaceDropdownProps {
  className?: string;
  triggerClassName?: string;
  size?: 'sm' | 'md';
}

export function WorkspaceDropdown({
  className,
  triggerClassName,
  size = 'md',
}: WorkspaceDropdownProps): React.ReactElement {
  const [workspaces] = useAtom(workspacesAtom);
  const [_currentWorkspaceId, setCurrentWorkspaceId] = useAtom(
    currentWorkspaceIdAtom
  );
  const [currentWorkspace] = useAtom(currentWorkspaceAtom);
  const [isOpen, setIsOpen] = React.useState(false);
  const [_mobileWorkspaceDropdownOpen, setMobileWorkspaceDropdownOpen] =
    useAtom(mobileWorkspaceDropdownOpenAtom);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const router = useTransitionRouter();

  // Handle creating a new workspace
  const handleCreateWorkspace = () => {
    setIsOpen(false);
    router.push('/code/settings/workspaces/create');
  };

  // Define workspace menu groups
  const workspaceMenuGroups = useMemo<MenuGroup[]>(() => {
    const workspaceItems = workspaces.map((workspace) => ({
      id: workspace.id,
      label: workspace.name,
      icon: workspace.daemonId ? (
        <div className="flex items-center gap-1">
          <Desktop
            weight="duotone"
            size={14}
            className="text-muted-foreground"
          />
          <Circle
            weight="fill"
            size={8}
            className={cn(
              workspace.daemonStatus === 'connected'
                ? 'text-green-500'
                : 'text-red-500'
            )}
          />
        </div>
      ) : undefined,
      onClick: () => {
        setCurrentWorkspaceId(workspace.id);
        setIsOpen(false);
      },
    }));

    const groups: MenuGroup[] = [];

    // Add existing workspaces if any
    if (workspaceItems.length > 0) {
      groups.push({
        items: workspaceItems,
        showDivider: true,
      });
    }

    // Always show create workspace option
    groups.push({
      items: [
        {
          id: 'create-workspace',
          label: 'create workspace',
          icon: <Plus weight="duotone" className="h-4 w-4" />,
          onClick: handleCreateWorkspace,
        },
      ],
    });

    return groups;
  }, [workspaces, setCurrentWorkspaceId]);

  const displayText = currentWorkspace?.name || 'no workspace selected';
  const isWorkspaceSelected = !!currentWorkspace;

  const sizeClasses = {
    sm: 'h-8 text-xs px-2 py-1',
    md: 'h-8 text-sm px-3 py-1',
  };

  // Handle trigger click - open mobile sheet on mobile
  const handleTriggerClick = () => {
    if (!isDesktop) {
      setMobileWorkspaceDropdownOpen(true);
    }
  };

  return (
    <div className={className}>
      {isDesktop ? (
        <Menu
          trigger={
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'font-medium',
                  !isWorkspaceSelected && 'text-muted-foreground'
                )}
              >
                {displayText}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.div
                    key="up"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CaretUp
                      weight="duotone"
                      className="h-4 w-4 text-muted-foreground"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="down"
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CaretDown
                      weight="duotone"
                      className="h-4 w-4 text-muted-foreground"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          }
          groups={workspaceMenuGroups}
          triggerClassName={cn(
            'flex select-none items-center gap-2 rounded-none border transition-all',
            sizeClasses[size],
            // Normal state styling
            isWorkspaceSelected &&
              'border-accent/40 hover:border-accent/60 hover:bg-accent/40 hover:text-accent-foreground',
            // Orange/warning state styling
            !isWorkspaceSelected &&
              'border-orange-500/50 bg-orange-500/5 hover:border-orange-500/70 hover:bg-orange-500/10',
            triggerClassName
          )}
          triggerActiveClassName={cn(
            isWorkspaceSelected
              ? 'border-accent/60 bg-accent/40 text-accent-foreground'
              : 'border-orange-500/70 bg-orange-500/10'
          )}
          onOpenChange={setIsOpen}
          contentClassName="z-[250] min-w-[260px] shadow-sm"
          side="bottom"
          align="start"
          sideOffset={8}
          customContent={
            workspaces.length === 0 ? (
              <>
                {/* Empty State - matching ModelPicker style */}
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center px-3 py-8">
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
                <div className="border-border/50 border-t py-1">
                  <DropdownMenuPrimitive.Item
                    className={cn(
                      'relative mx-1 flex cursor-pointer select-none items-center rounded-none px-3 py-2 text-foreground text-sm outline-none transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus:bg-accent focus:text-accent-foreground',
                      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                    )}
                    onSelect={handleCreateWorkspace}
                  >
                    <div className="flex items-center gap-3">
                      <Plus
                        weight="duotone"
                        className="h-4 w-4 flex-shrink-0"
                      />
                      <span>create workspace</span>
                    </div>
                  </DropdownMenuPrimitive.Item>
                </div>
              </>
            ) : undefined
          }
        />
      ) : (
        <button
          onClick={handleTriggerClick}
          className={cn(
            'flex select-none items-center gap-2 rounded-none border transition-all',
            sizeClasses[size],
            // Normal state styling
            isWorkspaceSelected &&
              'border-accent/40 hover:border-accent/60 hover:bg-accent/40 hover:text-accent-foreground',
            // Orange/warning state styling
            !isWorkspaceSelected &&
              'border-orange-500/50 bg-orange-500/5 hover:border-orange-500/70 hover:bg-orange-500/10',
            triggerClassName
          )}
        >
          <span
            className={cn(
              'font-medium',
              !isWorkspaceSelected && 'text-muted-foreground'
            )}
          >
            {displayText}
          </span>
          <CaretDown
            weight="duotone"
            className="h-4 w-4 flex-shrink-0 text-muted-foreground"
          />
        </button>
      )}
    </div>
  );
}
