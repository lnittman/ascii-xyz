# agent 3: workspace integration specialist
*"bridging cloud and local development"*

## scope

this agent polishes the daemon connectivity and task execution flow to create a seamless bridge between the cloud-based ai chat and local development environments. the goal is reliable, secure workspace management with instant code execution that feels magical.

## packages to modify

- `apps/daemon` - connection stability, error recovery, security
- `apps/app` - workspace ui, connection status, task monitoring
- `packages/api/services/workspace.ts` - connection management
- `packages/api/services/task.ts` - execution flow improvements

## implementation details

### 1. robust daemon connectivity

#### a. websocket connection manager
```typescript
// apps/daemon/src/connection/WebSocketManager.ts
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  async connect(workspaceId: string, daemonToken: string) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/workspaces/ws`;
    
    this.ws = new WebSocket(url, {
      headers: {
        'x-workspace-id': workspaceId,
        'x-daemon-token': daemonToken
      }
    });
    
    this.ws.on('open', () => {
      console.log('daemon connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    });
    
    this.ws.on('close', () => {
      this.handleDisconnect();
    });
    
    this.ws.on('error', (error) => {
      console.error('websocket error:', error);
      this.handleDisconnect();
    });
    
    this.ws.on('message', (data) => {
      this.handleMessage(JSON.parse(data.toString()));
    });
  }
  
  private handleDisconnect() {
    this.stopHeartbeat();
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
      console.log(`reconnecting in ${delay}ms...`);
      
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect(this.workspaceId, this.daemonToken);
      }, delay);
    } else {
      console.error('max reconnection attempts reached');
      this.emit('connection-failed');
    }
  }
  
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000); // 30 seconds
  }
}
```

#### b. connection status ui
```typescript
// apps/app/src/components/code/WorkspaceConnectionStatus.tsx
export function WorkspaceConnectionStatus({ 
  workspaceId 
}: { 
  workspaceId: string 
}) {
  const { status, lastHeartbeat } = useWorkspaceStatus(workspaceId);
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <div 
        className={cn(
          "w-2 h-2 rounded-full",
          status === 'connected' && "bg-green-500",
          status === 'disconnected' && "bg-red-500",
          status === 'syncing' && "bg-yellow-500 animate-pulse"
        )}
      />
      <span className="text-muted-foreground">
        {status === 'connected' && 'daemon connected'}
        {status === 'disconnected' && 'daemon offline'}
        {status === 'syncing' && 'syncing...'}
      </span>
      {lastHeartbeat && (
        <span className="text-xs">
          last seen {formatRelativeTime(lastHeartbeat)}
        </span>
      )}
    </div>
  );
}
```

### 2. enhanced task execution

#### a. task queue system
```typescript
// packages/api/services/task.ts
export class TaskService {
  private queues = new Map<string, TaskQueue>();
  
  async createTask(data: CreateTaskData): Promise<Task> {
    const task = await database.task.create({
      data: {
        ...data,
        status: 'pending'
      }
    });
    
    // add to workspace-specific queue
    const queue = this.getOrCreateQueue(data.workspaceId);
    await queue.enqueue(task);
    
    return task;
  }
  
  private getOrCreateQueue(workspaceId: string): TaskQueue {
    if (!this.queues.has(workspaceId)) {
      this.queues.set(workspaceId, new TaskQueue({
        workspaceId,
        concurrency: 3, // parallel execution limit
        onTaskComplete: (task) => this.handleTaskComplete(task),
        onTaskError: (task, error) => this.handleTaskError(task, error)
      }));
    }
    return this.queues.get(workspaceId)!;
  }
}

class TaskQueue {
  private queue: Task[] = [];
  private running = 0;
  
  async enqueue(task: Task) {
    this.queue.push(task);
    this.processNext();
  }
  
  private async processNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    const task = this.queue.shift()!;
    this.running++;
    
    try {
      await this.executeTask(task);
    } finally {
      this.running--;
      this.processNext();
    }
  }
}
```

#### b. real-time task monitoring
```typescript
// apps/app/src/components/code/TaskMonitor.tsx
export function TaskMonitor({ workspaceId }: { workspaceId: string }) {
  const { tasks, isLoading } = useWorkspaceTasks(workspaceId);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div 
          key={task.id}
          className="border rounded-lg p-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TaskStatusIcon status={task.status} />
              <span className="font-mono text-sm">{task.title}</span>
            </div>
            
            <button
              onClick={() => {
                const next = new Set(expandedTasks);
                if (next.has(task.id)) {
                  next.delete(task.id);
                } else {
                  next.add(task.id);
                }
                setExpandedTasks(next);
              }}
              className="text-xs"
            >
              {expandedTasks.has(task.id) ? 'collapse' : 'expand'}
            </button>
          </div>
          
          {expandedTasks.has(task.id) && (
            <div className="mt-2 space-y-2">
              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                {task.prompt}
              </pre>
              
              {task.output && (
                <div className="text-sm">
                  <div className="text-muted-foreground mb-1">output:</div>
                  <pre className="bg-muted p-2 rounded overflow-x-auto">
                    {task.output}
                  </pre>
                </div>
              )}
              
              {task.error && (
                <div className="text-sm text-red-500">
                  <div className="mb-1">error:</div>
                  <pre className="bg-red-500/10 p-2 rounded">
                    {task.error}
                  </pre>
                </div>
              )}
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>created {formatRelativeTime(task.createdAt)}</span>
                {task.completedAt && (
                  <span>
                    completed in {getDuration(task.startedAt!, task.completedAt)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 3. secure code execution

#### a. sandboxed execution environment
```typescript
// apps/daemon/src/execution/Sandbox.ts
import { VM } from 'vm2';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class Sandbox {
  private allowedCommands = new Set([
    'ls', 'pwd', 'echo', 'cat', 'grep', 'find',
    'git', 'npm', 'pnpm', 'yarn', 'node', 'python'
  ]);
  
  async executeCommand(command: string, cwd: string): Promise<ExecutionResult> {
    // validate command
    const cmd = command.trim().split(' ')[0];
    if (!this.allowedCommands.has(cmd)) {
      throw new Error(`command '${cmd}' not allowed`);
    }
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout: 30000, // 30 seconds max
        maxBuffer: 1024 * 1024 * 10, // 10MB max output
        env: {
          ...process.env,
          NODE_ENV: 'development'
        }
      });
      
      return {
        success: true,
        stdout,
        stderr,
        exitCode: 0
      };
    } catch (error: any) {
      return {
        success: false,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1
      };
    }
  }
  
  async executeCode(code: string, language: string): Promise<ExecutionResult> {
    if (language === 'javascript' || language === 'typescript') {
      const vm = new VM({
        timeout: 5000,
        sandbox: {
          console: {
            log: (...args: any[]) => this.output.push(args.join(' '))
          }
        }
      });
      
      try {
        const result = vm.run(code);
        return {
          success: true,
          stdout: this.output.join('\n'),
          stderr: '',
          result
        };
      } catch (error: any) {
        return {
          success: false,
          stdout: this.output.join('\n'),
          stderr: error.message,
          exitCode: 1
        };
      }
    }
    
    // other languages...
  }
}
```

#### b. permission system
```typescript
// apps/daemon/src/security/Permissions.ts
export class PermissionManager {
  private allowedPaths: string[] = [];
  
  constructor(private workspacePath: string) {
    this.allowedPaths = [
      workspacePath,
      path.join(workspacePath, 'node_modules'),
      '/tmp'
    ];
  }
  
  canAccessPath(requestedPath: string): boolean {
    const resolved = path.resolve(requestedPath);
    return this.allowedPaths.some(allowed => 
      resolved.startsWith(path.resolve(allowed))
    );
  }
  
  canExecuteFile(filePath: string): boolean {
    if (!this.canAccessPath(filePath)) return false;
    
    const ext = path.extname(filePath);
    const allowedExtensions = ['.js', '.ts', '.py', '.sh'];
    
    return allowedExtensions.includes(ext);
  }
}
```

### 4. workspace file management

#### a. file watcher integration
```typescript
// apps/daemon/src/files/FileWatcher.ts
import chokidar from 'chokidar';

export class FileWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  
  watch(workspacePath: string, onChange: (event: FileEvent) => void) {
    this.watcher = chokidar.watch(workspacePath, {
      ignored: [
        /(^|[\/\\])\../, // hidden files
        /node_modules/,
        /dist/,
        /build/
      ],
      persistent: true,
      ignoreInitial: true
    });
    
    this.watcher
      .on('add', path => onChange({ type: 'add', path }))
      .on('change', path => onChange({ type: 'change', path }))
      .on('unlink', path => onChange({ type: 'delete', path }));
  }
  
  stop() {
    this.watcher?.close();
  }
}
```

#### b. file browser ui
```typescript
// apps/app/src/components/code/FileBrowser.tsx
export function FileBrowser({ workspaceId }: { workspaceId: string }) {
  const { files, isLoading } = useWorkspaceFiles(workspaceId);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const renderTree = (items: FileTreeItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.path} style={{ marginLeft: level * 16 }}>
        <button
          onClick={() => {
            if (item.type === 'file') {
              setSelectedFile(item.path);
            }
          }}
          className={cn(
            "flex items-center gap-2 py-1 px-2 w-full text-left hover:bg-muted/50",
            selectedFile === item.path && "bg-muted"
          )}
        >
          {item.type === 'directory' ? (
            <Folder className="w-4 h-4" />
          ) : (
            <File className="w-4 h-4" />
          )}
          <span className="text-sm truncate">{item.name}</span>
        </button>
        
        {item.type === 'directory' && item.children && (
          <div>{renderTree(item.children, level + 1)}</div>
        )}
      </div>
    ));
  };
  
  return (
    <div className="h-full overflow-auto">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        renderTree(files)
      )}
    </div>
  );
}
```

### 5. ai-powered code actions

#### a. code agent integration
```typescript
// apps/app/src/app/api/workspaces/[id]/ai-action/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { action, context } = await request.json();
  
  const task = await taskService.createTask({
    workspaceId: params.id,
    title: action,
    prompt: generatePromptForAction(action, context),
    userId: user.id
  });
  
  // stream task updates
  return new Response(
    new ReadableStream({
      async start(controller) {
        const interval = setInterval(async () => {
          const updated = await taskService.getById(task.id);
          
          controller.enqueue(
            `data: ${JSON.stringify(updated)}\n\n`
          );
          
          if (updated.status === 'completed' || updated.status === 'failed') {
            clearInterval(interval);
            controller.close();
          }
        }, 1000);
      }
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    }
  );
}
```

## dependencies

- none - can run independently
- coordinates with agent 5 for error handling patterns

## testing strategy

### unit tests
- websocket reconnection logic
- task queue processing
- sandbox security
- permission validation

### integration tests
- full daemon connection flow
- task execution pipeline
- file watching and sync

### e2e tests
- connect daemon → execute task → see results
- disconnect → reconnect → resume work
- file changes → ui updates

## security considerations

- validate all daemon tokens
- sandbox all code execution
- restrict file system access
- audit command execution
- rate limit task creation
- encrypt daemon-cloud communication

## effort estimate

**6-8 developer days**

### breakdown:
- day 1-2: websocket connection stability
- day 2-3: task queue and monitoring
- day 3-4: secure execution environment
- day 4-5: file management system
- day 5-6: ai-powered actions
- day 6-8: testing and security hardening

## success metrics

- [ ] 99.9% daemon uptime
- [ ] <100ms reconnection time
- [ ] zero code execution escapes
- [ ] real-time file sync
- [ ] task completion rate >95%
- [ ] <2s task start latency
- [ ] graceful offline mode