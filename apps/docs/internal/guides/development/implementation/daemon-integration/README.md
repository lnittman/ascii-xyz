# arbor daemon integration plan

*"connect local folders to arbor workspaces for ai-powered development"*

## overview

this directory contains the comprehensive implementation plan for integrating the arbor daemon with the main web application, enabling seamless ai-powered local development through the code agent.

## architecture diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   user submits  │     │  /code page     │     │  /api/ai/code   │
│     prompt      │────▶│  creates task   │────▶│  triggers agent │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  task detail    │◀────│   websocket     │◀────│  mastra code    │
│  shows output   │     │   streams       │     │     agent       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                          │
                                ▼                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  real-time ui   │     │  arbor daemon   │     │   agent tools   │
│    updates      │◀────│executes locally │◀────│ file/git/shell  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## implementation agents

### [agent 1: websocket infrastructure](./agent-1-websocket-infrastructure.md)
**scope**: establish real-time communication between daemon and web app
- websocket server in apps/app
- websocket client in daemon
- message routing and authentication
- **effort**: 5-7 days

### [agent 2: code agent tools](./agent-2-code-agent-tools.md)
**scope**: equip the code agent with powerful local development capabilities
- command execution tool
- file operations (read/write/search)
- git integration
- workspace context awareness
- **effort**: 8-10 days

### [agent 3: task execution flow](./agent-3-task-execution-flow.md)
**scope**: orchestrate the complete flow from prompt to output
- task creation and navigation
- real-time output streaming
- terminal ui component
- error handling and status updates
- **effort**: 6-8 days

### [agent 4: daemon enhancements](./agent-4-daemon-enhancements.md)
**scope**: advanced daemon capabilities and security
- file watching and git status
- workspace analysis
- security sandboxing
- resource limits
- **effort**: 9-11 days

### [agent 5: claude code inspiration](./agent-5-claude-code-inspiration.md)
**scope**: ui/ux patterns inspired by claude code
- session management
- command history
- context persistence
- keyboard shortcuts
- **effort**: 7-9 days

## key features

### core functionality
- ✅ daemon connects to local directories
- ✅ workspace management with multiple connection types
- ✅ task creation from natural language prompts
- 🔄 code agent executes commands through daemon
- 🔄 real-time output streaming to web ui
- 🔄 file operations and git integration
- 🔄 security sandboxing and resource limits

### user experience
- 🔄 terminal-like output display
- 🔄 file change tracking
- 🔄 command history and replay
- 🔄 keyboard-first navigation
- 🔄 session context persistence
- 🔄 progressive disclosure of features

## technical stack

### frontend (apps/app)
- next.js 15 with app router
- websocket client for real-time updates
- swr for data fetching
- framer motion for animations
- phosphor icons (duotone)

### backend (apps/app api)
- websocket server with auth
- streaming ai responses
- task queue management
- database operations

### ai service (apps/ai)
- mastra framework
- code agent with custom tools
- openrouter for llm access
- context-aware prompting

### daemon (apps/daemon)
- tauri v2 with rust
- file system operations
- git integration (libgit2)
- websocket client
- security sandboxing

## development phases

### phase 1: foundation (weeks 1-2)
- websocket infrastructure
- basic command execution
- simple output display

### phase 2: core features (weeks 3-4)
- complete agent tools
- task execution flow
- real-time updates

### phase 3: enhancements (weeks 5-6)
- advanced daemon features
- security implementation
- ui polish

### phase 4: refinement (week 7)
- claude code patterns
- performance optimization
- comprehensive testing

## success criteria

### functional requirements
- [ ] user can connect local folder via daemon
- [ ] prompts execute as code operations locally
- [ ] output streams in real-time to web ui
- [ ] files can be read, written, and tracked
- [ ] git operations work seamlessly
- [ ] security prevents malicious operations

### performance requirements
- [ ] < 100ms latency for local operations
- [ ] < 500ms from prompt to execution start
- [ ] smooth output streaming without lag
- [ ] handles large outputs gracefully
- [ ] maintains stable websocket connection

### security requirements
- [ ] commands are sandboxed and validated
- [ ] file access restricted to workspace
- [ ] no arbitrary code execution
- [ ] resource limits prevent dos
- [ ] auth tokens properly managed

## testing strategy

### unit tests
- individual tool validation
- security rule enforcement
- message parsing

### integration tests
- end-to-end flow testing
- websocket reliability
- error handling

### security tests
- penetration testing
- injection attempts
- resource exhaustion

### user acceptance tests
- real development workflows
- performance under load
- ui responsiveness

## risks and mitigations

### technical risks
- **websocket stability**: implement reconnection logic
- **command execution safety**: strict sandboxing rules
- **performance at scale**: implement streaming and pagination
- **cross-platform compatibility**: test on all os variants

### user experience risks
- **complexity**: progressive disclosure of features
- **latency**: optimize critical paths
- **error handling**: clear, actionable error messages
- **learning curve**: comprehensive documentation

## next steps

1. **review and approve** this plan with stakeholders
2. **assign agents** to independent developers
3. **set up coordination** meetings and progress tracking
4. **begin implementation** with agent 1 (websocket)
5. **iterate based on feedback** from early testing

## resources

- [tauri v2 documentation](https://v2.tauri.app)
- [mastra ai framework](https://mastra.ai)
- [next.js 15 app router](https://nextjs.org/docs)
- [websocket protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

---

*"go slow to go far" - build it right, build it once*