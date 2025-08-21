import { and, db, eq, inArray, schema } from '@repo/database';
import WebSocket from 'ws';
import { badRequest } from './lib/errors';

interface DaemonConnection {
  ws: WebSocket;
  daemonId: string;
  workspaceIds: string[];
  lastPing: Date;
}

export class DaemonService {
  private connections: Map<string, DaemonConnection> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    // start monitoring connections every 30 seconds
    this.startConnectionMonitoring();
  }

  /**
   * Register a new daemon connection
   */
  registerConnection(daemonId: string, ws: WebSocket): void {
    const connection: DaemonConnection = {
      ws,
      daemonId,
      workspaceIds: [],
      lastPing: new Date(),
    };

    this.connections.set(daemonId, connection);

    // set up event handlers
    ws.on('pong', () => {
      connection.lastPing = new Date();
    });

    ws.on('close', () => {
      this.unregisterConnection(daemonId);
    });

    ws.on('error', (_error) => {
      this.unregisterConnection(daemonId);
    });
  }

  /**
   * Unregister a daemon connection
   */
  unregisterConnection(daemonId: string): void {
    const connection = this.connections.get(daemonId);
    if (connection) {
      // close websocket if still open
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.close();
      }

      // mark all associated workspaces as disconnected
      this.markWorkspacesDisconnected(connection.workspaceIds);

      this.connections.delete(daemonId);
    }
  }

  /**
   * Send a message to a specific daemon
   */
  sendMessage(daemonId: string, message: any): void {
    const connection = this.connections.get(daemonId);
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
    } else {
      throw badRequest('Daemon not connected');
    }
  }

  /**
   * Broadcast a message to all daemons managing specific workspaces
   */
  broadcastToWorkspaces(workspaceIds: string[], message: any): void {
    for (const [_daemonId, connection] of this.connections) {
      const hasWorkspace = connection.workspaceIds.some((id) =>
        workspaceIds.includes(id)
      );
      if (hasWorkspace && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Update workspaces managed by a daemon
   */
  updateDaemonWorkspaces(daemonId: string, workspaceIds: string[]): void {
    const connection = this.connections.get(daemonId);
    if (connection) {
      connection.workspaceIds = workspaceIds;
    }
  }

  /**
   * Get connection status for a daemon
   */
  getConnectionStatus(daemonId: string): boolean {
    const connection = this.connections.get(daemonId);
    return connection ? connection.ws.readyState === WebSocket.OPEN : false;
  }

  /**
   * Get all active daemon IDs
   */
  getActiveDaemons(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Start monitoring connections for health
   */
  private startConnectionMonitoring(): void {
    this.pingInterval = setInterval(() => {
      const now = new Date();
      const staleTimeout = 60000; // 60 seconds

      for (const [daemonId, connection] of this.connections) {
        // check if connection is stale
        if (now.getTime() - connection.lastPing.getTime() > staleTimeout) {
          this.unregisterConnection(daemonId);
          continue;
        }

        // send ping to active connections
        if (connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.ping();
        }
      }
    }, 30000); // every 30 seconds
  }

  /**
   * Mark workspaces as disconnected in database
   */
  private async markWorkspacesDisconnected(
    workspaceIds: string[]
  ): Promise<void> {
    if (workspaceIds.length === 0) {
      return;
    }

    try {
      await db
        .update(schema.workspaces)
        .set({
          daemonStatus: 'disconnected',
          lastDaemonHeartbeat: new Date(),
        })
        .where(inArray(schema.workspaces.id, workspaceIds));
    } catch (_error) {}
  }

  /**
   * Verify user has access to a daemon
   */
  async verifyUserAccess(userId: string, daemonId: string): Promise<boolean> {
    try {
      // check if user owns any workspace connected to this daemon
      const [workspace] = await db
        .select()
        .from(schema.workspaces)
        .where(
          and(
            eq(schema.workspaces.userId, userId),
            eq(schema.workspaces.daemonId, daemonId)
          )
        )
        .limit(1);

      return !!workspace;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Stop the service (cleanup)
   */
  stop(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // close all connections
    for (const [daemonId] of this.connections) {
      this.unregisterConnection(daemonId);
    }
  }
}

// export singleton instance
export const daemonService = new DaemonService();
