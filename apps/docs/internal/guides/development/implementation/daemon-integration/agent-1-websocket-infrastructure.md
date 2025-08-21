# agent 1: websocket infrastructure

*"establish real-time communication between daemon and web app"*

## scope
build the websocket infrastructure for bidirectional communication between the arbor daemon and web application, enabling real-time command execution and output streaming.

## packages to modify
- `apps/app` - websocket server and client integration
- `apps/daemon` - websocket client in tauri app
- `packages/api` - shared types and utilities

## implementation plan

### 1. websocket server setup (apps/app)

#### create websocket handler
**file:** `apps/app/src/app/api/ws/route.ts`
```typescript
import { createWebSocketHandler } from '@/utils/websocket';
import { auth } from '@repo/auth/server';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('unauthorized', { status: 401 });
  
  return createWebSocketHandler(req, {
    onConnection: (ws, daemonId) => {
      // register daemon connection
      // update workspace status
    },
    onMessage: (ws, message) => {
      // handle daemon messages
      // command output, status updates, etc
    },
    onClose: (ws, daemonId) => {
      // mark daemon as disconnected
    }
  });
}
```

#### websocket utilities
**file:** `apps/app/src/utils/websocket.ts`
```typescript
import { WebSocketServer } from 'ws';
import { database } from '@repo/database';

interface WebSocketMessage {
  type: 'auth' | 'command' | 'output' | 'status' | 'heartbeat';
  daemonId?: string;
  workspaceId?: string;
  taskId?: string;
  data: any;
}

export function createWebSocketHandler(req: Request, handlers: {
  onConnection: (ws: WebSocket, daemonId: string) => void;
  onMessage: (ws: WebSocket, message: WebSocketMessage) => void;
  onClose: (ws: WebSocket, daemonId: string) => void;
}) {
  // upgrade http connection to websocket
  // handle authentication via initial message
  // manage connection lifecycle
}
```

### 2. daemon websocket client (apps/daemon)

#### add websocket plugin to tauri
**file:** `apps/daemon/src-tauri/Cargo.toml`
```toml
[dependencies]
tauri-plugin-websocket = "2.0.0"
tokio-tungstenite = "0.20"
futures-util = "0.3"
```

#### implement websocket manager
**file:** `apps/daemon/src-tauri/src/websocket.rs`
```rust
use tokio_tungstenite::{connect_async, WebSocketStream};
use futures_util::{StreamExt, SinkExt};

pub struct WebSocketManager {
    url: String,
    auth_token: String,
    daemon_id: String,
}

impl WebSocketManager {
    pub async fn connect(&self) -> Result<(), Error> {
        // establish websocket connection
        // send auth message
        // handle reconnection logic
    }
    
    pub async fn send_output(&self, task_id: &str, output: &str) {
        // stream command output to server
    }
    
    pub async fn update_status(&self, task_id: &str, status: &str) {
        // send task status updates
    }
}
```

#### integrate with main daemon
**file:** `apps/daemon/src-tauri/src/main.rs`
```rust
#[tauri::command]
async fn connect_websocket(
    auth_token: String,
    daemon_id: String,
    state: tauri::State<AppState>
) -> Result<(), String> {
    let ws_manager = WebSocketManager::new(
        "wss://localhost:4000/api/ws",
        auth_token,
        daemon_id
    );
    
    ws_manager.connect().await
        .map_err(|e| e.to_string())?;
    
    state.set_websocket(ws_manager);
    Ok(())
}
```

### 3. frontend websocket integration (apps/app)

#### websocket hook
**file:** `apps/app/src/hooks/use-websocket.ts`
```typescript
import { useEffect, useState, useCallback } from 'react';

export function useWebSocket(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const websocket = new WebSocket(url);
    
    websocket.onopen = () => {
      setIsConnected(true);
      // send auth token
    };
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // handle different message types
    };
    
    websocket.onclose = () => {
      setIsConnected(false);
      // implement reconnection
    };
    
    setWs(websocket);
    
    return () => websocket.close();
  }, [url]);
  
  const send = useCallback((message: any) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, [ws]);
  
  return { isConnected, send };
}
```

#### task detail real-time updates
**file:** `apps/app/src/components/code/TaskDetail.tsx`
```typescript
export function TaskDetail({ task, workspace }: TaskDetailProps) {
  const { isConnected } = useWebSocket(`/api/ws?workspaceId=${workspace.id}`);
  const [liveOutput, setLiveOutput] = useState(task.output || '');
  
  useEffect(() => {
    // subscribe to task updates
    // update liveOutput as messages arrive
  }, [task.id]);
  
  return (
    // existing ui with real-time output display
  );
}
```

### 4. shared types (packages/api)

#### websocket message types
**file:** `packages/api/types/websocket.ts`
```typescript
export interface DaemonAuthMessage {
  type: 'auth';
  daemonId: string;
  authToken: string;
}

export interface CommandMessage {
  type: 'command';
  taskId: string;
  command: string;
  args: string[];
  cwd: string;
}

export interface OutputMessage {
  type: 'output';
  taskId: string;
  output: string;
  isError: boolean;
}

export interface StatusMessage {
  type: 'status';
  taskId: string;
  status: 'running' | 'completed' | 'failed';
  error?: string;
}

export type WebSocketMessage = 
  | DaemonAuthMessage 
  | CommandMessage 
  | OutputMessage 
  | StatusMessage;
```

## testing strategy

### unit tests
- websocket message parsing and validation
- connection/reconnection logic
- auth token verification

### integration tests
- end-to-end message flow
- multiple daemon connections
- connection failure scenarios

### manual testing
- daemon connects and maintains connection
- output streams in real-time
- graceful disconnection handling

## deployment considerations

### environment variables
```env
# apps/app
WEBSOCKET_PORT=3001
WEBSOCKET_PATH=/api/ws

# apps/daemon
NEXT_PUBLIC_WS_URL=wss://app.arbor.xyz/api/ws
```

### production setup
- use proper wss:// with ssl certificates
- implement rate limiting
- add connection pooling
- monitor websocket health

## security considerations

1. **authentication**
   - verify auth token on connection
   - validate daemon id matches workspace

2. **message validation**
   - sanitize all incoming messages
   - prevent command injection
   - limit message size

3. **connection limits**
   - one daemon per workspace
   - timeout idle connections
   - prevent dos attacks

## success metrics
- daemon maintains stable connection
- < 100ms latency for messages
- automatic reconnection works
- no memory leaks over time

## dependencies on other agents
- requires daemon to have auth token (existing)
- needs task creation api (existing)
- will enable agent 2's command execution

## estimated effort
- 3-4 days for core implementation
- 1-2 days for testing
- 1 day for production hardening