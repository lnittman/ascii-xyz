# User Flow – Sign up / Sign in

This flow shows how users authenticate with Clerk, how the app gates protected routes, and how users are synced into Convex.

```mermaid
sequenceDiagram
  participant U as User
  participant Midd as Next.js Middleware (Clerk)
  participant Pages as /signin | /signup
  participant App as Protected Routes
  participant Clerk as Clerk Backend
  participant Cx as Convex HTTP

  U->>Midd: Request /create
  alt Unauthenticated
    Midd-->>U: redirect to /signin
    U->>Pages: visit /signin
    Pages->>Clerk: signIn()
    Clerk-->>Pages: session
    Pages-->>U: redirect to /
  else Authenticated
    Midd-->>U: allow
  end

  Clerk-->>Cx: POST /clerk-users-webhook (user.created/updated)
  Cx->>Cx: internal.users.upsertFromClerk
  Cx-->>Clerk: 200 OK
```

Key files
- App middleware: `apps/app/src/middleware.ts`
- Clerk provider: `packages/auth/provider.tsx`
- Clerk webhook router: `packages/backend/convex/http.ts`

Public vs protected
- Public: `/`, `/signin`, `/signup`, `/share/*`, static assets.
- Protected: everything else; middleware runs `auth.protect()` for non‑public routes.
