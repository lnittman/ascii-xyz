# Claude Guide to @repo/database

This package contains the Drizzle ORM schema and database client configuration for Arbor.

## 📦 Package Overview

**@repo/database** provides:
- Drizzle schema definition
- Generated Zod schemas via drizzle-zod
- Database utilities
- Type exports
- Hyperdrive support for Cloudflare Workers

## 📊 Schema Overview

### Core Models

#### User
```typescript
export const users = pgTable('User', {
  id: text('id').primaryKey(),
  clerkId: text('clerkId').notNull().unique(), // Critical: Used as resourceId for Mastra
  activeModel: text('activeModel'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});
```

#### Chat
```typescript
export const chats = pgTable('Chat', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  userId: text('userId').notNull(),
  projectId: text('projectId'),
  activeModel: text('activeModel'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (table) => ({
  projectIdx: index().on(table.projectId),
  userIdx: index().on(table.userId),
}));
```

#### Project
```typescript
export const projects = pgTable('Project', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('userId').notNull(),
  description: text('description'),
  imageUrl: text('imageUrl'),
  instructions: text('instructions'),
  files: json('files'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  kind: projectKindEnum('kind').default('chat').notNull(),
}, (table) => ({
  userIdx: index().on(table.userId),
}));
```

#### Workspace
```typescript
export const workspaces = pgTable('Workspace', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  localPath: text('localPath'), // Local folder path
  daemonId: text('daemonId'),
  daemonStatus: daemonStatusEnum('daemonStatus').default('disconnected').notNull(),
  lastDaemonHeartbeat: timestamp('lastDaemonHeartbeat', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (table) => ({
  daemonIdx: index().on(table.daemonId),
  userIdx: index().on(table.userId),
}));
```

## 🔧 Common Patterns

### Importing Drizzle
```typescript
// Always import from this package
import { db, database, schema, eq, and } from '@repo/database';
import type { User, Chat, Project } from '@repo/database';
```

### Query Patterns
```typescript
// Basic queries
const user = await db.select().from(schema.users).where(eq(schema.users.clerkId, userId));

// With relations (using leftJoin)
const userWithChats = await db
  .select()
  .from(schema.users)
  .leftJoin(schema.chats, eq(schema.users.id, schema.chats.userId))
  .where(eq(schema.users.clerkId, userId))
  .orderBy(desc(schema.chats.updatedAt))
  .limit(10);

// Select specific columns
const chatTitles = await db
  .select({
    id: schema.chats.id,
    title: schema.chats.title,
  })
  .from(schema.chats)
  .where(eq(schema.chats.userId, userId));

// Transactions for related operations
await db.transaction(async (tx) => {
  const project = await tx.insert(schema.projects).values(projectData).returning();
  const chat = await tx.insert(schema.chats).values(chatData).returning();
  return { project, chat };
});
```

### Type Usage
```typescript
import type { Chat, User, NewChat, NewUser } from '@repo/database';

// Drizzle types are inferred from schema
type ChatWithProject = Chat & {
  project?: Project;
};

// Use Zod schemas for validation
import { insertChatSchema, selectChatSchema } from '@repo/database';

// Validate input
const validatedChat = insertChatSchema.parse(inputData);
```

## 🎯 Best Practices

### 1. Use Transactions
```typescript
// Good: Atomic operations
await db.transaction(async (tx) => {
  const [chat] = await tx.insert(schema.chats).values(data).returning();
  await tx.update(schema.users)
    .set({ updatedAt: new Date() })
    .where(eq(schema.users.id, userId));
  return chat;
});
```

### 2. Handle Unique Constraints
```typescript
import { PostgresError } from 'postgres';

try {
  await db.insert(schema.users).values(data);
} catch (error) {
  if (error instanceof PostgresError && error.code === '23505') {
    // Unique constraint violation
    throw new ApiError('User already exists', 409);
  }
  throw error;
}
```

### 3. Efficient Queries
```typescript
// Bad: N+1 query
const chats = await db.select().from(schema.chats);
for (const chat of chats) {
  const user = await db.select().from(schema.users).where(eq(schema.users.id, chat.userId));
}

// Good: Single query with join
const chatsWithUsers = await db
  .select({
    chat: schema.chats,
    user: schema.users,
  })
  .from(schema.chats)
  .leftJoin(schema.users, eq(schema.chats.userId, schema.users.id));
```

### 4. Use Hyperdrive for Cloudflare Workers
```typescript
// In Cloudflare Workers context
import { getDb } from '@repo/database';

export default {
  async fetch(request, env) {
    const db = getDb(env.HYPERDRIVE);
    const users = await db.select().from(schema.users);
    return Response.json(users);
  },
};
```

## 🚨 Important Notes

1. **Never expose database errors** to clients
2. **Use clerkId** for user lookups (not id)
3. **Add indexes** for frequently queried fields
4. **Use soft deletes** where appropriate
5. **Keep schema migrations** atomic

## 📝 Schema Changes

1. Edit `src/schema.ts`
2. Run `pnpm generate` to create migrations
3. Apply migrations: `pnpm migrate`
4. Update TypeScript imports if needed

## 🔍 Debugging

```bash
# Open Drizzle Studio
pnpm studio

# Generate migrations
pnpm generate

# Apply migrations
pnpm migrate

# Push schema changes directly (dev only!)
pnpm push
```

## 🗄️ Connection Management

The package exports a singleton database instance with:
- Connection pooling via postgres.js
- Minimal connections for edge runtime
- Proper cleanup on exit
- Hyperdrive support for Cloudflare Workers

```typescript
// Handled automatically in index.ts
const sql = postgres(databaseUrl, {
  max: 1, // Minimal connections for edge runtime
  idle_timeout: 20,
  connect_timeout: 10,
});

// For Cloudflare Workers with Hyperdrive
const db = getDb(env.HYPERDRIVE);
```

Remember: This package is the single source of truth for data structure. Keep migrations backward compatible and always test schema changes thoroughly.