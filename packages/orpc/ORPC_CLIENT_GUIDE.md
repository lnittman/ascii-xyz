# 🐙 oRPC Client Setup Guide for Next.js

## 🦉 overview

This guide demonstrates how to properly create an oRPC client that works with Next.js and server actions without importing server-side code in client components. The key is to separate type definitions from runtime code.

## 🐊 quick start

### installation
```bash
npm install @orpc/server@latest @orpc/client@latest @orpc/react@latest
```

## 🦝 core concepts

### type-only imports
The key to avoiding server code in client bundles is using TypeScript's type-only imports and separating your router types from the actual router implementation.

### router type extraction
Instead of importing the router directly, extract its type and use it for client creation.

## 🐆 implementation patterns

### 1. separate router types

Create a dedicated types file that extracts router types without importing server code:

```typescript
// packages/orpc/types.ts
import type { Infer } from '@orpc/contract';
import type { router } from './router';

// Extract the router type
export type AppRouter = typeof router;

// Infer input and output types
export type RouterInputs = Infer.Inputs<AppRouter>;
export type RouterOutputs = Infer.Outputs<AppRouter>;
```

### 2. create client factory

Build a client factory that uses the router type without importing the actual router:

```typescript
// packages/orpc/client.ts
import { createORPCClient as createClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { RouterClient } from '@orpc/server';
import type { AppRouter } from './types';

export function createORPCClient(options?: {
  baseURL?: string;
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
}): RouterClient<AppRouter> {
  const link = new RPCLink({
    url: options?.baseURL ?? '/api/orpc',
    headers: options?.headers,
  });

  // The router type is passed as a generic parameter, not imported
  return createClient<AppRouter>(link);
}

export type ORPCClient = RouterClient<AppRouter>;
```

### 3. client-only exports

Create an index file that only exports client-safe code:

```typescript
// packages/orpc/index.ts
// Client-side exports only
export { createORPCClient } from './client';
export type { ORPCClient } from './client';

// Type exports (safe for both client and server)
export type {
  AppRouter,
  RouterInputs,
  RouterOutputs,
} from './types';

// Server-side exports should be in a separate file
// DO NOT export router, handlers, or server actions here
```

### 4. using in next.js app router

#### client component usage

```typescript
// app/components/MyComponent.tsx
'use client';

import { createORPCClient } from '@repo/orpc';
import { useState } from 'react';

export function MyComponent() {
  const [data, setData] = useState(null);
  
  const handleFetch = async () => {
    const client = createORPCClient({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Authorization': 'Bearer token'
      }
    });
    
    const result = await client.projects.list();
    setData(result);
  };
  
  return (
    <button onClick={handleFetch}>
      Fetch Projects
    </button>
  );
}
```

#### server component usage

```typescript
// app/page.tsx
import { createORPCClient } from '@repo/orpc';
import { headers } from 'next/headers';

export default async function Page() {
  const client = createORPCClient({
    baseURL: process.env.API_URL || 'http://localhost:3000/api/orpc',
    headers: async () => {
      const h = await headers();
      return Object.fromEntries(h.entries());
    }
  });
  
  const projects = await client.projects.list();
  
  return <div>{/* render projects */}</div>;
}
```

## 🦋 patterns & best practices

### optimized ssr setup

For better SSR performance, create separate clients for server and client:

```typescript
// lib/orpc-client.ts
import { createORPCClient } from '@repo/orpc';
import { headers } from 'next/headers';

// Server-side client with headers forwarding
export const serverClient = createORPCClient({
  baseURL: process.env.API_URL || 'http://localhost:3000/api/orpc',
  headers: async () => {
    if (typeof window !== 'undefined') {
      return {};
    }
    const h = await headers();
    return Object.fromEntries(h.entries());
  }
});

// Client-side client
export const client = createORPCClient({
  baseURL: typeof window !== 'undefined' 
    ? `${window.location.origin}/api/orpc`
    : process.env.NEXT_PUBLIC_API_URL || '/api/orpc'
});
```

### server actions with orpc

Define server actions in a separate file:

```typescript
// app/actions.ts
'use server';

import { protectedAction } from '@/server/orpc';
import { z } from 'zod';

export const createProject = protectedAction
  .input(z.object({
    name: z.string(),
    description: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Implementation
    return { id: '123', ...input };
  });
```

Use in client components:

```typescript
// app/components/ProjectForm.tsx
'use client';

import { createProject } from '@/app/actions';
import { useServerAction } from '@orpc/react';

export function ProjectForm() {
  const { execute, status, error } = useServerAction(createProject);
  
  const handleSubmit = async (formData: FormData) => {
    await execute({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    });
  };
  
  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <textarea name="description" />
      <button type="submit" disabled={status === 'pending'}>
        Create Project
      </button>
    </form>
  );
}
```

### with swr integration

```typescript
// lib/orpc-swr.ts
import useSWR from 'swr';
import type { ORPCClient } from '@repo/orpc';
import { createORPCClient } from '@repo/orpc';

// Create a stable client instance
const client = createORPCClient();

// Create typed SWR hooks
export function useProjects() {
  return useSWR(
    ['projects', 'list'],
    () => client.projects.list(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );
}

export function useProject(id: string) {
  return useSWR(
    id ? ['projects', 'get', id] : null,
    () => client.projects.get({ id }),
    {
      revalidateOnFocus: false,
    }
  );
}
```

## 🐝 troubleshooting

### common issues

#### "cannot import server code in client component"
- ensure you're only importing from the client exports
- use type-only imports for router types
- check that your package.json exports are configured correctly

#### "router type not found"
- make sure the types file properly exports the router type
- verify typescript is configured to include the types

### debugging tips

1. check bundle analysis to ensure server code isn't included
2. use `'use client'` directive at the top of client components
3. verify your imports are from the correct paths
4. ensure environment variables are properly prefixed for client usage

## 🦌 advanced patterns

### custom link with auth

```typescript
// lib/orpc-auth-client.ts
import { createORPCClient } from '@repo/orpc';
import { getSession } from '@/lib/auth';

export async function createAuthClient() {
  const session = await getSession();
  
  return createORPCClient({
    headers: {
      'Authorization': session?.token ? `Bearer ${session.token}` : '',
    }
  });
}
```

### type-safe error handling

```typescript
// app/components/ErrorBoundary.tsx
'use client';

import { isORPCError } from '@orpc/client';
import type { RouterOutputs } from '@repo/orpc';

export function handleORPCError(error: unknown) {
  if (isORPCError(error)) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        // Handle auth errors
        break;
      case 'NOT_FOUND':
        // Handle not found
        break;
      default:
        // Handle other errors
    }
  }
}
```

## 🐊 summary

The key to using oRPC with Next.js without importing server code is:

1. **separate types from implementation** - use type-only imports
2. **create dedicated client factories** - that accept router types as generics
3. **organize exports carefully** - separate client and server exports
4. **use proper build configurations** - ensure bundler respects boundaries

This approach gives you full type safety while keeping your client bundles clean and your server code secure.