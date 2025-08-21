# Package Documentation: analytics

## Overview
- **Purpose**: Provides PostHog and Vercel analytics integration helpers and React providers.
- **Type**: Utility and provider package for analytics.
- **Development Status**: Active use with limited complexity.
- **Responsible Team/Owner**: Core Web Team.

## API Documentation

### Primary Exports

#### `AnalyticsProvider`
- **Purpose**: Wraps children with PostHog and Vercel analytics providers.
- **Usage Pattern**:
  ```tsx
  import { AnalyticsProvider } from '@repo/analytics';
  <AnalyticsProvider>{children}</AnalyticsProvider>
  ```
- **Implementation Notes**: Internally renders `<PostHogProvider>` and `<VercelAnalytics />`.

### Secondary Exports/Utilities

#### `useAnalytics`
- **Purpose**: Hook to access the PostHog client on the client side.
- **Usage Pattern**:
  ```tsx
  const posthog = useAnalytics();
  posthog.capture('event');
  ```
- **Implementation Notes**: Re-exported from `posthog-js/react`.

## Internal Architecture

### Core Modules
1. **posthog/**
   - `client.tsx` initializes PostHog in the browser and provides the provider component.
   - `server.ts` exposes a Node SDK instance for server-side events.
2. **vercel.ts**
   - Simple re-export of Vercel Analytics component.

### Implementation Patterns
- React context providers for analytics clients.
- Environment variables read via `keys.ts` using `@t3-oss/env-nextjs`.
- Avoids automatic pageview capture to allow manual control.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| posthog-js | ^1.235.6 | Client-side analytics | |
| posthog-node | ^4.11.3 | Server-side events | |
| @vercel/analytics | ^1.5.0 | Vercel analytics integration | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|---------|---------------|-------|
| @repo/typescript-config | Shared tsconfig | Dev dependency |

## Consumption Patterns

### Current App Usage
- Used by the `app` application to wrap its root layout for analytics tracking.
- No usage observed in other apps currently.

### Integration Best Practices
- Initialize early in the React tree to capture events.
- Ensure environment variables for PostHog keys are set.
- Avoid sending sensitive data in analytics payloads.

## Environment Variables
See the [central environment variable reference](../environment-variables.md) for names and usage of analytics keys.

## Testing Strategy
- No dedicated tests; manual verification of event delivery.

## Known Issues & Limitations
- Environment keys in `keys.ts` are commented out by default, so configuration may be incomplete.
- Could provide TypeScript types for event payloads.

## Recent Developments
- Added as part of initial repository setup; no significant changes since.

