import type { Task } from '@repo/database/types';
import { cn } from '@repo/design/lib/utils';
import { useTransitionRouter } from 'next-view-transitions';
import type React from 'react';

interface TaskItemProps {
  task: Task;
}

function TaskItem({ task }: TaskItemProps): React.ReactElement {
  const router = useTransitionRouter();

  // Mock status styling - replace with actual status logic
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'merged':
        return {
          label: 'merged',
          className:
            'bg-green-500/10 text-green-500 border border-green-500/20',
        };
      case 'running':
      case 'in_progress':
      case 'processing':
        return {
          label: 'running',
          className: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
        };
      case 'failed':
      case 'error':
        return {
          label: 'failed',
          className: 'bg-red-500/10 text-red-500 border border-red-500/20',
        };
      default:
        return {
          label: 'pending',
          className:
            'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
        };
    }
  };

  const statusInfo = getStatusInfo(task.status);

  // Mock timestamp formatting
  const formatTimestamp = (date: Date | string) => {
    const now = new Date();
    const taskDate = new Date(date);
    const diffMs = now.getTime() - taskDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}:${String(diffMinutes % 60).padStart(2, '0')} ${diffHours >= 12 ? 'PM' : 'AM'}`;
    }
    return `${diffMinutes} minutes ago`;
  };

  // Mock lines changed - replace with actual data
  const linesChanged = {
    added: Math.floor(Math.random() * 500) + 50,
    removed: Math.floor(Math.random() * 200) + 10,
  };

  return (
    <div
      className="group flex cursor-pointer items-center justify-between rounded-none border border-transparent px-4 py-3 transition-colors hover:border-border/40 hover:bg-accent/30"
      onClick={() => router.push(`/t/${task.id}`)}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Status indicator dot */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              task.status === 'running'
                ? 'bg-blue-500'
                : task.status === 'failed'
                  ? 'bg-red-500'
                  : task.status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-yellow-500'
            )}
          />
        </div>

        {/* Task content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 truncate font-medium text-foreground text-sm">
            {task.prompt}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <span>{formatTimestamp(task.createdAt)}</span>
            <span>•</span>
            <span>user/workspace-id</span>
          </div>
        </div>
      </div>

      {/* Right side - Status badge and metrics */}
      <div className="flex flex-shrink-0 items-center gap-3">
        {/* Lines changed */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-green-500">+{linesChanged.added}</span>
          <span className="text-red-500">-{linesChanged.removed}</span>
        </div>

        {/* Status badge */}
        <div
          className={cn(
            'rounded-full px-2 py-1 font-medium text-xs',
            statusInfo.className
          )}
        >
          {statusInfo.label}
        </div>
      </div>
    </div>
  );
}

export function TaskList({ tasks }: { tasks: Task[] }): React.ReactElement {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p className="text-sm">
          no tasks yet. create your first coding task above!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
