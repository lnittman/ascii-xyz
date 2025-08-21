import { createWebSocketServer, shutdownWebSocketServer } from './server';

const PORT = process.env.WS_PORT ? Number.parseInt(process.env.WS_PORT) : 8080;

// start the server
const { server, wss } = createWebSocketServer(PORT);

// handle graceful shutdown
process.on('SIGINT', async () => {
  await shutdownWebSocketServer(server, wss);
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdownWebSocketServer(server, wss);
  process.exit(0);
});
