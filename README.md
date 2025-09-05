# ascii-xyz

AI-native ASCII art studio

## Quick Start

- Requirements: Node 20+, pnpm 9+
- Install: `pnpm install`
- Setup env: copy `.env.example` → `.env.local` and fill values
  - Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
  - Convex: `NEXT_PUBLIC_CONVEX_URL`
  - Posthog (optional): `NEXT_PUBLIC_POSTHOG_HOST`
- Dev (root): `pnpm dev` (starts the Next.js app)
- Build (root): `pnpm build`

Visit http://localhost:3000

## Commands

- `pnpm dev` — run the app
- `pnpm build` — build all
- `pnpm test` — run tests (if present)
- `pnpm lint` / `pnpm format` — code quality
