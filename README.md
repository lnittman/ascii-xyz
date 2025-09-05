# ascii-xyz

Minimal, AI‑powered ASCII art studio. Monorepo with a Next.js app, a small design system, and auth wired through Clerk.

## Quick Start

- Requirements: Node 20+, pnpm 9+
- Install: `pnpm install`
- Setup env: copy `.env.example` → `.env.local` and fill values
  - Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
  - Optional: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_POSTHOG_HOST`
- Dev (root): `pnpm dev` (starts the Next.js app)
- Build (root): `pnpm build`

Visit http://localhost:3000

## What’s Here

- `apps/app` — Next.js 15 app (frontend)
  - Create (home): `/` — prompt bar at bottom; idle hero shows subtle ASCII animation
  - Gallery: `/gallery` — authenticated list/views
  - Auth: `/signin`, `/signup` (Clerk Elements)
  - Middleware: protects private routes and redirects signed‑in users away from auth pages
- `packages/design` — Tailwind v4 tokens/utilities and shared UI
- `packages/auth` — Clerk helpers
- `packages/backend` — Convex (optional)

## Commands

- Root
  - `pnpm dev` — run the app
  - `pnpm build` — build all
  - `pnpm test` — run tests (if present)
  - `pnpm lint` / `pnpm format` — code quality
- App only: `pnpm -C apps/app dev` or `pnpm -C apps/app build`
