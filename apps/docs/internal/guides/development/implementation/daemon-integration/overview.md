# arbor daemon integration plan

*"connect local folders to arbor workspaces for ai-powered development"*

## overview

this document outlines the comprehensive plan to integrate the arbor daemon with the main arbor web application, enabling users to submit prompts in the `/code` page that execute through the code agent on their local machines via the daemon.

## current state analysis

### completed work
1. **daemon foundation** ✅
   - tauri v2 desktop app built and running
   - custom ui matching arbor design system
   - directory selection and connection flow
   - basic api integration with auth token support

2. **database schema** ✅
   - workspace model supports daemon connections
   - task model for tracking code agent work
   - daemon-specific fields (daemonId, localPath, daemonStatus)

3. **api endpoints** ✅
   - `/api/workspaces/connect-daemon` - register daemon connection
   - `/api/workspaces/daemon-heartbeat` - maintain connection status
   - basic workspace and task crud operations

### gaps identified
1. **code agent integration**
   - no `/api/ai/code` endpoint for executing prompts
   - code agent in apps/ai has no tools configured
   - no daemon command execution mechanism

2. **real-time communication**
   - no websocket connection between daemon and web app
   - no streaming output from agent to ui
   - no live task status updates

3. **daemon capabilities**
   - execute_command is basic, needs enhancement
   - no file reading/writing capabilities
   - no git operations support
   - no workspace context awareness

4. **ui/ux features**
   - task detail page shows output but no real-time updates
   - no terminal-like interface for command execution
   - no file browser or code viewer integration

## integration architecture

### communication flow
```
user submits prompt → /code page → /api/ai/code → mastra code agent
                                                    ↓
daemon ← websocket ← arbor server ← agent tools → execute locally
   ↓                                               ↑
local filesystem → command output → stream back → update task
```

### key components
1. **websocket server** - bidirectional communication
2. **daemon api** - enhanced tauri commands for code operations
3. **code agent tools** - filesystem, git, shell command tools
4. **streaming pipeline** - real-time output to task detail page
5. **security layer** - sandboxed execution, permission model

## implementation phases

### phase 1: core infrastructure
establish the foundational communication and execution pipeline

### phase 2: code agent enhancement
build comprehensive tool suite for the code agent

### phase 3: real-time features
implement websocket streaming and live updates

### phase 4: advanced capabilities
add git integration, file browsing, and enhanced ui

### phase 5: security & polish
implement sandboxing, permissions, and production readiness

## success criteria
- user can submit a prompt that executes code operations on their local machine
- real-time streaming of command output to the task detail page
- secure, sandboxed execution environment
- seamless integration with existing arbor ui/ux patterns

## next steps
detailed implementation plans for each component are provided in separate documents within this directory.