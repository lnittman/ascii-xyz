# Developer Onboarding

Welcome to ascii-xyz. This guide gets you productive quickly.

## Repo layout

- apps/app – Next.js 15 app (primary UI)
- packages/backend – Convex backend (functions, schema, http)
- packages/auth – Clerk wrappers and provider
- packages/design – UI components, styles, and utilities
- packages/ascii – Reusable ASCII engine/generators/hooks
- packages/analytics – PostHog client/server helpers

## Common scripts

Run from repo root:

```bash
pnpm install

# Develop app + backend together
pnpm dev

# App only / Backend only
pnpm dev:app
pnpm dev:backend

# Lint / Format / Test
pnpm lint
pnpm format
pnpm test
```

## Day‑1 tasks

1) Create `.env.local` by copying `.env.example` and fill required keys (see `docs/ENVIRONMENT.md`).
2) Start Convex dev server: `pnpm dev:backend` (in a split terminal).
3) Start Next.js app: `pnpm dev:app` → open `http://localhost:3006`.
4) Sign in via Clerk; confirm a user record appears in Convex (via live queries).
5) Try `/create` to generate an ASCII animation. If you don’t set `OPENROUTER_API_KEY`, add a user API key in Settings → Models.

## Coding standards

- Keep components presentational; put logic in hooks/services.
- Follow Linear‑style motion guidelines (0ms in / 150ms out; menus 0/0).
- Prefer Convex `useQuery/useMutation` for server state; use Jotai for UI state.
- Match existing naming and file patterns; keep diffs minimal.

## Docs

- Architecture: `ARCHITECTURE.md`
- User flows: `docs/user-flows/`
- Component library: `docs/components/`
- Backend/API: `docs/api/`
