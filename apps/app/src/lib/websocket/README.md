# websocket connectivity for agent 3

this module provides robust websocket connectivity between the arbor app and local daemons, enabling real-time communication for workspace synchronization and task execution.

## architecture

### components

1. **ReconnectingWebSocket** - client-side websocket wrapper with:
   - automatic reconnection with exponential backoff
   - message queuing while disconnected
   - heartbeat/ping-pong mechanism
   - proper error handling and events

2. **daemon service** - server-side connection manager that:
   - tracks active daemon connections
   - manages connection lifecycle
   - handles message routing
   - monitors connection health

3. **websocket server** - standalone server that:
   - authenticates connections via tokens
   - handles websocket upgrades
   - routes messages to daemon service

### message types

```typescript
// client -> server
{ type: 'ping' }                              // heartbeat
{ type: 'get-workspace-status', payload: { workspaceId } }

// server -> client
{ type: 'pong' }                              // heartbeat response
{ type: 'connected', payload: { workspaceIds, timestamp } }
{ type: 'workspace-status', payload: { workspaceId, status } }
{ type: 'error', payload: { message } }

// daemon messages
{ type: 'heartbeat', payload: { workspaceIds } }
{ type: 'workspace-update', payload: { workspaceId, status } }
{ type: 'file-change', payload: { workspaceId, path, event } }
{ type: 'task-status', payload: { taskId, status, output, error } }
```

## usage

### starting the websocket server

```bash
# development
pnpm dev:ws

# production (with custom port)
WEBSOCKET_PORT=3002 pnpm dev:ws
```

### client-side usage

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

function MyComponent() {
  const { status, sendMessage, isConnected } = useWebSocket({
    daemonId: 'daemon-123',
    onMessage: (message) => {
      console.log('received:', message);
    },
    onConnect: () => {
      console.log('connected!');
    }
  });

  // send a message
  const handleClick = () => {
    sendMessage({ type: 'ping' });
  };

  return <div>status: {status}</div>;
}
```

### displaying connection status

```typescript
import { DaemonConnectionStatus } from '@/components/daemon/DaemonConnectionStatus';

<DaemonConnectionStatus 
  daemonId="daemon-123"
  workspaceId="workspace-456"
/>
```

## configuration

### environment variables

- `WEBSOCKET_PORT` - port for websocket server (default: 3001)
- `NEXT_PUBLIC_WEBSOCKET_URL` - custom websocket url for production

### security

- connections require authentication via token
- tokens expire after 5 minutes
- user access is verified for each daemon connection

## development notes

- websocket server runs separately from next.js
- in production, deploy websocket server as separate service
- consider using redis for multi-instance deployments
- monitor connection health via daemon heartbeats