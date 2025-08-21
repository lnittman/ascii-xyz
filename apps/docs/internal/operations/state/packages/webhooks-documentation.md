# Package Documentation: webhooks

## Overview
- **Purpose**: Provides helpers for sending and managing Svix webhooks from Arbor-XYZ apps.
- **Type**: Utility package for webhook delivery.
- **Development Status**: Early stage with basic functionality.
- **Responsible Team/Owner**: Backend Integrations Team.

## API Documentation

### Primary Exports

#### `webhooks`
- **Purpose**: Object exposing `send` and `getAppPortal` functions for interacting with Svix.
- **Usage Pattern**:
  ```ts
  import { webhooks } from '@repo/webhooks';
  await webhooks.send('event.type', payload);
  ```
- **Implementation Notes**: Uses the Svix SDK and requires authentication via the auth package.

### Secondary Exports/Utilities
- None.

## Internal Architecture

### Core Modules
1. **lib/svix.ts**
   - Implements `send` and `getAppPortal` functions using the Svix client.
2. **keys.ts**
   - Validates the `SVIX_TOKEN` environment variable.

### Implementation Patterns
- Server-only utilities enforced via `server-only` imports.
- Retrieves organization ID from the auth package before sending events.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| svix | ^1.65.0 | Webhook delivery service | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|---------|---------------|-------|
| @repo/auth | Fetch current user/org for webhooks | Required for `send` |

## Consumption Patterns

### Current App Usage
- The `app` application can call `webhooks.send` when certain events occur.

### Integration Best Practices
- Ensure `SVIX_TOKEN` and authentication context are available.
- Handle errors from Svix gracefully to avoid failed deliveries.

## Environment Variables
`SVIX_TOKEN` is described in the [environment variable reference](../environment-variables.md).

## Testing Strategy
- Unit tests cover Svix helper functions. Run `pnpm --filter @repo/webhooks test`.

## Known Issues & Limitations
- Functions silently return if org ID is missing, which may hide errors.
- Only basic send functionality implemented.

## Recent Developments
- Initial Svix integration with helper functions for sending messages and generating portal links.

