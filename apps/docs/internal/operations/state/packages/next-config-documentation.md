# Package Documentation: next-config

## Overview
- **Purpose**: Centralizes Next.js configuration shared across apps, including rewrites and bundle analysis.
- **Type**: Configuration utility package.
- **Development Status**: Stable with occasional updates.
- **Responsible Team/Owner**: Core Web Team.

## API Documentation

### Primary Exports

#### `config`
- **Purpose**: Base Next.js configuration object used by apps.
- **Usage Pattern**:
  ```ts
  import { config } from '@repo/next-config';
  export default config;
  ```
- **Implementation Notes**: Includes image domains, PostHog proxy rewrites, webpack plugin to add Prisma monorepo workaround, and skip trailing slash redirect.

#### `withAnalyzer`
- **Purpose**: Helper to wrap Next.js config with bundle analyzer.
- **Usage Pattern**:
  ```ts
  import { config, withAnalyzer } from '@repo/next-config';
  export default withAnalyzer(config);
  ```
- **Implementation Notes**: Uses `@next/bundle-analyzer` plugin.

### Secondary Exports/Utilities
- `keys` helper validates environment variables like `NEXT_PUBLIC_AI_URL`.

## Internal Architecture

### Core Modules
1. **index.ts**
   - Defines base configuration and export `withAnalyzer` function.
2. **keys.ts**
   - Uses `@t3-oss/env-nextjs` and `@t3-oss/env-core` to validate env variables.

### Implementation Patterns
- Adds PrismaPlugin for server-side builds when running on Vercel.
- Provides rewrites to proxy PostHog analytics calls.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| @next/bundle-analyzer | 15.3.1 | Analyze Next.js bundles | |
| @prisma/nextjs-monorepo-workaround-plugin | ^6.7.0 | Prisma plugin | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|---------|---------------|-------|
| @repo/typescript-config | Shared tsconfig | Dev dependency |

## Consumption Patterns

### Current App Usage
- Imported by the `app` and potentially `ai` applications for consistent Next.js setup.

### Integration Best Practices
- Use `withAnalyzer` conditionally when analyzing bundle size.
- Keep rewrites in sync with analytics infrastructure.

## Environment Variables
This package defines common variables like `NEXT_PUBLIC_AI_URL`. See [../environment-variables.md](../environment-variables.md) for the complete list.

## Testing Strategy
- Unit tests cover configuration utilities. Run `pnpm --filter @repo/next-config test`.

## Known Issues & Limitations
- Any changes to rewrites or webpack config require re-deployment of all apps.

## Recent Developments
- Added PostHog proxy rewrites to support analytics package.

