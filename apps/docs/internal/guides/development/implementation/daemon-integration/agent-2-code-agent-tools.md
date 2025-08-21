# agent 2: code agent tools implementation

*"equip the code agent with powerful local development capabilities"*

## scope
enhance the mastra code agent with a comprehensive tool suite for executing commands, manipulating files, and interacting with git repositories through the daemon.

## packages to modify
- `apps/ai` - code agent and tool definitions
- `apps/app` - api endpoint for code agent
- `packages/api` - shared services and types

## implementation plan

### 1. code agent api endpoint (apps/app)

#### create code agent route
**file:** `apps/app/src/app/api/ai/code/route.ts`
```typescript
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { streamCodeAgent } from '@repo/api/services/mastra';
import { z } from 'zod';

const requestSchema = z.object({
  taskId: z.string().uuid(),
  prompt: z.string(),
  workspaceId: z.string().uuid(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return errorResponse('unauthorized', 401);
  
  const body = await req.json();
  const { taskId, prompt, workspaceId } = requestSchema.parse(body);
  
  // verify workspace ownership and daemon connection
  const workspace = await database.workspace.findFirst({
    where: {
      id: workspaceId,
      user: { clerkId: userId },
      connectionType: 'daemon',
      daemonStatus: 'connected',
    },
  });
  
  if (!workspace) {
    return errorResponse('workspace not found or disconnected', 404);
  }
  
  // update task status
  await database.task.update({
    where: { id: taskId },
    data: { 
      status: 'running',
      startedAt: new Date(),
    },
  });
  
  // stream agent response
  const stream = await streamCodeAgent({
    prompt,
    context: {
      workspaceId,
      taskId,
      localPath: workspace.localPath!,
      daemonId: workspace.daemonId!,
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 2. code agent enhancement (apps/ai)

#### update agent configuration
**file:** `apps/ai/src/mastra/agents/code/index.ts`
```typescript
import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { loadPrompt } from "../../utils/loadPrompt";
import { 
  executeCommandTool,
  readFileTool,
  writeFileTool,
  listDirectoryTool,
  gitOperationsTool,
  searchFilesTool,
} from "../../tools/code-tools";

const instructions = loadPrompt("agents/code/instructions.xml", "", {
  toolsDir: "tools",
  rootDir: process.cwd(),
});

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const codeAgent = new Agent({
  instructions: instructions,
  model: openRouter("anthropic/claude-3.5-sonnet"),
  name: "code",
  tools: {
    executeCommand: executeCommandTool,
    readFile: readFileTool,
    writeFile: writeFileTool,
    listDirectory: listDirectoryTool,
    gitOperations: gitOperationsTool,
    searchFiles: searchFilesTool,
  },
});
```

#### enhanced instructions
**file:** `apps/ai/src/mastra/agents/code/instructions.xml`
```xml
<instructions>
  <role>
    you are a specialized coding assistant that helps users with software development tasks
    by executing commands and manipulating files on their local machine through the arbor daemon.
  </role>
  
  <capabilities>
    - execute shell commands in the workspace directory
    - read and write files with proper error handling
    - perform git operations (status, add, commit, push)
    - search through codebases efficiently
    - provide clear explanations of actions taken
  </capabilities>
  
  <guidelines>
    - always explain what you're about to do before executing
    - use appropriate tools for each task
    - handle errors gracefully and suggest fixes
    - respect the user's existing code style
    - never execute destructive commands without confirmation
  </guidelines>
  
  <workflow>
    1. understand the user's request
    2. plan the approach
    3. execute step by step
    4. provide clear output and next steps
  </workflow>
</instructions>
```

### 3. code tools implementation (apps/ai)

#### command execution tool
**file:** `apps/ai/src/mastra/tools/code-tools/execute-command.ts`
```typescript
import { createTool } from '@mastra/core';
import { z } from 'zod';
import { sendDaemonCommand } from '../utils/daemon-client';

export const executeCommandTool = createTool({
  id: 'execute-command',
  description: 'execute a shell command in the workspace directory',
  inputSchema: z.object({
    command: z.string().describe('the command to execute'),
    args: z.array(z.string()).describe('command arguments'),
    cwd: z.string().optional().describe('working directory relative to workspace'),
  }),
  outputSchema: z.object({
    stdout: z.string(),
    stderr: z.string(),
    exitCode: z.number(),
  }),
  execute: async ({ input, context }) => {
    const { workspaceId, taskId, daemonId, localPath } = context;
    
    // send command to daemon via websocket
    const result = await sendDaemonCommand({
      daemonId,
      type: 'execute',
      payload: {
        taskId,
        command: input.command,
        args: input.args,
        cwd: input.cwd ? `${localPath}/${input.cwd}` : localPath,
      },
    });
    
    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      exitCode: result.exitCode || 0,
    };
  },
});
```

#### file operations tools
**file:** `apps/ai/src/mastra/tools/code-tools/file-operations.ts`
```typescript
export const readFileTool = createTool({
  id: 'read-file',
  description: 'read contents of a file',
  inputSchema: z.object({
    path: z.string().describe('file path relative to workspace'),
  }),
  outputSchema: z.object({
    content: z.string(),
    exists: z.boolean(),
  }),
  execute: async ({ input, context }) => {
    const result = await sendDaemonCommand({
      daemonId: context.daemonId,
      type: 'read-file',
      payload: {
        taskId: context.taskId,
        path: `${context.localPath}/${input.path}`,
      },
    });
    
    return {
      content: result.content || '',
      exists: result.exists,
    };
  },
});

export const writeFileTool = createTool({
  id: 'write-file',
  description: 'write content to a file',
  inputSchema: z.object({
    path: z.string().describe('file path relative to workspace'),
    content: z.string().describe('file content'),
    createDirs: z.boolean().optional().describe('create directories if needed'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    path: z.string(),
  }),
  execute: async ({ input, context }) => {
    const result = await sendDaemonCommand({
      daemonId: context.daemonId,
      type: 'write-file',
      payload: {
        taskId: context.taskId,
        path: `${context.localPath}/${input.path}`,
        content: input.content,
        createDirs: input.createDirs || false,
      },
    });
    
    return {
      success: result.success,
      path: input.path,
    };
  },
});
```

#### git operations tool
**file:** `apps/ai/src/mastra/tools/code-tools/git-operations.ts`
```typescript
export const gitOperationsTool = createTool({
  id: 'git-operations',
  description: 'perform git operations in the workspace',
  inputSchema: z.object({
    operation: z.enum(['status', 'add', 'commit', 'push', 'pull', 'branch', 'checkout']),
    args: z.array(z.string()).optional().describe('additional arguments'),
    message: z.string().optional().describe('commit message for commit operation'),
  }),
  outputSchema: z.object({
    output: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ input, context }) => {
    let command = 'git';
    let args = [input.operation];
    
    if (input.operation === 'commit' && input.message) {
      args.push('-m', input.message);
    } else if (input.args) {
      args.push(...input.args);
    }
    
    const result = await sendDaemonCommand({
      daemonId: context.daemonId,
      type: 'execute',
      payload: {
        taskId: context.taskId,
        command,
        args,
        cwd: context.localPath,
      },
    });
    
    return {
      output: result.stdout || result.stderr || '',
      success: result.exitCode === 0,
    };
  },
});
```

### 4. daemon command handlers (apps/daemon)

#### enhance command execution
**file:** `apps/daemon/src-tauri/src/commands.rs`
```rust
use std::process::Command;
use std::fs;
use std::path::Path;

#[tauri::command]
pub async fn handle_daemon_command(
    command_type: String,
    payload: serde_json::Value,
    state: tauri::State<AppState>,
) -> Result<serde_json::Value, String> {
    match command_type.as_str() {
        "execute" => execute_command(payload).await,
        "read-file" => read_file(payload).await,
        "write-file" => write_file(payload).await,
        "list-directory" => list_directory(payload).await,
        _ => Err("unknown command type".to_string()),
    }
}

async fn execute_command(payload: serde_json::Value) -> Result<serde_json::Value, String> {
    let command = payload["command"].as_str().ok_or("missing command")?;
    let args: Vec<String> = payload["args"]
        .as_array()
        .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
        .unwrap_or_default();
    let cwd = payload["cwd"].as_str().ok_or("missing cwd")?;
    
    // validate command is allowed
    let allowed_commands = vec!["git", "npm", "pnpm", "yarn", "node", "python", "cargo"];
    if !allowed_commands.contains(&command) {
        return Err(format!("command '{}' not allowed", command));
    }
    
    let output = Command::new(command)
        .args(&args)
        .current_dir(cwd)
        .output()
        .map_err(|e| e.to_string())?;
    
    Ok(serde_json::json!({
        "stdout": String::from_utf8_lossy(&output.stdout),
        "stderr": String::from_utf8_lossy(&output.stderr),
        "exitCode": output.status.code().unwrap_or(-1),
    }))
}
```

### 5. shared services (packages/api)

#### daemon client service
**file:** `packages/api/services/daemon-client.ts`
```typescript
import { WebSocket } from 'ws';

interface DaemonCommand {
  daemonId: string;
  type: string;
  payload: any;
}

const daemonConnections = new Map<string, WebSocket>();

export async function sendDaemonCommand(command: DaemonCommand): Promise<any> {
  const ws = daemonConnections.get(command.daemonId);
  
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('daemon not connected');
  }
  
  return new Promise((resolve, reject) => {
    const messageId = generateId();
    
    const handler = (data: any) => {
      const message = JSON.parse(data.toString());
      if (message.id === messageId) {
        ws.off('message', handler);
        if (message.error) {
          reject(new Error(message.error));
        } else {
          resolve(message.result);
        }
      }
    };
    
    ws.on('message', handler);
    
    ws.send(JSON.stringify({
      id: messageId,
      ...command,
    }));
    
    // timeout after 30 seconds
    setTimeout(() => {
      ws.off('message', handler);
      reject(new Error('command timeout'));
    }, 30000);
  });
}

export function registerDaemonConnection(daemonId: string, ws: WebSocket) {
  daemonConnections.set(daemonId, ws);
}

export function unregisterDaemonConnection(daemonId: string) {
  daemonConnections.delete(daemonId);
}
```

## testing strategy

### unit tests
- tool input/output validation
- command sanitization
- error handling

### integration tests
- end-to-end tool execution
- file operations with permissions
- git operations in test repos

### manual testing
- create test workspace
- execute various commands
- verify file changes
- test error scenarios

## security considerations

1. **command sandboxing**
   - whitelist allowed commands
   - prevent path traversal
   - sanitize all inputs

2. **file access control**
   - restrict to workspace directory
   - validate file paths
   - limit file sizes

3. **resource limits**
   - timeout long-running commands
   - limit concurrent executions
   - monitor resource usage

## success metrics
- all tools execute successfully
- < 1s latency for file operations
- proper error messages
- no security vulnerabilities

## dependencies on other agents
- requires websocket infrastructure (agent 1)
- enables task execution flow (agent 3)

## estimated effort
- 4-5 days for tool implementation
- 2 days for daemon handlers
- 2 days for testing
- 1 day for security hardening