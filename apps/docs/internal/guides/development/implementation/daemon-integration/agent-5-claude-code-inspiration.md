# agent 5: claude code inspiration

*"analyze claude code's architecture for ui/ux and functionality insights"*

## scope
research and analyze claude code's filesystem structure, configuration, and patterns to inspire arbor's task/workspace ui/ux and functionality design.

## packages to modify
- `apps/app` - ui/ux enhancements inspired by claude code
- `apps/daemon` - functionality inspired by claude code patterns

## implementation plan

### 1. claude code filesystem analysis

#### inspector tool
**file:** `apps/daemon/src-tauri/src/claude_inspector.rs`
```rust
use std::fs;
use std::path::Path;
use home::home_dir;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct ClaudeCodeConfig {
    version: String,
    settings: serde_json::Value,
    workspace_history: Vec<WorkspaceEntry>,
    model_preferences: serde_json::Value,
}

#[tauri::command]
pub async fn inspect_claude_code() -> Result<ClaudeCodeInsights, String> {
    let home = home_dir().ok_or("could not find home directory")?;
    let claude_path = home.join(".claude");
    
    if !claude_path.exists() {
        return Err("claude code not found".to_string());
    }
    
    let mut insights = ClaudeCodeInsights::default();
    
    // read claude.json config
    if let Ok(config_content) = fs::read_to_string(claude_path.join("claude.json")) {
        if let Ok(config) = serde_json::from_str::<ClaudeCodeConfig>(&config_content) {
            insights.config = Some(config);
        }
    }
    
    // analyze workspace structure
    let workspaces_path = claude_path.join("workspaces");
    if workspaces_path.exists() {
        insights.workspace_patterns = analyze_workspace_patterns(&workspaces_path)?;
    }
    
    // analyze session files
    let sessions_path = claude_path.join("sessions");
    if sessions_path.exists() {
        insights.session_structure = analyze_session_structure(&sessions_path)?;
    }
    
    Ok(insights)
}

fn analyze_workspace_patterns(path: &Path) -> Result<WorkspacePatterns, String> {
    // look for patterns in how claude organizes workspaces
    // file structure, naming conventions, metadata storage
    
    let mut patterns = WorkspacePatterns {
        naming_convention: "timestamp-based".to_string(),
        metadata_location: ".claude/workspace.json".to_string(),
        session_linking: true,
        features: vec![],
    };
    
    // analyze each workspace directory
    for entry in fs::read_dir(path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let workspace_path = entry.path();
        
        if workspace_path.is_dir() {
            // check for specific features
            if workspace_path.join(".claude/commands.log").exists() {
                patterns.features.push("command history".to_string());
            }
            if workspace_path.join(".claude/files.json").exists() {
                patterns.features.push("file tracking".to_string());
            }
            if workspace_path.join(".claude/context.md").exists() {
                patterns.features.push("context persistence".to_string());
            }
        }
    }
    
    Ok(patterns)
}
```

### 2. ui/ux patterns inspired by claude code

#### task detail enhancements
**file:** `apps/app/src/components/code/TaskDetailEnhanced.tsx`
```typescript
import { useState } from 'react';
import { 
  Terminal, 
  File, 
  GitBranch, 
  Clock,
  CaretRight,
  MagnifyingGlass 
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedTaskDetailProps {
  task: Task;
  workspace: Workspace;
}

export function EnhancedTaskDetail({ task, workspace }: EnhancedTaskDetailProps) {
  const [activePanel, setActivePanel] = useState<'terminal' | 'files' | 'context'>('terminal');
  const [commandHistory, setCommandHistory] = useState<Command[]>([]);
  const [modifiedFiles, setModifiedFiles] = useState<FileChange[]>([]);
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* header with breadcrumb navigation */}
      <div className="border-b px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/code" className="text-muted-foreground hover:text-foreground">
            workspaces
          </Link>
          <CaretRight weight="bold" size={12} className="text-muted-foreground" />
          <span className="text-muted-foreground">{workspace.name}</span>
          <CaretRight weight="bold" size={12} className="text-muted-foreground" />
          <span>{task.title}</span>
        </div>
      </div>
      
      {/* tab navigation */}
      <div className="border-b px-4">
        <div className="flex gap-6">
          {[
            { id: 'terminal', label: 'terminal', icon: Terminal },
            { id: 'files', label: 'files changed', icon: File, count: modifiedFiles.length },
            { id: 'context', label: 'context', icon: MagnifyingGlass },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id as any)}
              className={cn(
                "flex items-center gap-2 py-3 text-sm border-b-2 transition-colors",
                activePanel === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon weight="duotone" size={16} />
              <span>{tab.label}</span>
              {tab.count && tab.count > 0 && (
                <span className="bg-muted px-1.5 py-0.5 text-xs rounded-sm">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* content panels */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activePanel === 'terminal' && (
            <TerminalPanel 
              key="terminal"
              output={task.output}
              commandHistory={commandHistory}
              isRunning={task.status === 'running'}
            />
          )}
          
          {activePanel === 'files' && (
            <FilesPanel 
              key="files"
              modifiedFiles={modifiedFiles}
              workspacePath={workspace.localPath}
            />
          )}
          
          {activePanel === 'context' && (
            <ContextPanel 
              key="context"
              task={task}
              workspace={workspace}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* status bar */}
      <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock weight="duotone" size={12} />
            {formatDuration(task.startedAt, task.completedAt)}
          </span>
          <span className="flex items-center gap-1">
            <GitBranch weight="duotone" size={12} />
            {workspace.defaultBranch}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-2 h-2 rounded-full",
            task.status === 'running' ? "bg-green-500 animate-pulse" : "bg-muted"
          )} />
          <span>{task.status}</span>
        </div>
      </div>
    </div>
  );
}

// terminal panel with command history
function TerminalPanel({ output, commandHistory, isRunning }: TerminalPanelProps) {
  const [filter, setFilter] = useState('');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="h-full flex flex-col"
    >
      {/* command history sidebar */}
      <div className="flex h-full">
        <div className="w-64 border-r flex flex-col">
          <div className="p-3 border-b">
            <h3 className="text-sm font-medium mb-2">command history</h3>
            <input
              type="text"
              placeholder="filter commands..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-muted rounded-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {commandHistory
              .filter(cmd => cmd.command.includes(filter))
              .map((cmd, i) => (
                <div
                  key={i}
                  className="px-3 py-2 border-b hover:bg-muted/50 cursor-pointer"
                >
                  <div className="text-xs font-mono truncate">{cmd.command}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(cmd.timestamp, 'HH:mm:ss')}
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* terminal output */}
        <div className="flex-1 bg-zinc-900 text-zinc-100 p-4 overflow-y-auto">
          <Terminal content={output} isStreaming={isRunning} />
        </div>
      </div>
    </motion.div>
  );
}
```

### 3. workspace management patterns

#### enhanced workspace dropdown
**file:** `apps/app/src/components/code/WorkspaceDropdownEnhanced.tsx`
```typescript
export function EnhancedWorkspaceDropdown() {
  const [workspaces] = useAtom(workspacesAtom);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useAtom(currentWorkspaceIdAtom);
  const [recentTasks, setRecentTasks] = useState<Record<string, Task[]>>({});
  
  // group workspaces by connection type
  const groupedWorkspaces = workspaces.reduce((acc, ws) => {
    const type = ws.connectionType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(ws);
    return acc;
  }, {} as Record<string, Workspace[]>);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7">
          <Folder weight="duotone" size={14} className="mr-2" />
          <span className="truncate max-w-[150px]">
            {currentWorkspace?.name || 'select workspace'}
          </span>
          <CaretUpDown size={14} className="ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[320px]">
        {/* recent workspaces */}
        {recentWorkspaces.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs">recent</DropdownMenuLabel>
            {recentWorkspaces.map((ws) => (
              <WorkspaceItem 
                key={ws.id} 
                workspace={ws}
                recentTasks={recentTasks[ws.id]}
                onSelect={() => setCurrentWorkspaceId(ws.id)}
              />
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* grouped by type */}
        {Object.entries(groupedWorkspaces).map(([type, workspaces]) => (
          <div key={type}>
            <DropdownMenuLabel className="text-xs">
              {type === 'daemon' && <HardDrive weight="duotone" size={12} className="inline mr-1" />}
              {type === 'github' && <GitBranch weight="duotone" size={12} className="inline mr-1" />}
              {type}
            </DropdownMenuLabel>
            {workspaces.map((ws) => (
              <WorkspaceItem 
                key={ws.id} 
                workspace={ws}
                onSelect={() => setCurrentWorkspaceId(ws.id)}
              />
            ))}
          </div>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* actions */}
        <DropdownMenuItem asChild>
          <Link href="/code/settings/workspaces/create" className="text-xs">
            <Plus weight="duotone" size={14} className="mr-2" />
            create workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WorkspaceItem({ workspace, recentTasks, onSelect }: WorkspaceItemProps) {
  const isConnected = workspace.daemonStatus === 'connected';
  
  return (
    <DropdownMenuItem 
      onSelect={onSelect}
      className="flex flex-col items-start gap-1 py-2"
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-sm">{workspace.name}</span>
        <div className="flex items-center gap-2">
          {workspace.connectionType === 'daemon' && (
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
          )}
          {workspace.connectionType === 'github' && (
            <GitBranch weight="duotone" size={12} className="text-muted-foreground" />
          )}
        </div>
      </div>
      
      {/* recent tasks preview */}
      {recentTasks && recentTasks.length > 0 && (
        <div className="text-xs text-muted-foreground">
          last: {recentTasks[0].title}
        </div>
      )}
      
      {/* path or repo info */}
      <div className="text-xs text-muted-foreground truncate w-full">
        {workspace.localPath || workspace.repoUrl || 'no path'}
      </div>
    </DropdownMenuItem>
  );
}
```

### 4. context persistence

#### context manager
**file:** `packages/api/services/context-manager.ts`
```typescript
export class ContextManager {
  async saveTaskContext(taskId: string, context: TaskContext) {
    await database.taskContext.create({
      data: {
        taskId,
        files: context.files,
        dependencies: context.dependencies,
        environment: context.environment,
        notes: context.notes,
      },
    });
  }
  
  async getTaskContext(taskId: string): Promise<TaskContext | null> {
    return database.taskContext.findUnique({
      where: { taskId },
    });
  }
  
  async updateContext(taskId: string, updates: Partial<TaskContext>) {
    return database.taskContext.update({
      where: { taskId },
      data: updates,
    });
  }
  
  async generateContextSummary(workspaceId: string): Promise<string> {
    const recentTasks = await database.task.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { context: true },
    });
    
    // generate ai summary of recent work
    const summary = await generateSummary(recentTasks);
    
    return summary;
  }
}
```

### 5. session management

#### session tracking
**file:** `apps/app/src/hooks/use-session.ts`
```typescript
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentWorkspaceId] = useAtom(currentWorkspaceIdAtom);
  
  useEffect(() => {
    if (!currentWorkspaceId) return;
    
    // create or resume session
    async function initSession() {
      const existingSession = await getActiveSession(currentWorkspaceId);
      
      if (existingSession) {
        setSession(existingSession);
      } else {
        const newSession = await createSession({
          workspaceId: currentWorkspaceId,
          startedAt: new Date(),
        });
        setSession(newSession);
      }
    }
    
    initSession();
    
    // track session activity
    const interval = setInterval(() => {
      if (session) {
        updateSessionActivity(session.id);
      }
    }, 60000); // every minute
    
    return () => clearInterval(interval);
  }, [currentWorkspaceId]);
  
  return {
    session,
    endSession: async () => {
      if (session) {
        await endSession(session.id);
        setSession(null);
      }
    },
  };
}
```

### 6. command palette integration

#### enhanced command palette
**file:** `apps/app/src/components/code/CommandPalette.tsx`
```typescript
export function CodeCommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentWorkspace] = useAtom(currentWorkspaceAtom);
  
  // keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  const commands = [
    {
      category: 'workspace',
      items: [
        { 
          label: 'switch workspace',
          icon: Folder,
          action: () => { /* show workspace switcher */ }
        },
        {
          label: 'refresh daemon connection',
          icon: ArrowClockwise,
          action: () => refreshDaemonConnection(currentWorkspace?.id),
        },
      ],
    },
    {
      category: 'tasks',
      items: [
        {
          label: 'view all tasks',
          icon: ListChecks,
          action: () => router.push('/code'),
        },
        {
          label: 'create task from clipboard',
          icon: Clipboard,
          action: async () => {
            const text = await navigator.clipboard.readText();
            createTask({ prompt: text });
          },
        },
      ],
    },
    {
      category: 'navigation',
      items: [
        {
          label: 'go to settings',
          icon: Gear,
          action: () => router.push('/code/settings'),
        },
        {
          label: 'view documentation',
          icon: Book,
          action: () => window.open('/docs', '_blank'),
        },
      ],
    },
  ];
  
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="type a command..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {commands.map((group) => (
          <CommandGroup key={group.category} heading={group.category}>
            {group.items.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={() => {
                  item.action();
                  setOpen(false);
                }}
              >
                <item.icon weight="duotone" size={16} className="mr-2" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
```

## key insights from claude code

### architecture patterns
1. **session-based organization** - each coding session has its own context
2. **command history** - every executed command is logged and searchable
3. **file tracking** - monitors which files were read/modified
4. **context persistence** - maintains conversation context across sessions
5. **workspace isolation** - each project is completely isolated

### ui/ux patterns
1. **minimal chrome** - focus on content, not ui
2. **keyboard-first** - extensive keyboard shortcuts
3. **contextual information** - shows relevant info based on current task
4. **progressive disclosure** - advanced features hidden until needed
5. **fast navigation** - quick switching between workspaces/tasks

### functionality patterns
1. **automatic context building** - learns from file access patterns
2. **smart command suggestions** - based on project type and history
3. **incremental progress** - saves state frequently
4. **graceful degradation** - works offline with cached data
5. **extensibility** - plugin system for custom tools

## implementation priorities

1. **session management** - track work sessions with full context
2. **command history** - searchable, replayable command log
3. **file tracking** - monitor all file operations
4. **context persistence** - save and restore conversation context
5. **keyboard shortcuts** - comprehensive keyboard navigation

## success metrics
- session context improves task completion
- command history reduces repeated work
- file tracking provides better insights
- ui feels as smooth as claude code

## dependencies on other agents
- requires daemon enhancements (agent 4)
- integrates with all other components

## estimated effort
- 4-5 days for core patterns
- 2 days for ui components
- 2 days for session management
- 1 day for testing