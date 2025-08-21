# agent 1: memory & persistence architect
*"ensuring every conversation is remembered"*

## scope

this agent is responsible for perfecting the synchronization between the ui chat state and the mastra memory system. the goal is seamless persistence where every message, tool call, and output is properly stored and retrievable across sessions.

## packages to modify

- `apps/app` - chat components, api routes, hooks
- `packages/api/services/chat.ts` - chat service synchronization
- `packages/api/services/mastra/agent.ts` - memory integration
- `packages/database/prisma/schema.prisma` - potential schema updates

## implementation details

### 1. understand current architecture

#### a. mastra memory system
```typescript
// Mastra automatically creates and manages:
// - mastra_messages (all chat messages)
// - mastra_threads (conversation threads)
// - mastra_memories (context/working memory)
// - vector tables (semantic search)

// Key insight: Mastra is the source of truth for conversations
```

#### b. current duplication issue
```typescript
// Two parallel storage systems:
// 1. Arbor tables (Chat, Message) - Prisma-managed
// 2. Mastra tables (mastra_*) - Mastra-managed

// Current flow:
// User message → Mastra (saved) → Assistant response → Both systems
// Result: Mastra has complete history, Arbor has partial
```

#### c. identified gaps
- user messages never saved to arbor's Message table
- no mechanism to query mastra's memory from ui
- unclear when to use which storage system
- potential resourceId/threadId mismatches

### 2. implement proper synchronization strategy

#### a. option 1: dual storage with sync (recommended short-term)
```typescript
// Keep both systems but ensure consistency
// packages/api/services/chat.ts
export class ChatService {
  // Save user messages immediately to arbor db
  async createUserMessage(chatId: string, content: string, userId: string) {
    return await database.message.create({
      data: {
        chatId,
        content,
        role: 'user',
        userId
      }
    });
  }
  
  // Query mastra for missing messages on chat load
  async syncFromMastra(chatId: string, clerkId: string) {
    // Only sync if we detect missing messages
    const dbMessageCount = await database.message.count({
      where: { chatId }
    });
    
    if (dbMessageCount === 0) {
      // Fetch from mastra's memory API
      const mastraMessages = await this.fetchMastraThreadMessages(
        chatId,  // threadId
        clerkId  // resourceId  
      );
      
      // Bulk insert missing messages
      if (mastraMessages.length > 0) {
        await database.message.createMany({
          data: mastraMessages.map(msg => ({
            chatId,
            content: msg.content,
            role: msg.role,
            toolCalls: msg.toolCalls,
            createdAt: msg.timestamp
          }))
        });
      }
    }
  }
}
```

#### b. enhance api route
```typescript
// apps/app/src/app/api/chats/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  // get chat with messages
  const chat = await chatService.getById(params.id);
  
  // sync with mastra if needed
  if (chat.messages.length === 0) {
    await chatService.syncWithMastra(params.id, user.clerkId);
  }
  
  // return enriched chat
  return successResponse(chat);
}
```

#### c. update hooks for real-time sync
```typescript
// apps/app/src/hooks/chat/queries.ts
export function useChat(chatId: string) {
  return useSWR(`/api/chats/${chatId}`, fetcher, {
    refreshInterval: 5000, // poll for mastra updates
    onSuccess: (data) => {
      // update local state with any new messages from mastra
    }
  });
}
```

### 3. thread and resource id management

#### a. establish clear mapping
```typescript
// threadId = chatId (for 1:1 mapping)
// resourceId = clerkId (user identifier for mastra)

interface MemoryContext {
  threadId: string;    // maps to chat.id
  resourceId: string;  // maps to user.clerkId
}
```

#### c. implement mastra memory api access
```typescript
// packages/api/services/mastra/memory.ts
import { Memory } from '@mastra/memory';
import { PostgresStore } from '@mastra/postgres';

export class MastraMemoryService {
  private memory: Memory;
  
  constructor() {
    this.memory = new Memory({
      storage: new PostgresStore({
        connectionString: process.env.DATABASE_URL
      })
    });
  }
  
  // Fetch thread messages from mastra's storage
  async getThreadMessages(threadId: string, resourceId: string) {
    // Direct query to mastra_messages table
    const messages = await this.memory.storage.getMessages({
      threadId,
      resourceId,
      limit: 1000 // Get all messages
    });
    
    return messages;
  }
  
  // Get working memory for a user
  async getWorkingMemory(resourceId: string) {
    return await this.memory.storage.getWorkingMemory({
      resourceId
    });
  }
}
```

### 4. tool call persistence

#### a. enhance message schema
```typescript
// already supports toolCalls and toolResults as JSON
// ensure proper serialization

interface ToolCallData {
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
  state: 'call' | 'result';
  result?: any;
}
```

#### b. implement tool call sync
```typescript
async function syncToolCalls(
  message: Message,
  mastraMessage: MastraMessage
) {
  if (mastraMessage.toolCalls) {
    await database.message.update({
      where: { id: message.id },
      data: {
        toolCalls: mastraMessage.toolCalls,
        toolResults: mastraMessage.toolResults
      }
    });
  }
}
```

### 5. fix user message persistence

#### a. update chat submission to save user messages
```typescript
// apps/app/src/components/chat/chat-interface.tsx
const handleSubmit = async (value: string) => {
  const userMessage: Message = {
    id: generateId(),
    role: 'user',
    content: value,
    createdAt: new Date()
  };
  
  // 1. Optimistically add to UI
  append(userMessage);
  
  // 2. Save to database immediately
  await fetch(`/api/chats/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      content: value,
      role: 'user'
    })
  });
  
  // 3. Continue with mastra streaming
  // (mastra will also save to its memory)
};
```

#### b. create message save endpoint
```typescript
// apps/app/src/app/api/chats/[id]/messages/route.ts
export const POST = withErrorHandling(
  withAuthenticatedUser(async function saveMessage(
    request: Request,
    { params, user }: { params: { id: string }, user: AuthenticatedUser }
  ) {
    const body = await request.json();
    
    // Verify chat ownership
    const chat = await chatService.getById(params.id);
    if (chat.userId !== user.id) {
      return errorResponse('Unauthorized', 403);
    }
    
    // Save message
    const message = await chatService.createMessage({
      chatId: params.id,
      content: body.content,
      role: body.role,
      userId: user.id
    });
    
    return successResponse(message);
  })
);
```

### 6. future migration path

#### option 2: mastra as single source of truth (long-term)
```typescript
// Eventually migrate to use only mastra's storage
// This eliminates duplication and complexity

// 1. Query messages directly from mastra
// 2. Remove Message model from prisma
// 3. Keep only Chat model for metadata
// 4. Use mastra's memory API for all queries
```

#### migration considerations
```typescript
// Pros:
// - Single source of truth
// - Automatic vector search
// - Built-in working memory
// - Semantic recall features

// Cons:
// - Dependency on mastra's schema
// - Need to implement custom queries
// - Potential performance implications
```

## dependencies

- none - can start immediately
- coordinates with agent 2 for output persistence patterns

## testing strategy

### unit tests
```typescript
describe('ChatService', () => {
  it('syncs messages from mastra memory', async () => {
    // mock mastra response
    // verify database updates
  });
  
  it('handles tool calls correctly', async () => {
    // test serialization
    // verify persistence
  });
});
```

### integration tests
```typescript
describe('Chat Memory Sync', () => {
  it('persists conversation across sessions', async () => {
    // create chat
    // send messages
    // reload page
    // verify messages persist
  });
});
```

### e2e tests
- test full conversation flow with page reloads
- verify working memory updates
- test tool call persistence

## security considerations

- ensure clerkId validation for all memory operations
- prevent cross-user memory access
- sanitize tool call results before storage
- audit memory access patterns

## effort estimate

**5-7 developer days**

### breakdown:
- day 1-2: analysis and sync architecture
- day 3-4: implementation of bidirectional sync
- day 5: tool call and working memory integration
- day 6-7: testing and migration

## success metrics

- [ ] 100% message persistence between sessions
- [ ] zero data loss on refresh
- [ ] tool calls properly displayed after reload
- [ ] working memory visible in ui
- [ ] <500ms sync latency
- [ ] backward compatibility maintained