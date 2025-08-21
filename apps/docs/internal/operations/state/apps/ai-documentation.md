# App Documentation: ai

## Overview
- **Purpose**: Hosts Mastra-based AI agents responsible for asynchronous workflows and external integrations.
- **Business Value**: Provides AI-powered features such as chat completions and other automation services.
- **Development Status**: Active but with minimal testing.
- **Responsible Team/Owner**: AI Services Team.

## Core Architecture

### Architectural Pattern
- Implemented with TypeScript targeting Node.js.
- Uses Mastra core libraries and plugins for agent execution.
- Reads environment variables using next-config keys for runtime configuration.
- Agents communicate with external APIs like OpenRouter via provider packages.

### Core Modules
1. **src/**
   - Contains agent definitions and helper utilities.
   - Entry points invoked by the Mastra CLI.
2. **env.ts**
   - Defines and validates required environment variables.
   - Loaded at startup to configure agents.

### State Management
- Agents maintain in-memory state during execution.
- Persistent data stored in the shared database via direct API calls or webhooks.
- No dedicated state management library.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| mastra | ^0.6.1 | Agent runtime/CLI | Development dependency |
| @mastra/core | ^0.9.2 | Core agent functionality | Used in agent definitions |
| @openrouter/ai-sdk-provider | ^0.4.5 | Provider for OpenRouter | Used for AI calls |

### Internal Package Dependencies
| Package | Usage Pattern | Integration Points | Notes |
|---------|---------------|-------------------|-------|
| @repo/next-config | Environment management | Reads keys for URLs | Shared configuration |

## Key Features

### Feature: Agent Execution
- Runs AI agents defined in TypeScript files under `src/`.
- Agents can fetch data, generate responses, and call external APIs.
- Integration with database or other services occurs via helper packages.
- Potential improvement: add robust error handling and retries.

## Data Management
- Relies on environment variables and occasional database writes.
- No direct ORM usage; interacts with other services instead.
- Transformation handled in agent code.
- Caching not currently implemented.

## UI/UX Architecture
- No user interface—service runs as background process.

## Key Implementation Patterns
- Agents registered and run via the Mastra CLI (`pnpm dev`).
- Configuration loaded through environment helper from next-config.
- Uses zod schemas for input/output validation where applicable.

## Development Workflow
- Run locally with `pnpm dev` which starts the Mastra runtime.
- Type checking via `pnpm typecheck` defined in root scripts.
- Environment variables placed in `env.ts` or `.env` files.

## Known Issues & Technical Debt
- Lack of automated tests.
- Requires live external API access during development.
- Error handling around network failures is minimal.

## Recent Developments
- Initial contributor docs added in AGENTS.md.
- No major feature updates since repository documentation merge.

