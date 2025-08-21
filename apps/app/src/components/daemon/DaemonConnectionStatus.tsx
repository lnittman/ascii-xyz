'use client';

import { useWebSocket } from '@/hooks/useWebSocket';
import { cn } from '@repo/design/lib/utils';

interface DaemonConnectionStatusProps {
  daemonId: string;
  className?: string;
}

export function DaemonConnectionStatus({
  daemonId,
  className,
}: DaemonConnectionStatusProps) {
  const { status } = useWebSocket({ daemonId });

  const statusConfig = {
    connected: {
      label: 'connected',
      className: 'bg-green-500',
      dotClassName: 'bg-green-400 animate-pulse',
    },
    connecting: {
      label: 'connecting',
      className: 'bg-yellow-500',
      dotClassName: 'bg-yellow-400 animate-pulse',
    },
    disconnected: {
      label: 'disconnected',
      className: 'bg-red-500',
      dotClassName: 'bg-red-400',
    },
    error: {
      label: 'error',
      className: 'bg-red-600',
      dotClassName: 'bg-red-500',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className={cn('h-2 w-2 rounded-full', config.className)} />
        <div
          className={cn(
            'absolute inset-0 h-2 w-2 rounded-full',
            config.dotClassName
          )}
        />
      </div>
      <span className="text-muted-foreground text-xs">{config.label}</span>
    </div>
  );
}
