'use client';

import {
  Circle,
  Desktop,
  MagnifyingGlass,
  Plus,
  Trash,
} from '@phosphor-icons/react';
import { useTransitionRouter } from 'next-view-transitions';
import { useState } from 'react';

import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { cn } from '@repo/design/lib/utils';

import { useDeleteWorkspace } from '@/hooks/code/workspace/mutations';
import { useWorkspaces } from '@/hooks/code/workspace/queries';
import type { Workspace } from '@repo/database/types';

interface WorkspacesTabProps {
  initialWorkspaces?: Workspace[];
}

export function WorkspacesTab({ initialWorkspaces }: WorkspacesTabProps) {
  const [search, setSearch] = useState('');
  const router = useTransitionRouter();

  const { workspaces, isLoading } = useWorkspaces(initialWorkspaces);
  const { deleteWorkspace } = useDeleteWorkspace();

  const filteredWorkspaces =
    workspaces?.filter((workspace: any) =>
      workspace.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (confirm('Are you sure you want to delete this workspace?')) {
      await deleteWorkspace(workspaceId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create new workspace */}
      <Button
        onClick={() => router.push('/code/settings/workspaces/create')}
        className="w-full rounded-none"
      >
        <Plus className="mr-2 h-4 w-4" weight="duotone" />
        create new workspace
      </Button>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlass
          className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground"
          weight="duotone"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search workspaces"
          className="rounded-none pl-10"
        />
      </div>

      {/* Workspaces list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            loading workspaces...
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {search ? 'no workspaces found' : 'no workspaces yet'}
          </div>
        ) : (
          filteredWorkspaces.map((workspace: any) => (
            <div
              key={workspace.id}
              className={cn(
                'flex items-center justify-between rounded-none border border-border/20 p-3',
                'transition-colors hover:bg-accent/50'
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground">
                    {workspace.name}
                  </h4>
                  <Desktop
                    weight="duotone"
                    className="h-3.5 w-3.5 text-muted-foreground"
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
                <p className="text-muted-foreground text-sm">
                  {workspace.localPath ? (
                    <span className="font-mono text-xs">
                      {workspace.localPath}
                    </span>
                  ) : (
                    <span>
                      created{' '}
                      {new Date(workspace.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteWorkspace(workspace.id)}
                className="rounded-none text-red-500/70 transition-all duration-300 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash className="h-4 w-4" weight="duotone" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
