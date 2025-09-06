# HTTP endpoints and rewrites

## Convex HTTP router

File: `packages/backend/convex/http.ts`

- `POST /clerk-users-webhook`
  - Purpose: Sync Clerk users into Convex (`internal.users.upsertFromClerk`, `internal.users.deleteFromClerk`).
  - Auth: Svix signature verification required via headers `svix-id`, `svix-timestamp`, `svix-signature` and `CLERK_WEBHOOK_SECRET`.
  - Returns: `200 OK` on success; `400` on verification failure.

## Next.js rewrites (analytics)

File: `packages/next-config/index.ts`

Rewrites requests to PostHog cloud under a local `/ingest` path to ease CSP and ad‑blockers:

```txt
/ingest/static/:path*   → https://us-assets.i.posthog.com/static/:path*
/ingest/:path*          → https://us.i.posthog.com/:path*
/ingest/decide          → https://us.i.posthog.com/decide
```

The app initializes PostHog in `packages/analytics/posthog/client.tsx` and on the server in `packages/analytics/posthog/server.ts` using `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`.
