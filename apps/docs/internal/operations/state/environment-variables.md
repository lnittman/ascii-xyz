# Environment Variable Reference

This document consolidates all environment variables used across the Arbor-XYZ repository. Variables are defined in each package's `keys.ts` file using `@t3-oss/env-nextjs`. Use this reference when creating `.env.local` files or configuring deployments.

| Variable | Scope | Package/App | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | client | analytics (optional) | PostHog API key for analytics. |
| `NEXT_PUBLIC_POSTHOG_HOST` | client | analytics (optional) | Custom PostHog host URL. |
| `CLERK_SECRET_KEY` | server | auth | Required Clerk backend API key. |
| `CLERK_WEBHOOK_SECRET` | server | auth (optional) | Validates Clerk webhooks. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | client | auth | Required Clerk frontend key. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | client | auth | Redirect path after sign in. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | client | auth | Redirect path after sign up. |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | client | auth | Post sign-in landing page. |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | client | auth | Post sign-up landing page. |
| `DATABASE_URL` | server | database | Connection string for Prisma. |
| `RESEND_FROM` | server | email | Default from address for emails. |
| `RESEND_TOKEN` | server | email | Resend API token. |
| `SVIX_TOKEN` | server | webhooks (optional) | Svix API token for webhook delivery. |
| `ANALYZE` | server | next-config (optional) | Enables bundle analysis when set. |
| `NEXT_RUNTIME` | server | next-config (optional) | Next.js runtime selection. |
| `NEXT_PUBLIC_AI_URL` | client | next-config | URL for the AI service. |
| `NEXT_PUBLIC_APP_URL` | client | next-config | Base URL of the main app. |

All other environment variables should be defined in individual package documentation. When adding new variables, update both the relevant `keys.ts` file and this reference.
