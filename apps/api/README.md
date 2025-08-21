# Arbor API Routes

All API functionality is provided through oRPC procedures. This ensures:
- End-to-end type safety
- Shared procedures between server actions and API routes
- Automatic OpenAPI generation
- Consistent business logic across all endpoints

## Architecture

The API service uses oRPC to expose all business logic through a unified interface:
1. **oRPC Router** (`@repo/orpc/router`) - Defines all procedures
2. **Services** (`@repo/services`) - Business logic implementation
3. **Database** (`@repo/database`) - Prisma ORM for data access
4. **Authentication** - Bearer token for API, Clerk for server actions

## Available Routes

### `/api/health`
Health check endpoint for service monitoring.

### `/api/webhooks`
Webhook endpoints for external integrations (Clerk, etc).

### `/api/*` (oRPC Endpoints)
All business logic endpoints are automatically generated from the oRPC router:

#### Settings
- `POST /api/settings.data.get` - Get data settings
- `POST /api/settings.data.update` - Update data settings
- `POST /api/settings.ai.get` - Get AI settings
- `POST /api/settings.ai.update` - Update AI settings
- `POST /api/settings.appearance.get` - Get appearance settings
- `POST /api/settings.appearance.update` - Update appearance settings
- `POST /api/settings.notifications.get` - Get notification settings
- `POST /api/settings.notifications.update` - Update notification settings
- `POST /api/settings.profile.get` - Get profile settings
- `POST /api/settings.profile.update` - Update profile settings

#### Chats
- `POST /api/chats.list` - List all chats
- `POST /api/chat.create` - Create new chat
- `POST /api/chats.get` - Get chat by ID
- `POST /api/chats.update` - Update chat
- `POST /api/chats.delete` - Delete chat
- `POST /api/chats.archive` - Archive chat
- `POST /api/chats.syncTitle` - Sync chat title

#### Projects
- `POST /api/projects.list` - List all projects
- `POST /api/projects.create` - Create new project
- `POST /api/projects.get` - Get project by ID
- `POST /api/projects.update` - Update project
- `POST /api/projects.delete` - Delete project
- `POST /api/projects.archive` - Archive project
- `POST /api/projects.updateFiles` - Update project files
- `POST /api/projects.updateInstructions` - Update project instructions

#### Other Resources
- Tasks, Workspaces, Outputs, Feedback, Share, User operations follow similar patterns

### `/api/openapi/*`
- `/api/openapi/spec.json` - OpenAPI 3.1.1 specification
- `/api/openapi/` - Swagger UI documentation

### `/api/orpc/openapi.json`
Alternative OpenAPI endpoint for Swift client generation.

## Authentication

All API routes (except health and webhooks) require Bearer token authentication:
```
Authorization: Bearer <token>
```

## Usage

### Direct API Call
```bash
curl -X POST http://localhost:8787/api/chats/list \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Through oRPC Client
```typescript
import { createORPCClient } from '@repo/orpc';

const client = createORPCClient({
  baseURL: 'http://localhost:8787/api',
  headers: {
    Authorization: `Bearer ${token}`
  }
});

const chats = await client.chats.list();
```

## Development

```bash
# Start the API service
pnpm dev:api

# The API will be available at http://localhost:8787
```