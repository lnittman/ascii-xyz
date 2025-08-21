# Package Documentation: database

## Overview
- **Purpose**: Offers Prisma schema and database access utilities for all apps.
- **Type**: Data layer package providing ORM client and types.
- **Development Status**: Active; central to application functionality.
- **Responsible Team/Owner**: Core Backend Team.

## API Documentation

### Primary Exports

#### `database`
- **Purpose**: Singleton PrismaClient instance connected via Neon serverless driver.
- **Usage Pattern**:
  ```ts
  import { database } from '@repo/database';
  const chats = await database.chat.findMany();
  ```
- **Implementation Notes**: Ensures a single client instance during development and exports Prisma types.

### Secondary Exports/Utilities

#### `Prisma`
- **Purpose**: Re-export of Prisma namespace for query helpers.
- **Usage Pattern**: `import { Prisma } from '@repo/database';`
- **Implementation Notes**: Avoids wildcard exports warnings.

## Internal Architecture

### Core Modules
1. **index.ts**
   - Configures WebSocket support for Neon and exports the Prisma client and types.
2. **prisma/schema.prisma**
   - Defines models for Chat, Message, Project, SharedLink, and User.
3. **keys.ts**
   - Validates `DATABASE_URL` environment variable using `@t3-oss/env-nextjs`.

### Implementation Patterns
- Utilizes Neon serverless driver for database connections.
- Maintains a connection pool for efficient queries.
- Exports generated Prisma client located in `generated/` folder.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| @prisma/client | 6.7.0 | ORM client | Generated code |
| @neondatabase/serverless | ^1.0.0 | Postgres driver for serverless | |
| ws | ^8.18.1 | WebSocket support | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|---------|---------------|-------|
| @repo/typescript-config | Shared tsconfig | Dev dependency |

## Consumption Patterns

### Current App Usage
- Used heavily by the `app` application for all data access.
- Potentially accessed by AI agents for database interactions.

### Integration Best Practices
- Ensure `DATABASE_URL` is defined before importing the package.
- Use exported Prisma types for strong typing across apps.

## Environment Variables
Detailed information about `DATABASE_URL` can be found in the [environment variable reference](../environment-variables.md).

## Testing Strategy
- Basic unit tests validate the Prisma client singleton. Database integration tests are still not implemented; continue using `pnpm migrate` for schema validation.

## Known Issues & Limitations
- Requires running database during development which may hinder onboarding.
- Schema changes necessitate regeneration of the Prisma client.

## Recent Developments
- Initial contributor documentation added describing Prisma usage.

