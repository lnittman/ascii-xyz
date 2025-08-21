import { createServer } from 'node:http';
import { daemonService } from '@repo/services/daemon';
import { type WebSocket, WebSocketServer } from 'ws';

export function createWebSocketServer(port = 3001) {
  const server = createServer();
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req) => {
    // extract token from query params
    const url = new URL(req.url || '', `http://localhost:${port}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'token required');
      return;
    }

    // decode and validate token
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const { userId, daemonId, expiresAt } = decoded;

      // check expiration
      if (Date.now() > expiresAt) {
        ws.close(1008, 'token expired');
        return;
      }

      // register connection with daemon service
      daemonService.registerConnection(daemonId, ws as any);

      // handle messages
      ws.on('message', async (data) => {
        try {
          const _message = JSON.parse(data.toString());
          // TODO: Handle incoming messages from daemon
        } catch (_error) {
          ws.send(
            JSON.stringify({
              type: 'error',
              payload: { message: 'invalid message format' },
            })
          );
        }
      });

      // handle errors
      ws.on('error', (_error) => {});

      // handle disconnect
      ws.on('close', () => {
        daemonService.unregisterConnection(daemonId);
      });
    } catch (_error) {
      ws.close(1008, 'invalid token');
    }
  });

  server.listen(port, () => {});

  return { server, wss };
}

// graceful shutdown
export function shutdownWebSocketServer(
  server: ReturnType<typeof createServer>,
  wss: WebSocketServer
) {
  return new Promise<void>((resolve) => {
    wss.clients.forEach((client) => {
      client.close();
    });

    server.close(() => {
      resolve();
    });
  });
}
