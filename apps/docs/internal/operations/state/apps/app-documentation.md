# App Documentation: app

## Overview
- **Purpose**: Serves the primary Next.js user interface and API routes for Arbor-XYZ.
- **Business Value**: Delivers the core chat and project management experience to end users.
- **Development Status**: Active development.
- **Responsible Team/Owner**: Core Web Team.

## Core Architecture

### Architectural Pattern
- Built with Next.js 15 using the App Router and React 19.
- Utilizes server actions for data mutations and server components for rendering.
- Relies on shared packages for auth, database access, and UI design system.
- Data flows from the browser to API route handlers, which interact with the database package.

### Core Modules
1. **actions/**
   - Server actions for chats, projects, invites, and sharing.
   - Integrates with services in `lib/api` and revalidates Next.js paths.
2. **components/**
   - Reusable UI components built on the design package.
   - Includes chat interfaces, layout pieces, and form elements.
3. **app/**
   - App Router pages and route handlers including authenticated and unauthenticated layouts.
   - API endpoints documented in `src/app/api`.
4. **lib/**
   - Utility functions, hooks, and API service wrappers.
   - Provides typed API clients and domain logic.

### State Management
- Uses Jotai atoms and Zustand stores for client state where needed.
- Server state persisted in the database via Prisma.
- Revalidation ensures fresh data after mutations.
- State is shared through React context and hooks from packages.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| next | 15.3.1 | Next.js framework | App Router with server components |
| react | 19.1.0 | React runtime | Shared across repo |
| @clerk/nextjs | ^6.18.0 | Authentication | Provided via auth package |
| @mastra/client-js | ^0.1.19 | AI integration | Used for chat features |

### Internal Package Dependencies
| Package | Usage Pattern | Integration Points | Notes |
|---------|---------------|-------------------|-------|
| @repo/auth | Provider and server helpers | AuthProvider in root layout | Custom Clerk theme |
| @repo/database | Prisma client access | Server actions | Central data layer |
| @repo/design | UI components | Shared in pages and components | Themeable |
| @repo/analytics | Analytics provider | Layout wrapper | Optional |

## Key Features

### Feature: Chat Management
- Provides CRUD operations for chats and messages.
- Implemented via server actions in `actions/chat.ts`.
- Integrates with AI agents and database package.
- Could improve pagination and real‑time updates.

### Feature: Project Collaboration
- Organizes chats into projects with invitations.
- Uses server actions and Prisma models.
- UI components in `components/project`.
- Potential enhancements: role management and activity feed.

## Data Management
- Data stored in PostgreSQL via Prisma client from database package.
- API routes validate inputs with Zod.
- Uses SWR for client-side data fetching in some components.
- Caching handled by Next.js route revalidation and SWR caching.
- Validation errors surfaced through custom ApiError class.

## UI/UX Architecture
- Components grouped by domain (chat, project, layout).
- Styling via Tailwind CSS with design system utilities.
- Responsive layouts handled by CSS and Radix UI primitives.
- UI state managed with React context and hooks.
- Uses Next.js view transitions for enhanced navigation.

## Key Implementation Patterns
- Server actions returning typed results.
- Custom React hooks for API calls.
- Error handling with ApiError and Zod schemas.
- Asynchronous data loading via React suspense.
- Performance optimized with dynamic imports and memoized components.

## Development Workflow
- Local dev server via `pnpm dev`.
- Type checking with `pnpm typecheck`.
- Environment variables defined in `env.ts` and validated by next-config package.
- Debugging through built‑in Next.js tools.

## Known Issues & Technical Debt
- Pagination not implemented on list endpoints.
- Unit tests cover API utilities and validation helpers. Coverage improving but still limited.
- Some server actions lack error boundary coverage.
- Requires running database for API routes.

## Recent Developments
- Added contributor documentation and AGENTS guidelines.
- Improved API documentation under `src/app/api/AGENTS.md`.

