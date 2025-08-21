# API Contributor Guide

## App Overview
`apps/api` exposes server routes for cron jobs, health checks and webhooks.
All pages are API routes and there is no frontend rendering.

## Dev Environment
- Run `pnpm dev` at the repo root to start all apps.
- Environment variables are configured in `env.ts`.

## Key Files and Directories
- `src/app/cron/` – scheduled update routes.
- `src/app/webhooks/clerk/` – Clerk webhook handler.
- `src/lib/update/` – league and match data updaters.

## Integration Points
- Uses `@repo/database` for persistence.
- Invokes the AI app to summarise news when scraping via Firecrawl.

## Testing
Execute `pnpm test --filter api` to run tests for this app.

## Known Issues
- Cron routes currently log errors rather than surfacing them via alerts.

### Import Paths
- Use `@/` aliases defined in `tsconfig.json` instead of relative paths when importing local modules.
