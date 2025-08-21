# Claude Guide to Hooks

This directory contains custom React hooks used throughout the Arbor web application.

## 📦 Hook Categories

### Chat Hooks (`/chat`)
Core hooks for chat functionality with SWR for data fetching.

#### `queries.ts` - Data Fetching
```typescript
// Primary chat hooks
export function useChats(initialData?: Chat[]) {
  return useSWR<ApiResponse<Chat[]>>(
    '/api/chats',
    fetcher,
    {
      fallbackData: initialData ? { success: true, data: initialData } : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
}

export function useChatMessages(id: string | null, initialData?: Message[]) {
  return useSWR<ApiResponse<Message[]>>(
    id ? `/api/chats/${id}/messages` : null,
    fetcher,
    {
      fallbackData: initialData ? { success: true, data: initialData } : undefined,
      dedupingInterval: 30000, // 30 seconds - prevent excessive requests
      revalidateOnMount: false,
      refreshInterval: 0, // No automatic polling - prevent server overload
    }
  );
}
```

#### `mutations.ts` - Data Updates
```typescript
// Chat operations with optimistic updates
export function useCreateChat() {
  const { mutate } = useChats();
  
  return async (data: CreateChatInput) => {
    // Optimistic update
    mutate(
      async (current) => {
        const newChat = await createChat(data);
        return {
          success: true,
          data: [...(current?.data || []), newChat]
        };
      },
      { revalidate: false }
    );
  };
}

export function useUpdateChatModel() {
  return async (id: string, model: string) => {
    await updateChatModel(id, model);
    // Only invalidate specific chat, not entire list
    mutate(`/api/chats/${id}`);
  };
}
```

### Project Hooks (`/project`)
```typescript
export function useProjects() {
  return useSWR<ApiResponse<Project[]>>(
    '/api/projects',
    fetcher,
    defaultProjectConfig
  );
}

export function useProjectChats(projectId: string | null) {
  return useSWR<ApiResponse<Chat[]>>(
    projectId ? `/api/projects/${projectId}/chats` : null,
    fetcher
  );
}
```

### Workspace Hooks (`/workspace`)
```typescript
export function useWorkspaces() {
  const { data: session } = useSession();
  
  return useSWR<ApiResponse<Workspace[]>>(
    session ? '/api/workspaces' : null,
    fetcher
  );
}

export function useWorkspaceSync(workspaceId: string) {
  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3456/workspace/${workspaceId}`);
    // ... handle messages
    return () => ws.close();
  }, [workspaceId]);
}
```

## 🔧 Common Patterns

### SWR Configuration
```typescript
// Default config to prevent aggressive revalidation
export const defaultChatConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  shouldRetryOnError: false,
};

// With deduping for expensive operations
export const messageFetchConfig: SWRConfiguration = {
  ...defaultChatConfig,
  dedupingInterval: 30000, // 30 seconds
  refreshInterval: 0,      // No polling
};
```

### Error Handling
```typescript
export function useErrorHandler() {
  return (error: Error) => {
    if (error.message.includes('401')) {
      // Handle auth errors
      router.push('/sign-in');
    } else {
      toast.error(error.message);
    }
  };
}
```

### Optimistic Updates
```typescript
export function useOptimisticUpdate<T>(
  key: string,
  updateFn: (current: T) => Promise<T>
) {
  const { mutate } = useSWR(key);
  
  return async (optimisticData: T) => {
    await mutate(
      updateFn,
      {
        optimisticData,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };
}
```

## 🎯 Best Practices

### 1. Prevent Excessive Requests
```typescript
// Bad: Can cause server overload
useSWR(key, fetcher, {
  refreshInterval: 5000,        // Too aggressive
  revalidateOnFocus: true,     // Too frequent
  dedupingInterval: 0,         // No deduping
});

// Good: Controlled fetching
useSWR(key, fetcher, {
  refreshInterval: 0,           // No automatic polling
  revalidateOnFocus: false,    // Manual control
  dedupingInterval: 30000,     // 30s deduping
});
```

### 2. Conditional Fetching
```typescript
// Only fetch when prerequisites are met
const { data } = useSWR(
  userId && projectId ? `/api/data/${userId}/${projectId}` : null,
  fetcher
);
```

### 3. Type Safety
```typescript
// Define response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Use generic hooks
export function useApiData<T>(url: string) {
  return useSWR<ApiResponse<T>>(url, fetcher);
}
```

## 🚨 Common Pitfalls

1. **Infinite Loops**: Avoid mutating in render or effect without dependencies
2. **Race Conditions**: Use SWR's built-in deduping
3. **Memory Leaks**: Clean up subscriptions and intervals
4. **Stale Closures**: Use refs for values that change frequently

## 📝 Adding New Hooks

1. Group by feature (chat, project, etc.)
2. Separate queries from mutations
3. Export from index.ts
4. Include TypeScript types
5. Document complex behavior

## 🔍 Debugging Tips

```typescript
// Enable SWR devtools
if (process.env.NODE_ENV === 'development') {
  window.__SWR_DEVTOOLS_USE__ = true;
}

// Log all SWR operations
useSWR(key, fetcher, {
  onSuccess: (data) => console.log('Success:', data),
  onError: (error) => console.error('Error:', error),
});
```

Remember: Hooks should be reusable, well-typed, and prevent excessive API calls that could overload the server.