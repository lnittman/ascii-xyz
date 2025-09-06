# Environment setup

This project uses a Next.js app with a Convex backend and Clerk authentication. Configure environment variables before running locally.

## Prerequisites

- Node 22.x and pnpm
- Convex CLI (`npx convex dev` run via script)
- Vercel (optional) for deployments

## Local env files

1) Copy `.env.example` → `.env.local` and fill values.
2) For Convex, follow its onboarding to set `NEXT_PUBLIC_CONVEX_URL` or use the Convex Vercel integration.

### Required (minimum for local)

- Clerk
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- Convex
  - `NEXT_PUBLIC_CONVEX_URL` (auto‑provisioned by Convex dev; otherwise from dashboard)
- OpenRouter (one of)
  - Server default: `OPENROUTER_API_KEY` (used by Convex actions)
  - Or user BYOK: add an API key in Settings → Models (stored in `userSettings.apiKeys`)

### Optional

- Analytics: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (see `packages/analytics`)
- Webhook verification: `CLERK_WEBHOOK_SECRET` (required when enabling Clerk webhooks)
- Storage / Email: see `.env.example` for `R2_*` and `RESEND_API_KEY`

## Running locally

```bash
pnpm install
pnpm dev           # starts Convex dev server and the Next.js app together
# App: http://localhost:3000
```

## Deployment notes

- App: Vercel – set env vars in the project settings; PostHog rewrites are handled by `@repo/next-config`.
- Convex: deploy from `packages/backend` using `npx convex deploy` (script: `pnpm deploy:backend`).
