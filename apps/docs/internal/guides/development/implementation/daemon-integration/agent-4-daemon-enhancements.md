# agent 4: daemon enhancements

*"advanced daemon capabilities for a complete development experience"*

## scope
enhance the daemon with advanced file system operations, git integration, workspace awareness, and security features to provide a comprehensive local development interface.

## packages to modify
- `apps/daemon` - core daemon enhancements
- `packages/database` - daemon-specific data models

## implementation plan

### 1. enhanced file system operations (apps/daemon)

#### file watcher implementation
**file:** `apps/daemon/src-tauri/src/file_watcher.rs`
```rust
use notify::{Watcher, RecursiveMode, watcher, DebouncedEvent};
use std::sync::mpsc::channel;
use std::time::Duration;
use tauri::Manager;

pub struct FileWatcher {
    watcher: notify::Watcher,
    workspace_path: String,
}

impl FileWatcher {
    pub fn new(workspace_path: String, app_handle: tauri::AppHandle) -> Result<Self, Error> {
        let (tx, rx) = channel();
        let mut watcher = watcher(tx, Duration::from_millis(500))?;
        
        watcher.watch(&workspace_path, RecursiveMode::Recursive)?;
        
        // spawn thread to handle file events
        std::thread::spawn(move || {
            loop {
                match rx.recv() {
                    Ok(event) => {
                        match event {
                            DebouncedEvent::Create(path) |
                            DebouncedEvent::Write(path) |
                            DebouncedEvent::Remove(path) |
                            DebouncedEvent::Rename(from, to) => {
                                // emit event to frontend
                                app_handle.emit_all("file-change", json!({
                                    "type": "change",
                                    "path": path.to_string_lossy(),
                                })).unwrap();
                            }
                            _ => {}
                        }
                    }
                    Err(e) => eprintln!("watch error: {:?}", e),
                }
            }
        });
        
        Ok(FileWatcher { watcher, workspace_path })
    }
}
```

#### advanced file operations
**file:** `apps/daemon/src-tauri/src/file_ops.rs`
```rust
use std::fs;
use std::path::{Path, PathBuf};
use globset::{Glob, GlobSetBuilder};
use ignore::Walk;

#[tauri::command]
pub async fn search_files(
    pattern: String,
    workspace_path: String,
    options: SearchOptions,
) -> Result<Vec<FileMatch>, String> {
    let glob = Glob::new(&pattern)
        .map_err(|e| e.to_string())?
        .compile_matcher();
    
    let mut matches = Vec::new();
    
    for result in Walk::new(&workspace_path) {
        let entry = result.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if glob.is_match(path) {
            matches.push(FileMatch {
                path: path.strip_prefix(&workspace_path)
                    .unwrap_or(path)
                    .to_string_lossy()
                    .to_string(),
                is_dir: path.is_dir(),
                size: fs::metadata(path).ok().map(|m| m.len()),
            });
        }
        
        if matches.len() >= options.max_results.unwrap_or(100) {
            break;
        }
    }
    
    Ok(matches)
}

#[tauri::command]
pub async fn get_file_tree(
    path: String,
    max_depth: Option<usize>,
) -> Result<FileTreeNode, String> {
    let root_path = PathBuf::from(&path);
    
    if !root_path.exists() {
        return Err("path does not exist".to_string());
    }
    
    build_file_tree(&root_path, 0, max_depth.unwrap_or(3))
}

fn build_file_tree(
    path: &Path,
    current_depth: usize,
    max_depth: usize,
) -> Result<FileTreeNode, String> {
    let name = path.file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    
    let mut node = FileTreeNode {
        name,
        path: path.to_string_lossy().to_string(),
        is_dir: path.is_dir(),
        children: None,
    };
    
    if path.is_dir() && current_depth < max_depth {
        let mut children = Vec::new();
        
        for entry in fs::read_dir(path).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let child_path = entry.path();
            
            // skip hidden files and common ignore patterns
            if should_ignore(&child_path) {
                continue;
            }
            
            if let Ok(child_node) = build_file_tree(&child_path, current_depth + 1, max_depth) {
                children.push(child_node);
            }
        }
        
        // sort: directories first, then alphabetically
        children.sort_by(|a, b| {
            match (a.is_dir, b.is_dir) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => a.name.cmp(&b.name),
            }
        });
        
        node.children = Some(children);
    }
    
    Ok(node)
}

fn should_ignore(path: &Path) -> bool {
    let name = path.file_name()
        .unwrap_or_default()
        .to_string_lossy();
    
    // common ignore patterns
    name.starts_with('.') ||
    name == "node_modules" ||
    name == "target" ||
    name == "__pycache__" ||
    name == ".git"
}
```

### 2. git integration (apps/daemon)

#### comprehensive git operations
**file:** `apps/daemon/src-tauri/src/git_ops.rs`
```rust
use git2::{Repository, StatusOptions, DiffOptions};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct GitStatus {
    branch: String,
    ahead: usize,
    behind: usize,
    staged: Vec<GitFile>,
    unstaged: Vec<GitFile>,
    untracked: Vec<GitFile>,
}

#[tauri::command]
pub async fn get_git_status(workspace_path: String) -> Result<GitStatus, String> {
    let repo = Repository::open(&workspace_path)
        .map_err(|e| format!("not a git repository: {}", e))?;
    
    // get current branch
    let head = repo.head().map_err(|e| e.to_string())?;
    let branch = head.shorthand().unwrap_or("HEAD").to_string();
    
    // get ahead/behind counts
    let (ahead, behind) = get_ahead_behind(&repo)?;
    
    // get file statuses
    let mut opts = StatusOptions::new();
    opts.include_untracked(true);
    
    let statuses = repo.statuses(Some(&mut opts))
        .map_err(|e| e.to_string())?;
    
    let mut staged = Vec::new();
    let mut unstaged = Vec::new();
    let mut untracked = Vec::new();
    
    for entry in statuses.iter() {
        let path = entry.path().unwrap_or("").to_string();
        let status = entry.status();
        
        let git_file = GitFile {
            path: path.clone(),
            status: format_status(status),
        };
        
        if status.is_index_new() || status.is_index_modified() || status.is_index_deleted() {
            staged.push(git_file.clone());
        }
        
        if status.is_wt_new() {
            untracked.push(git_file);
        } else if status.is_wt_modified() || status.is_wt_deleted() {
            unstaged.push(git_file);
        }
    }
    
    Ok(GitStatus {
        branch,
        ahead,
        behind,
        staged,
        unstaged,
        untracked,
    })
}

#[tauri::command]
pub async fn get_git_diff(
    workspace_path: String,
    file_path: Option<String>,
    staged: bool,
) -> Result<String, String> {
    let repo = Repository::open(&workspace_path)
        .map_err(|e| e.to_string())?;
    
    let mut opts = DiffOptions::new();
    if let Some(path) = file_path {
        opts.pathspec(path);
    }
    
    let diff = if staged {
        repo.diff_index_to_head(None, Some(&mut opts))
    } else {
        repo.diff_index_to_workdir(None, Some(&mut opts))
    }.map_err(|e| e.to_string())?;
    
    let mut diff_text = String::new();
    diff.print(git2::DiffFormat::Patch, |_delta, _hunk, line| {
        diff_text.push_str(&String::from_utf8_lossy(line.content()));
        true
    }).map_err(|e| e.to_string())?;
    
    Ok(diff_text)
}

#[tauri::command]
pub async fn git_commit(
    workspace_path: String,
    message: String,
    files: Vec<String>,
) -> Result<String, String> {
    let repo = Repository::open(&workspace_path)
        .map_err(|e| e.to_string())?;
    
    let mut index = repo.index()
        .map_err(|e| e.to_string())?;
    
    // stage specified files
    for file in files {
        index.add_path(Path::new(&file))
            .map_err(|e| format!("failed to stage {}: {}", file, e))?;
    }
    
    index.write()
        .map_err(|e| e.to_string())?;
    
    // get signature
    let sig = repo.signature()
        .map_err(|e| format!("configure git user: {}", e))?;
    
    // create commit
    let tree_id = index.write_tree()
        .map_err(|e| e.to_string())?;
    
    let tree = repo.find_tree(tree_id)
        .map_err(|e| e.to_string())?;
    
    let parent_commit = repo.head()
        .and_then(|h| h.peel_to_commit())
        .map_err(|e| e.to_string())?;
    
    let oid = repo.commit(
        Some("HEAD"),
        &sig,
        &sig,
        &message,
        &tree,
        &[&parent_commit],
    ).map_err(|e| e.to_string())?;
    
    Ok(oid.to_string())
}
```

### 3. workspace context awareness (apps/daemon)

#### workspace analyzer
**file:** `apps/daemon/src-tauri/src/workspace_analyzer.rs`
```rust
use std::collections::HashMap;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct WorkspaceInfo {
    project_type: ProjectType,
    languages: Vec<Language>,
    frameworks: Vec<Framework>,
    package_managers: Vec<PackageManager>,
    config_files: HashMap<String, String>,
}

#[derive(Serialize, Deserialize)]
pub enum ProjectType {
    NodeJs,
    Python,
    Rust,
    Go,
    Mixed,
    Unknown,
}

#[tauri::command]
pub async fn analyze_workspace(workspace_path: String) -> Result<WorkspaceInfo, String> {
    let path = Path::new(&workspace_path);
    
    let mut info = WorkspaceInfo {
        project_type: ProjectType::Unknown,
        languages: Vec::new(),
        frameworks: Vec::new(),
        package_managers: Vec::new(),
        config_files: HashMap::new(),
    };
    
    // detect package managers and project type
    if path.join("package.json").exists() {
        info.project_type = ProjectType::NodeJs;
        info.languages.push(Language::JavaScript);
        
        // check which package manager
        if path.join("pnpm-lock.yaml").exists() {
            info.package_managers.push(PackageManager::Pnpm);
        } else if path.join("yarn.lock").exists() {
            info.package_managers.push(PackageManager::Yarn);
        } else if path.join("package-lock.json").exists() {
            info.package_managers.push(PackageManager::Npm);
        }
        
        // read package.json for framework detection
        if let Ok(content) = fs::read_to_string(path.join("package.json")) {
            info.config_files.insert("package.json".to_string(), content.clone());
            
            if content.contains("\"next\"") {
                info.frameworks.push(Framework::NextJs);
            }
            if content.contains("\"react\"") {
                info.frameworks.push(Framework::React);
            }
            if content.contains("\"@tauri-apps/api\"") {
                info.frameworks.push(Framework::Tauri);
            }
        }
    }
    
    if path.join("Cargo.toml").exists() {
        info.project_type = ProjectType::Rust;
        info.languages.push(Language::Rust);
        info.package_managers.push(PackageManager::Cargo);
        
        if let Ok(content) = fs::read_to_string(path.join("Cargo.toml")) {
            info.config_files.insert("Cargo.toml".to_string(), content);
        }
    }
    
    if path.join("requirements.txt").exists() || path.join("pyproject.toml").exists() {
        info.project_type = ProjectType::Python;
        info.languages.push(Language::Python);
        info.package_managers.push(PackageManager::Pip);
    }
    
    if path.join("go.mod").exists() {
        info.project_type = ProjectType::Go;
        info.languages.push(Language::Go);
        info.package_managers.push(PackageManager::GoMod);
    }
    
    // check for typescript
    if path.join("tsconfig.json").exists() {
        info.languages.push(Language::TypeScript);
    }
    
    Ok(info)
}
```

### 4. daemon frontend enhancements (apps/daemon)

#### enhanced ui components
**file:** `apps/daemon/src/components/WorkspaceInfo.tsx`
```typescript
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  GitBranch, 
  FileText, 
  Package,
  Warning 
} from '@phosphor-icons/react';

interface WorkspaceInfoProps {
  workspacePath: string;
}

export function WorkspaceInfo({ workspacePath }: WorkspaceInfoProps) {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [workspaceInfo, setWorkspaceInfo] = useState<WorkspaceInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  
  useEffect(() => {
    async function loadInfo() {
      try {
        const [git, workspace] = await Promise.all([
          invoke<GitStatus>('get_git_status', { workspacePath }),
          invoke<WorkspaceInfo>('analyze_workspace', { workspacePath }),
        ]);
        
        setGitStatus(git);
        setWorkspaceInfo(workspace);
      } catch (error) {
        console.error('failed to load workspace info:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }
    
    loadInfo();
  }, [workspacePath]);
  
  if (isAnalyzing) {
    return <LoadingState />;
  }
  
  return (
    <div className="space-y-4">
      {/* git status */}
      {gitStatus && (
        <div className="border border-border rounded-none p-4">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch weight="duotone" size={16} />
            <span className="text-sm font-medium">git status</span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">branch:</span>
              <span>{gitStatus.branch}</span>
            </div>
            
            {gitStatus.ahead > 0 && (
              <div className="text-green-600">
                {gitStatus.ahead} commit{gitStatus.ahead > 1 ? 's' : ''} ahead
              </div>
            )}
            
            {gitStatus.behind > 0 && (
              <div className="text-yellow-600">
                {gitStatus.behind} commit{gitStatus.behind > 1 ? 's' : ''} behind
              </div>
            )}
            
            <div className="pt-2 space-y-1">
              <div className="text-green-600">
                {gitStatus.staged.length} staged
              </div>
              <div className="text-yellow-600">
                {gitStatus.unstaged.length} modified
              </div>
              <div className="text-muted-foreground">
                {gitStatus.untracked.length} untracked
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* workspace info */}
      {workspaceInfo && (
        <div className="border border-border rounded-none p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package weight="duotone" size={16} />
            <span className="text-sm font-medium">project info</span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">type:</span>
              <span>{workspaceInfo.projectType.toLowerCase()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">languages:</span>
              <span>{workspaceInfo.languages.join(', ').toLowerCase()}</span>
            </div>
            
            {workspaceInfo.frameworks.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">frameworks:</span>
                <span>{workspaceInfo.frameworks.join(', ').toLowerCase()}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">package manager:</span>
              <span>{workspaceInfo.packageManagers[0]?.toLowerCase() || 'none'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 5. security and sandboxing (apps/daemon)

#### command sandboxing
**file:** `apps/daemon/src-tauri/src/security.rs`
```rust
use std::collections::HashSet;
use regex::Regex;

pub struct SecurityConfig {
    allowed_commands: HashSet<String>,
    blocked_paths: Vec<Regex>,
    max_file_size: usize,
    max_command_output: usize,
}

impl Default for SecurityConfig {
    fn default() -> Self {
        let mut allowed_commands = HashSet::new();
        for cmd in &[
            "git", "npm", "pnpm", "yarn", "node", "deno", "bun",
            "python", "pip", "poetry", "cargo", "rustc", "go",
            "ls", "cat", "grep", "find", "which", "pwd", "echo",
        ] {
            allowed_commands.insert(cmd.to_string());
        }
        
        let blocked_paths = vec![
            Regex::new(r"^/etc").unwrap(),
            Regex::new(r"^/sys").unwrap(),
            Regex::new(r"^/proc").unwrap(),
            Regex::new(r"\.\./").unwrap(), // prevent path traversal
        ];
        
        SecurityConfig {
            allowed_commands,
            blocked_paths,
            max_file_size: 10 * 1024 * 1024, // 10MB
            max_command_output: 1 * 1024 * 1024, // 1MB
        }
    }
}

pub fn validate_command(command: &str, config: &SecurityConfig) -> Result<(), String> {
    // check if command is allowed
    let cmd_parts: Vec<&str> = command.split_whitespace().collect();
    if cmd_parts.is_empty() {
        return Err("empty command".to_string());
    }
    
    let base_command = cmd_parts[0];
    if !config.allowed_commands.contains(base_command) {
        return Err(format!("command '{}' not allowed", base_command));
    }
    
    // check for shell operators that could be dangerous
    let dangerous_patterns = ["|", "&&", "||", ";", ">", "<", "$(", "`"];
    for pattern in &dangerous_patterns {
        if command.contains(pattern) {
            return Err(format!("shell operator '{}' not allowed", pattern));
        }
    }
    
    Ok(())
}

pub fn validate_path(path: &str, config: &SecurityConfig) -> Result<(), String> {
    // check against blocked paths
    for regex in &config.blocked_paths {
        if regex.is_match(path) {
            return Err(format!("access to path '{}' is blocked", path));
        }
    }
    
    // ensure path is within workspace
    let canonical = std::fs::canonicalize(path)
        .map_err(|_| "invalid path".to_string())?;
    
    // additional checks can be added here
    
    Ok(())
}
```

#### resource limits
**file:** `apps/daemon/src-tauri/src/limits.rs`
```rust
use tokio::time::{timeout, Duration};
use tokio::io::{AsyncReadExt, BufReader};

pub struct ResourceLimits {
    command_timeout: Duration,
    max_concurrent_commands: usize,
    max_memory_usage: usize,
}

impl Default for ResourceLimits {
    fn default() -> Self {
        ResourceLimits {
            command_timeout: Duration::from_secs(300), // 5 minutes
            max_concurrent_commands: 5,
            max_memory_usage: 512 * 1024 * 1024, // 512MB
        }
    }
}

pub async fn execute_with_limits(
    command: tokio::process::Command,
    limits: &ResourceLimits,
) -> Result<CommandOutput, String> {
    // execute with timeout
    let output = timeout(limits.command_timeout, command.output())
        .await
        .map_err(|_| "command timeout".to_string())?
        .map_err(|e| e.to_string())?;
    
    // check output size
    if output.stdout.len() > limits.max_memory_usage {
        return Err("output too large".to_string());
    }
    
    Ok(CommandOutput {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code().unwrap_or(-1),
    })
}
```

### 6. daemon state persistence

#### local database for daemon
**file:** `apps/daemon/src-tauri/src/database.rs`
```rust
use sqlx::{SqlitePool, migrate::MigrateDatabase};
use std::path::PathBuf;

pub struct DaemonDatabase {
    pool: SqlitePool,
}

impl DaemonDatabase {
    pub async fn new() -> Result<Self, Error> {
        let db_path = get_daemon_db_path()?;
        
        // create database if it doesn't exist
        if !Sqlite::database_exists(&db_path).await? {
            Sqlite::create_database(&db_path).await?;
        }
        
        let pool = SqlitePool::connect(&db_path).await?;
        
        // run migrations
        sqlx::migrate!("./migrations").run(&pool).await?;
        
        Ok(DaemonDatabase { pool })
    }
    
    pub async fn save_workspace(&self, workspace: &WorkspaceConfig) -> Result<(), Error> {
        sqlx::query!(
            r#"
            INSERT INTO workspaces (id, path, auth_token, last_connected)
            VALUES (?1, ?2, ?3, ?4)
            ON CONFLICT(id) DO UPDATE SET
                path = excluded.path,
                auth_token = excluded.auth_token,
                last_connected = excluded.last_connected
            "#,
            workspace.id,
            workspace.path,
            workspace.auth_token,
            workspace.last_connected
        )
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }
    
    pub async fn get_recent_workspaces(&self) -> Result<Vec<WorkspaceConfig>, Error> {
        let workspaces = sqlx::query_as!(
            WorkspaceConfig,
            r#"
            SELECT id, path, auth_token, last_connected
            FROM workspaces
            ORDER BY last_connected DESC
            LIMIT 10
            "#
        )
        .fetch_all(&self.pool)
        .await?;
        
        Ok(workspaces)
    }
}

fn get_daemon_db_path() -> Result<String, Error> {
    let app_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
        .ok_or("failed to get app data dir")?;
    
    let db_path = app_dir.join("daemon.db");
    Ok(db_path.to_string_lossy().to_string())
}
```

## testing strategy

### unit tests
- file operation validation
- git command parsing
- security checks

### integration tests
- file watching events
- git operations on test repos
- workspace analysis accuracy

### security tests
- command injection attempts
- path traversal prevention
- resource exhaustion

## success metrics
- file operations < 50ms
- git status < 100ms
- secure against common attacks
- stable file watching

## dependencies on other agents
- builds on websocket infrastructure (agent 1)
- enhances code agent capabilities (agent 2)
- integrates with task flow (agent 3)

## estimated effort
- 5-6 days for core enhancements
- 2 days for security implementation
- 2 days for ui components
- 2 days for testing