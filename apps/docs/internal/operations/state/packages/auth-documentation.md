# Package Documentation: auth

## Overview
- **Purpose**: Wraps Clerk authentication for use in Arbor-XYZ apps, providing client and server utilities along with a themed provider.
- **Type**: Authentication helper library.
- **Development Status**: Actively used across apps.
- **Responsible Team/Owner**: Core Web Team.

## API Documentation

### Primary Exports

#### `AuthProvider`
- **Purpose**: Supplies ClerkProvider configured with custom theming and routing.
- **Usage Pattern**:
  ```tsx
  import { AuthProvider } from '@repo/auth/provider';
  <AuthProvider>{children}</AuthProvider>
  ```
- **Implementation Notes**: Determines light/dark theme via next-themes and maps many Clerk UI elements to Tailwind classes.

#### `auth`
- **Purpose**: Server-side helper re-exported from `@clerk/nextjs/server`.
- **Usage Pattern**:
  ```ts
  import { auth } from '@repo/auth/server';
  const { userId } = await auth();
  ```
- **Implementation Notes**: Only available in server contexts via `server-only` import.

### Secondary Exports/Utilities

#### `authMiddleware`
- **Purpose**: Next.js middleware wrapper for Clerk authentication.
- **Usage Pattern**: Used in app routes to protect endpoints.

#### Billing Components (from `@repo/auth/billing`)
- **PricingPage**: Complete pricing page with Clerk's pricing table
- **PricingTable**: Direct access to Clerk's pricing table component
- **ProtectPlan**: Protect content by subscription plan
- **ProtectFeature**: Protect content by feature
- **PLANS**: Constants for plan names (`FREE`, `PLUS`)
- **isPaidPlan**: Utility to check if a plan is paid

## Internal Architecture

### Core Modules
1. **provider.tsx**
   - Contains the `AuthProvider` component with extensive style customizations.
2. **server.ts**
   - Re-exports server-side Clerk functions.
3. **middleware.ts**
   - Re-export of Clerk middleware for use in Next.js.
4. **billing.tsx**
   - Clerk billing integration with components and utilities for B2C subscriptions.

### Implementation Patterns
- Uses Next.js theme detection to switch Clerk themes dynamically.
- Centralizes style variables for consistency across apps.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| @clerk/nextjs | ^6.18.4 | Authentication framework | |
| next-themes | ^0.4.6 | Theme detection | Used in AuthProvider |
| zod | ^3.24.3 | Schema validation | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|---------|---------------|-------|
| @repo/typescript-config | Shared tsconfig | Dev dependency |

## Consumption Patterns

### Current App Usage
- All apps rely on this package for authentication via provider or server helper.

### Integration Best Practices
- Wrap the top-level layout in `<AuthProvider>` to ensure Clerk is initialized.
- Use server helpers from `@repo/auth/server` for secure route handlers.
- For billing, see the [Clerk Billing Integration guide](../../integrations/clerk-billing.md) for detailed usage instructions.

## Environment Variables
Refer to [the centralized environment variable reference](../environment-variables.md) for all keys used by this package.

## Testing Strategy
- No dedicated tests at this time; manual verification through sign-in flows.

## Known Issues & Limitations
- Styling relies on many class names which may drift from Clerk defaults.
- Lack of tests means upgrades may break authentication unexpectedly.

## Recent Developments
- Provider theming implemented with dark/light mode support.
- Added Clerk billing integration with B2C subscription management components and utilities.

