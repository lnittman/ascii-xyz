# app Contributor Guide

## App Overview
This Next.js application provides the main web UI and API routes for Arbor-XYZ. It depends heavily on shared packages for authentication, database access, and UI components.

## Dev Environment
- Install deps: `pnpm install`
- Start dev server: `pnpm dev`
- Build: `pnpm build`
- Env variables are defined in `env.ts`

## Key Files and Directories
- `src/app/` – Next.js route handlers and pages
- `src/components/` – React UI components
- `src/lib/` – Utilities and hooks
- `public/` – Static assets

## Integration Points
- Uses `@repo/auth` for authentication
- Database queries through `@repo/database`
- UI components from `@repo/design`

## Testing
- Run `pnpm --filter app test` to execute tests

## Known Issues
- API routes assume a running database instance

### Import Paths
- Use `@/` aliases for modules under `src/` to avoid long relative paths.
