'use client';

import { ScrollFadeContainer } from '@/components/shared/scroll-fade-container';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Folder,
  Play,
  Terminal,
  XCircle,
} from '@phosphor-icons/react';
import type { Task, Workspace } from '@repo/database/types';
import { Button } from '@repo/design/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';

interface TaskDetailProps {
  task: Task;
  workspace: Workspace;
}

export function TaskDetail({ task, workspace }: TaskDetailProps) {
  const [isExecuting, setIsExecuting] = useState(false);

  const statusIcon = {
    pending: <Clock weight="duotone" className="text-muted-foreground" />,
    running: <Play weight="duotone" className="text-blue-500" />,
    completed: <CheckCircle weight="duotone" className="text-green-500" />,
    failed: <XCircle weight="duotone" className="text-red-500" />,
  }[task.status];

  const statusText = {
    pending: 'pending',
    running: 'running',
    completed: 'completed',
    failed: 'failed',
  }[task.status];

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/execute`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('failed to execute task');
      }

      // todo: implement real-time updates via websocket
      window.location.reload();
    } catch (_error) {
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/code">
              <Button variant="ghost" size="sm">
                <ArrowLeft weight="duotone" size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="font-medium text-lg">{task.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Folder weight="duotone" size={14} />
                <span>{workspace.name}</span>
                {workspace.localPath && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-xs">
                      {workspace.localPath}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {statusIcon}
              <span className="text-sm">{statusText}</span>
            </div>

            {task.status === 'pending' && (
              <Button onClick={handleExecute} disabled={isExecuting} size="sm">
                {isExecuting ? (
                  <>
                    <Clock
                      weight="duotone"
                      size={16}
                      className="mr-2 animate-spin"
                    />
                    executing...
                  </>
                ) : (
                  <>
                    <Play weight="duotone" size={16} className="mr-2" />
                    execute
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* task content */}
      <div className="flex flex-1 overflow-hidden">
        {/* main content */}
        <ScrollFadeContainer className="flex-1">
          <div className="p-6">
            <div className="max-w-3xl space-y-6">
              {/* description */}
              <div>
                <h2 className="mb-2 font-medium text-sm">description</h2>
                <p className="whitespace-pre-wrap text-muted-foreground text-sm">
                  {task.description || 'no description provided'}
                </p>
              </div>

              {/* metadata */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="mb-2 font-medium text-sm">created</h3>
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium text-sm">last updated</h3>
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>

              {/* execution details */}
              {(task.startedAt || task.completedAt) && (
                <div className="space-y-4">
                  <h2 className="font-medium text-sm">execution details</h2>

                  {task.startedAt && (
                    <div>
                      <h3 className="mb-1 font-medium text-sm">started</h3>
                      <p className="text-muted-foreground text-sm">
                        {format(
                          new Date(task.startedAt),
                          'MMM d, yyyy h:mm:ss a'
                        )}
                      </p>
                    </div>
                  )}

                  {task.completedAt && (
                    <div>
                      <h3 className="mb-1 font-medium text-sm">completed</h3>
                      <p className="text-muted-foreground text-sm">
                        {format(
                          new Date(task.completedAt),
                          'MMM d, yyyy h:mm:ss a'
                        )}
                      </p>
                    </div>
                  )}

                  {task.startedAt && task.completedAt && (
                    <div>
                      <h3 className="mb-1 font-medium text-sm">duration</h3>
                      <p className="text-muted-foreground text-sm">
                        {formatDuration(
                          new Date(task.completedAt).getTime() -
                            new Date(task.startedAt).getTime()
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* error info */}
              {task.error && (
                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950">
                  <h3 className="mb-2 font-medium text-red-800 text-sm dark:text-red-200">
                    error details
                  </h3>
                  <pre className="whitespace-pre-wrap text-red-700 text-xs dark:text-red-300">
                    {task.error}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </ScrollFadeContainer>

        {/* output panel */}
        {task.output && (
          <div className="flex w-1/2 flex-col border-l">
            <div className="border-b p-4">
              <h2 className="flex items-center gap-2 font-medium text-sm">
                <Terminal weight="duotone" size={16} />
                output
              </h2>
            </div>
            <ScrollFadeContainer
              className="flex-1 bg-muted/30"
              fadeColor="var(--muted/30)"
            >
              <div className="p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs">
                  {task.output}
                </pre>
              </div>
            </ScrollFadeContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}
