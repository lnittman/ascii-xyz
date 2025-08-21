# agent 3: task execution flow

*"orchestrate the complete flow from prompt submission to output display"*

## scope
implement the end-to-end task execution flow, connecting the code page prompt submission through the code agent to daemon execution and real-time output display.

## packages to modify
- `apps/app` - task creation, execution, and ui updates
- `packages/api` - task service enhancements

## implementation plan

### 1. task creation enhancement (apps/app)

#### update task creation hook
**file:** `apps/app/src/hooks/code/task/mutations.ts`
```typescript
import { useSWRConfig } from 'swr';
import { useTransitionRouter } from 'next-view-transitions';
import { apiRequest } from '@/utils/api';

export function useCreateTask() {
  const { mutate } = useSWRConfig();
  const router = useTransitionRouter();
  
  return {
    createTask: async ({ workspaceId, prompt }: CreateTaskInput) => {
      // create task in database
      const { data: task } = await apiRequest<Task>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          workspaceId,
          prompt,
          title: generateTaskTitle(prompt),
        }),
      });
      
      // optimistically update task list
      mutate(`/api/workspaces/${workspaceId}/tasks`);
      
      // trigger code agent execution
      executeTask(task.id, workspaceId, prompt);
      
      // navigate to task detail page
      router.push(`/t/${task.id}`);
      
      return task;
    },
  };
}

async function executeTask(taskId: string, workspaceId: string, prompt: string) {
  try {
    const response = await fetch('/api/ai/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, workspaceId, prompt }),
    });
    
    if (!response.ok) throw new Error('execution failed');
    
    // handle streaming response
    const reader = response.body?.getReader();
    if (!reader) return;
    
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      // process streaming chunks (handled by websocket in task detail)
    }
  } catch (error) {
    console.error('task execution error:', error);
    // update task status to failed
  }
}
```

### 2. task api enhancements (apps/app)

#### create task endpoint
**file:** `apps/app/src/app/api/tasks/route.ts`
```typescript
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { createTaskSchema } from '@repo/api/schemas/task';
import { successResponse, errorResponse } from '@/utils/api-response';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return errorResponse('unauthorized', 401);
  
  const user = await database.user.findUnique({
    where: { clerkId: userId },
  });
  
  if (!user) return errorResponse('user not found', 404);
  
  const body = await req.json();
  const validated = createTaskSchema.parse(body);
  
  // verify workspace ownership
  const workspace = await database.workspace.findFirst({
    where: {
      id: validated.workspaceId,
      userId: user.id,
    },
  });
  
  if (!workspace) {
    return errorResponse('workspace not found', 404);
  }
  
  // create task
  const task = await database.task.create({
    data: {
      ...validated,
      userId: user.id,
      status: 'pending',
    },
  });
  
  return successResponse(task);
}
```

#### update task execution endpoint
**file:** `apps/app/src/app/api/tasks/[id]/execute/route.ts`
```typescript
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: taskId } = await params;
  const { userId } = await auth();
  
  if (!userId) return errorResponse('unauthorized', 401);
  
  // get task with workspace
  const task = await database.task.findFirst({
    where: {
      id: taskId,
      user: { clerkId: userId },
    },
    include: { workspace: true },
  });
  
  if (!task) return errorResponse('task not found', 404);
  
  if (task.workspace.daemonStatus !== 'connected') {
    return errorResponse('daemon not connected', 400);
  }
  
  // trigger execution via code agent
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/ai/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      taskId,
      workspaceId: task.workspaceId,
      prompt: task.prompt,
    }),
  });
  
  if (!response.ok) {
    return errorResponse('execution failed', 500);
  }
  
  return successResponse({ status: 'executing' });
}
```

### 3. real-time task updates (apps/app)

#### enhance task detail with websocket
**file:** `apps/app/src/components/code/TaskDetail.tsx`
```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { Terminal } from '@repo/design/components/terminal';

export function TaskDetail({ task, workspace }: TaskDetailProps) {
  const [status, setStatus] = useState(task.status);
  const [output, setOutput] = useState(task.output || '');
  const [error, setError] = useState(task.error);
  const outputRef = useRef<HTMLDivElement>(null);
  
  const { isConnected, subscribe } = useWebSocket();
  
  useEffect(() => {
    if (!isConnected) return;
    
    // subscribe to task updates
    const unsubscribe = subscribe(`task:${task.id}`, (message) => {
      switch (message.type) {
        case 'output':
          setOutput(prev => prev + message.data);
          // auto-scroll to bottom
          if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
          }
          break;
          
        case 'status':
          setStatus(message.status);
          if (message.error) {
            setError(message.error);
          }
          break;
          
        case 'complete':
          setStatus('completed');
          // refresh task data
          mutate(`/api/tasks/${task.id}`);
          break;
      }
    });
    
    return unsubscribe;
  }, [isConnected, task.id]);
  
  return (
    <div className="h-full flex flex-col">
      {/* header with real-time status */}
      <TaskHeader task={task} status={status} workspace={workspace} />
      
      {/* main content area */}
      <div className="flex-1 flex">
        {/* task info panel */}
        <div className="w-1/3 p-6 border-r">
          <TaskInfo task={task} status={status} error={error} />
        </div>
        
        {/* terminal output */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Terminal weight="duotone" size={16} />
              output
            </h2>
          </div>
          <div 
            ref={outputRef}
            className="flex-1 overflow-y-auto bg-muted/30 p-4"
          >
            <Terminal 
              content={output}
              isStreaming={status === 'running'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4. terminal component (packages/design)

#### create terminal output component
**file:** `packages/design/components/terminal.tsx`
```typescript
import { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

interface TerminalProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export function Terminal({ content, isStreaming, className }: TerminalProps) {
  const endRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isStreaming) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [content, isStreaming]);
  
  // parse content for ansi colors
  const formattedContent = parseAnsiColors(content);
  
  return (
    <div className={cn(
      "font-mono text-xs leading-relaxed whitespace-pre-wrap",
      className
    )}>
      <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-foreground animate-pulse" />
      )}
      <div ref={endRef} />
    </div>
  );
}

function parseAnsiColors(text: string): string {
  // convert ansi escape codes to html
  return text
    .replace(/\x1b\[31m/g, '<span class="text-red-500">')
    .replace(/\x1b\[32m/g, '<span class="text-green-500">')
    .replace(/\x1b\[33m/g, '<span class="text-yellow-500">')
    .replace(/\x1b\[34m/g, '<span class="text-blue-500">')
    .replace(/\x1b\[0m/g, '</span>')
    .replace(/\n/g, '<br />');
}
```

### 5. task service enhancements (packages/api)

#### task execution service
**file:** `packages/api/services/task.ts`
```typescript
import { database } from '@repo/database';
import { WebSocket } from 'ws';

export class TaskService {
  async updateTaskOutput(taskId: string, output: string, append = true) {
    const task = await database.task.update({
      where: { id: taskId },
      data: {
        output: append ? { append: output } : output,
        updatedAt: new Date(),
      },
    });
    
    // broadcast to connected clients
    this.broadcastTaskUpdate(taskId, {
      type: 'output',
      data: output,
    });
    
    return task;
  }
  
  async updateTaskStatus(
    taskId: string, 
    status: 'running' | 'completed' | 'failed',
    error?: string
  ) {
    const data: any = {
      status,
      updatedAt: new Date(),
    };
    
    if (status === 'running') {
      data.startedAt = new Date();
    } else if (status === 'completed' || status === 'failed') {
      data.completedAt = new Date();
    }
    
    if (error) {
      data.error = error;
    }
    
    const task = await database.task.update({
      where: { id: taskId },
      data,
    });
    
    // broadcast status update
    this.broadcastTaskUpdate(taskId, {
      type: 'status',
      status,
      error,
    });
    
    return task;
  }
  
  private broadcastTaskUpdate(taskId: string, message: any) {
    // send to all connected websocket clients watching this task
    // implementation depends on websocket infrastructure
  }
}

export const taskService = new TaskService();
```

### 6. prompt parsing utilities

#### task title generation
**file:** `packages/api/utils/task-utils.ts`
```typescript
export function generateTaskTitle(prompt: string): string {
  // extract meaningful title from prompt
  const firstLine = prompt.split('\n')[0];
  
  // common patterns
  if (firstLine.match(/^(create|build|make|generate)/i)) {
    return firstLine.toLowerCase().substring(0, 50);
  }
  
  if (firstLine.match(/^(fix|debug|solve|resolve)/i)) {
    return `fix: ${firstLine.substring(4, 50).toLowerCase()}`;
  }
  
  if (firstLine.match(/^(add|implement|update)/i)) {
    return firstLine.toLowerCase().substring(0, 50);
  }
  
  // default: first 50 chars
  return firstLine.substring(0, 50).toLowerCase();
}

export function parseCommandFromPrompt(prompt: string): {
  command?: string;
  description: string;
} {
  // detect direct commands
  const codeBlockMatch = prompt.match(/```(?:bash|sh|shell)?\n(.*?)\n```/s);
  if (codeBlockMatch) {
    return {
      command: codeBlockMatch[1].trim(),
      description: prompt.replace(codeBlockMatch[0], '').trim(),
    };
  }
  
  return { description: prompt };
}
```

## testing strategy

### unit tests
- task creation flow
- title generation
- ansi color parsing

### integration tests
- full execution flow
- real-time updates
- error handling

### e2e tests
- submit prompt → see output
- task status updates
- terminal scrolling

## user experience enhancements

### loading states
```typescript
// show skeleton while task loads
// pulse animation during execution
// success/error states
```

### keyboard shortcuts
```typescript
// cmd+k: focus prompt
// cmd+enter: submit
// esc: cancel execution
```

### mobile responsiveness
```typescript
// stack panels on mobile
// swipe between info/output
// touch-friendly controls
```

## success metrics
- < 500ms from submit to navigation
- real-time output with < 100ms delay
- smooth scrolling during output
- clear error messages

## dependencies on other agents
- requires websocket infrastructure (agent 1)
- requires code agent tools (agent 2)
- enables advanced features (agent 4)

## estimated effort
- 3-4 days for core flow
- 2 days for real-time updates
- 1 day for ui polish
- 1 day for testing