# ascii-xyz

AI-native ASCII art studio

## Documentation

- Architecture: `docs/architecture/index.md`
- User flows: `docs/user-flows/`
- Components: `docs/components/`
- API & schema: `docs/api/`
- Onboarding: `docs/ONBOARDING.md`
- Environment setup: `docs/ENVIRONMENT.md`

## Quick Start

- Requirements: Node 20+, pnpm 9+
- Install: `pnpm install`
- Setup env: copy `.env.example` → `.env.local` and fill values
  - Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
  - Convex: `NEXT_PUBLIC_CONVEX_URL`
  - Posthog (optional): `NEXT_PUBLIC_POSTHOG_HOST`
- Dev (root): `pnpm dev` (starts Convex + Next.js)
- Build (root): `pnpm build`

Visit http://localhost:3000

## Commands

- `pnpm dev` — run the app
- `pnpm build` — build all
- `pnpm test` — run tests (if present)
- `pnpm lint` / `pnpm format` — code quality

