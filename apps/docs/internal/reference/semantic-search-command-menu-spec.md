# semantic search command menu specification

## overview

enhance the existing command menu with semantic search capabilities using mastra rag to find relevant content across chats, messages, and attachments using natural language queries.

## current state

the command menu (`/apps/app/src/components/layout/modal/command-menu/`) currently uses simple text-based filtering:
- searches chat titles with `includes()` string matching
- no context-aware or semantic search
- limited to exact substring matches

## proposed architecture

### 1. vector storage structure

```typescript
// separate indexes for different content types
const indexes = {
  "chat_messages": {
    dimension: 1536,
    metadata: {
      chatId: string,
      messageId: string, 
      role: 'user' | 'assistant',
      createdAt: Date,
      userId: string
    }
  },
  "chat_summaries": {
    dimension: 1536,
    metadata: {
      chatId: string,
      title: string,
      lastActive: Date,
      messageCount: number,
      userId: string
    }
  },
  "attachments": {
    dimension: 1536,
    metadata: {
      attachmentId: string,
      chatId: string,
      fileName: string,
      fileType: string,
      userId: string
    }
  }
};
```

### 2. search service

```typescript
// packages/api/services/rag/searchService.ts
export class SemanticSearchService {
  async searchAll(userId: string, query: string, options?: {
    limit?: number;
    includeMessages?: boolean;
    includeAttachments?: boolean;
    includeSummaries?: boolean;
  }) {
    // generate query embedding
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query
    });
    
    // search across multiple indexes in parallel
    const [messages, summaries, attachments] = await Promise.all([
      options?.includeMessages !== false ? 
        this.searchMessages(userId, embedding, options?.limit) : [],
      options?.includeSummaries !== false ?
        this.searchSummaries(userId, embedding, options?.limit) : [],
      options?.includeAttachments !== false ?
        this.searchAttachments(userId, embedding, options?.limit) : []
    ]);
    
    // merge and rank results
    return this.mergeResults(messages, summaries, attachments);
  }
  
  private mergeResults(messages: any[], summaries: any[], attachments: any[]) {
    // combine results with type indicators
    const allResults = [
      ...messages.map(m => ({ ...m, type: 'message' })),
      ...summaries.map(s => ({ ...s, type: 'summary' })),
      ...attachments.map(a => ({ ...a, type: 'attachment' }))
    ];
    
    // sort by relevance score
    return allResults.sort((a, b) => b.score - a.score);
  }
}
```

### 3. background indexing

```typescript
// packages/api/services/rag/indexingService.ts
export class IndexingService {
  async indexNewMessage(message: {
    id: string,
    chatId: string,
    content: string,
    role: string,
    userId: string
  }) {
    // chunk if message is long
    const doc = MDocument.fromText(message.content);
    const chunks = await doc.chunk({
      strategy: "recursive",
      size: 512,
      overlap: 50
    });
    
    // generate embeddings
    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: chunks.map(c => c.text)
    });
    
    // store in vector db
    await vectorStore.upsert({
      indexName: "chat_messages",
      vectors: embeddings,
      metadata: chunks.map(chunk => ({
        messageId: message.id,
        chatId: message.chatId,
        role: message.role,
        userId: message.userId,
        text: chunk.text
      }))
    });
  }
  
  async indexChatSummary(chatId: string) {
    // get recent messages
    const messages = await db.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    // generate summary using llm
    const summary = await generateChatSummary(messages);
    
    // create embedding for summary
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: summary
    });
    
    // store summary embedding
    await vectorStore.upsert({
      indexName: "chat_summaries",
      vectors: [embedding],
      metadata: [{
        chatId,
        summary,
        messageCount: messages.length,
        lastActive: messages[0]?.createdAt
      }]
    });
  }
}
```

### 4. api endpoint

```typescript
// apps/app/src/app/api/search/route.ts
export const POST = withAuthenticatedUser(async (req, { user }) => {
  const { query, options } = await req.json();
  
  const searchService = getSemanticSearchService();
  const results = await searchService.searchAll(
    user.id,
    query,
    options
  );
  
  // enrich results with full data
  const enrichedResults = await Promise.all(
    results.map(async (result) => {
      switch (result.type) {
        case 'message':
          const message = await db.message.findUnique({
            where: { id: result.metadata.messageId },
            include: { chat: true }
          });
          return { ...result, data: message };
          
        case 'summary':
          const chat = await db.chat.findUnique({
            where: { id: result.metadata.chatId }
          });
          return { ...result, data: chat };
          
        case 'attachment':
          const attachment = await db.attachment.findUnique({
            where: { id: result.metadata.attachmentId },
            include: { chat: true }
          });
          return { ...result, data: attachment };
      }
    })
  );
  
  return NextResponse.json({ results: enrichedResults });
});
```

### 5. ui component updates

```typescript
// apps/app/src/components/layout/modal/command-menu/index.tsx
export function CommandMenu() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'semantic'>('text');
  
  // debounced semantic search
  const performSemanticSearch = useDebouncedCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 3) return;
      
      setIsSearching(true);
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: searchQuery,
            options: {
              limit: 10,
              includeMessages: true,
              includeAttachments: true,
              includeSummaries: true
            }
          })
        });
        
        const { results } = await response.json();
        setResults(results);
      } finally {
        setIsSearching(false);
      }
    },
    500 // 500ms debounce
  );
  
  // switch between search modes
  useEffect(() => {
    if (searchMode === 'semantic' && query.length >= 3) {
      performSemanticSearch(query);
    } else if (searchMode === 'text') {
      // existing text search logic
      performTextSearch(query);
    }
  }, [query, searchMode]);
  
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2 p-2 border-b">
        <CommandInput
          placeholder={searchMode === 'semantic' 
            ? "ask anything about your chats..." 
            : "search chats..."
          }
          value={query}
          onValueChange={setQuery}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSearchMode(prev => 
            prev === 'text' ? 'semantic' : 'text'
          )}
        >
          {searchMode === 'semantic' ? (
            <Brain className="h-4 w-4" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <CommandList>
        {isSearching && (
          <div className="p-4 text-center">
            <Spinner />
            searching semantically...
          </div>
        )}
        
        {!isSearching && results.map((result) => (
          <SearchResultItem
            key={result.id}
            result={result}
            onClick={() => navigateToResult(result)}
          />
        ))}
      </CommandList>
    </CommandDialog>
  );
}
```

### 6. search result components

```typescript
// components for different result types
function SearchResultItem({ result, onClick }: {
  result: SearchResult;
  onClick: () => void;
}) {
  switch (result.type) {
    case 'message':
      return (
        <CommandItem onSelect={onClick}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">{result.data.chat.title}</span>
              <Badge variant="secondary" className="text-xs">
                {result.score.toFixed(2)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {highlightMatch(result.metadata.text, query)}
            </p>
          </div>
        </CommandItem>
      );
      
    case 'attachment':
      return (
        <CommandItem onSelect={onClick}>
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            <span>{result.data.name}</span>
            <span className="text-xs text-muted-foreground">
              in {result.data.chat.title}
            </span>
          </div>
        </CommandItem>
      );
      
    case 'summary':
      return (
        <CommandItem onSelect={onClick}>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{result.data.title}</span>
            <span className="text-xs text-muted-foreground">
              {result.data.messageCount} messages
            </span>
          </div>
        </CommandItem>
      );
  }
}
```

## implementation phases

### phase 1: basic semantic search
- implement search service with message indexing
- add api endpoint for semantic search
- update command menu ui with toggle

### phase 2: advanced features
- add chat summaries for better overview search
- implement attachment search
- add filters (date range, chat type, etc.)

### phase 3: optimization
- background indexing jobs
- incremental updates
- caching layer for common queries
- search result ranking improvements

### phase 4: user experience
- search suggestions based on history
- "similar to this chat" feature
- export search results
- saved searches

## performance considerations

### indexing strategy
- index messages on creation (async)
- batch index existing messages
- periodic re-indexing for accuracy

### search optimization
- cache embeddings for common queries
- use hybrid search (combine semantic + keyword)
- limit vector search scope by date/user

### storage efficiency
- compress old embeddings
- archive inactive chat vectors
- use quantization for less critical content

## privacy & security

### data isolation
- user-scoped indexes
- no cross-user search possible
- encrypted vector storage

### content filtering
- exclude sensitive messages
- respect message deletion
- audit search queries

## success metrics

### search quality
- relevance score tracking
- click-through rates
- user feedback on results

### performance
- search latency < 500ms
- indexing throughput
- vector storage growth rate

### user adoption
- % users using semantic search
- queries per user
- search mode preference

## future enhancements

### ai-powered features
- query expansion (understand intent)
- multi-lingual search
- voice search integration

### advanced search
- search by emotion/sentiment
- find similar conversations
- timeline-based search

### integrations
- search across connected tools
- unified search with projects
- api for external search

this semantic search implementation will transform the command menu from a simple title matcher to a powerful knowledge retrieval system, making it easy for users to find any information across their entire chat history using natural language queries.