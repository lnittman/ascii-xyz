# Memory & Persistence Architecture

## Overview

The Memory & Persistence system in Arbor provides agents with both short-term working memory and long-term semantic memory capabilities. This architecture enables agents to maintain context across conversations, learn from interactions, and provide more personalized and coherent responses.

## Memory System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Memory System Overview                      │
├─────────────────────────┬────────────────────┬─────────────────┤
│    Working Memory       │  Long-term Memory  │  Memory Index   │
│  ┌────────────────┐    │ ┌────────────────┐│┌───────────────┐│
│  │ Conversation   │    │ │  Conversations ││ Vector DB     ││
│  │   Context      │    │ │    History     ││ (pgvector)    ││
│  └────────────────┘    │ └────────────────┘│└───────────────┘│
│  ┌────────────────┐    │ ┌────────────────┐│┌───────────────┐│
│  │  Active Tools  │    │ │   Knowledge    ││ Semantic      ││
│  │   & Results    │    │ │     Base       ││  Search       ││
│  └────────────────┘    │ └────────────────┘│└───────────────┘│
│  ┌────────────────┐    │ ┌────────────────┐│┌───────────────┐│
│  │   Temporary    │    │ │    Learned     ││  Memory       ││
│  │    State       │    │ │   Patterns     ││ Processors    ││
│  └────────────────┘    │ └────────────────┘│└───────────────┘│
└─────────────────────────┴────────────────────┴─────────────────┘
```

## Core Components

### 1. Working Memory

Working memory maintains the active context during an agent session.

```typescript
// Working memory structure
interface WorkingMemory {
  threadId: string;
  agentId: string;
  
  // Current conversation context
  conversation: {
    messages: Message[];
    currentTopic: string;
    entities: Entity[];
    sentiment: SentimentAnalysis;
  };
  
  // Active tool context
  tools: {
    active: ActiveTool[];
    results: ToolResult[];
    pending: PendingOperation[];
  };
  
  // Temporary state
  state: {
    variables: Map<string, any>;
    flags: Set<string>;
    counters: Map<string, number>;
  };
  
  // Memory metadata
  metadata: {
    created: Date;
    lastAccessed: Date;
    accessCount: number;
    importance: number;
  };
}

// Working memory manager
class WorkingMemoryManager {
  private store: RedisStore;
  private ttl: number = 3600; // 1 hour default
  
  async get(threadId: string): Promise<WorkingMemory | null> {
    const key = `working_memory:${threadId}`;
    const data = await this.store.get(key);
    
    if (!data) return null;
    
    // Update access metadata
    await this.updateAccessMetadata(threadId);
    
    return JSON.parse(data);
  }
  
  async update(threadId: string, updates: Partial<WorkingMemory>): Promise<void> {
    const current = await this.get(threadId) || this.createNew(threadId);
    const updated = this.mergeUpdates(current, updates);
    
    // Apply memory constraints
    const constrained = this.applyConstraints(updated);
    
    await this.store.set(
      `working_memory:${threadId}`,
      JSON.stringify(constrained),
      this.ttl
    );
  }
  
  private applyConstraints(memory: WorkingMemory): WorkingMemory {
    // Limit conversation history
    if (memory.conversation.messages.length > 50) {
      memory.conversation.messages = [
        ...memory.conversation.messages.slice(0, 5), // Keep first 5
        ...memory.conversation.messages.slice(-40), // Keep last 40
      ];
    }
    
    // Limit state size
    if (memory.state.variables.size > 100) {
      // Remove least recently used variables
      memory.state.variables = this.pruneVariables(memory.state.variables);
    }
    
    return memory;
  }
}
```

### 2. Long-term Memory

Long-term memory provides persistent storage with semantic search capabilities.

```typescript
// Long-term memory entry
interface MemoryEntry {
  id: string;
  agentId: string;
  userId: string;
  threadId: string;
  
  // Content
  content: {
    raw: string;
    summary: string;
    type: 'conversation' | 'knowledge' | 'pattern';
  };
  
  // Semantic data
  semantic: {
    embedding: number[];
    entities: Entity[];
    topics: string[];
    keywords: string[];
  };
  
  // Relationships
  relations: {
    references: string[]; // Other memory IDs
    contradicts: string[];
    supports: string[];
  };
  
  // Metadata
  metadata: {
    timestamp: Date;
    source: 'user' | 'agent' | 'tool' | 'system';
    confidence: number;
    importance: number;
    accessCount: number;
    lastAccessed: Date;
  };
}

// Long-term memory service
class LongTermMemoryService {
  private db: DatabaseClient;
  private vectorStore: VectorStore;
  private embedder: EmbeddingService;
  
  async store(entry: MemoryInput): Promise<MemoryEntry> {
    // 1. Generate embedding
    const embedding = await this.embedder.embed(entry.content);
    
    // 2. Extract semantic information
    const semantic = await this.extractSemanticInfo(entry.content);
    
    // 3. Find related memories
    const relations = await this.findRelations(embedding, semantic);
    
    // 4. Create memory entry
    const memory: MemoryEntry = {
      id: generateId(),
      agentId: entry.agentId,
      userId: entry.userId,
      threadId: entry.threadId,
      content: {
        raw: entry.content,
        summary: await this.summarize(entry.content),
        type: this.classifyContent(entry.content),
      },
      semantic: {
        embedding,
        ...semantic,
      },
      relations,
      metadata: {
        timestamp: new Date(),
        source: entry.source,
        confidence: entry.confidence || 1.0,
        importance: this.calculateImportance(entry, semantic),
        accessCount: 0,
        lastAccessed: new Date(),
      },
    };
    
    // 5. Store in database
    await this.db.memories.create(memory);
    
    // 6. Index in vector store
    await this.vectorStore.index(memory.id, embedding, {
      agentId: memory.agentId,
      userId: memory.userId,
      type: memory.content.type,
    });
    
    return memory;
  }
  
  async search(query: MemoryQuery): Promise<MemorySearchResult[]> {
    // 1. Generate query embedding
    const queryEmbedding = await this.embedder.embed(query.text);
    
    // 2. Vector search
    const vectorResults = await this.vectorStore.search({
      vector: queryEmbedding,
      filter: {
        agentId: query.agentId,
        userId: query.userId,
        type: query.type,
      },
      limit: query.limit || 10,
      threshold: query.threshold || 0.7,
    });
    
    // 3. Load full memories
    const memories = await this.db.memories.findMany({
      where: {
        id: { in: vectorResults.map(r => r.id) },
      },
    });
    
    // 4. Re-rank based on additional factors
    const ranked = this.rerank(memories, query);
    
    // 5. Update access metadata
    await this.updateAccessMetadata(ranked.map(m => m.id));
    
    return ranked;
  }
  
  private calculateImportance(entry: MemoryInput, semantic: SemanticInfo): number {
    let importance = 0.5; // Base importance
    
    // Adjust based on source
    if (entry.source === 'user') importance += 0.2;
    if (entry.source === 'tool') importance += 0.1;
    
    // Adjust based on entities
    importance += Math.min(semantic.entities.length * 0.05, 0.2);
    
    // Adjust based on sentiment
    if (Math.abs(semantic.sentiment.score) > 0.7) importance += 0.1;
    
    return Math.min(importance, 1.0);
  }
}
```

### 3. Memory Processors

Memory processors extract and organize information from raw content.

```typescript
// Memory processor pipeline
class MemoryProcessorPipeline {
  private processors: MemoryProcessor[] = [
    new EntityExtractor(),
    new TopicClassifier(),
    new SentimentAnalyzer(),
    new KeywordExtractor(),
    new SummaryGenerator(),
    new RelationDetector(),
  ];
  
  async process(content: string, context: ProcessingContext): Promise<ProcessedMemory> {
    let result: ProcessedMemory = {
      content,
      entities: [],
      topics: [],
      keywords: [],
      summary: '',
      sentiment: { score: 0, label: 'neutral' },
      relations: [],
    };
    
    // Run processors in sequence
    for (const processor of this.processors) {
      result = await processor.process(result, context);
    }
    
    return result;
  }
}

// Entity extraction processor
class EntityExtractor implements MemoryProcessor {
  async process(memory: ProcessedMemory, context: ProcessingContext): Promise<ProcessedMemory> {
    const entities = await this.extractEntities(memory.content);
    
    // Merge with existing entities
    const merged = this.mergeEntities(memory.entities, entities);
    
    // Resolve entity references
    const resolved = await this.resolveReferences(merged, context);
    
    return {
      ...memory,
      entities: resolved,
    };
  }
  
  private async extractEntities(text: string): Promise<Entity[]> {
    // Use NER model to extract entities
    const ner = await this.nerModel.process(text);
    
    return ner.entities.map(e => ({
      id: generateId(),
      text: e.text,
      type: e.label,
      confidence: e.score,
      positions: e.positions,
      metadata: {},
    }));
  }
}

// Summary generation processor
class SummaryGenerator implements MemoryProcessor {
  async process(memory: ProcessedMemory, context: ProcessingContext): Promise<ProcessedMemory> {
    // Generate concise summary
    const summary = await this.llm.complete({
      messages: [
        {
          role: 'system',
          content: 'Generate a concise summary of the following content, preserving key information.',
        },
        {
          role: 'user',
          content: memory.content,
        },
      ],
      maxTokens: 100,
    });
    
    return {
      ...memory,
      summary: summary.content,
    };
  }
}
```

### 4. Vector Storage

Vector storage enables semantic search across memories.

```typescript
// Vector store implementation using pgvector
class PgVectorStore implements VectorStore {
  private pool: Pool;
  
  async createTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS memory_vectors (
        id UUID PRIMARY KEY,
        agent_id UUID NOT NULL,
        user_id UUID NOT NULL,
        embedding vector(1536) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        
        INDEX idx_agent_user (agent_id, user_id),
        INDEX idx_embedding_cosine (embedding vector_cosine_ops)
      );
    `);
  }
  
  async index(id: string, embedding: number[], metadata: any): Promise<void> {
    await this.pool.query(
      `INSERT INTO memory_vectors (id, agent_id, user_id, embedding, metadata)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE
       SET embedding = EXCLUDED.embedding,
           metadata = EXCLUDED.metadata`,
      [id, metadata.agentId, metadata.userId, embedding, metadata]
    );
  }
  
  async search(params: VectorSearchParams): Promise<VectorSearchResult[]> {
    // Build filter conditions
    const conditions = ['1=1'];
    const values = [params.vector, params.limit];
    let paramIndex = 3;
    
    if (params.filter?.agentId) {
      conditions.push(`agent_id = $${paramIndex++}`);
      values.push(params.filter.agentId);
    }
    
    if (params.filter?.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      values.push(params.filter.userId);
    }
    
    // Perform similarity search
    const result = await this.pool.query(
      `SELECT id, 1 - (embedding <=> $1) as similarity, metadata
       FROM memory_vectors
       WHERE ${conditions.join(' AND ')}
         AND 1 - (embedding <=> $1) > ${params.threshold || 0.7}
       ORDER BY embedding <=> $1
       LIMIT $2`,
      values
    );
    
    return result.rows.map(row => ({
      id: row.id,
      similarity: row.similarity,
      metadata: row.metadata,
    }));
  }
}
```

## Memory Management

### 1. Memory Lifecycle

```typescript
// Memory lifecycle management
class MemoryLifecycleManager {
  private scheduler: JobScheduler;
  
  async initialize(): Promise<void> {
    // Schedule regular maintenance jobs
    this.scheduler.schedule('0 */6 * * *', this.pruneOldMemories.bind(this));
    this.scheduler.schedule('0 2 * * *', this.consolidateMemories.bind(this));
    this.scheduler.schedule('0 4 * * 0', this.reindexMemories.bind(this));
  }
  
  private async pruneOldMemories(): Promise<void> {
    // Remove memories older than retention period
    const retentionDate = new Date();
    retentionDate.setMonth(retentionDate.getMonth() - 6);
    
    // Keep important memories regardless of age
    await this.db.memories.deleteMany({
      where: {
        AND: [
          { metadata: { timestamp: { lt: retentionDate } } },
          { metadata: { importance: { lt: 0.7 } } },
          { metadata: { accessCount: { lt: 5 } } },
        ],
      },
    });
  }
  
  private async consolidateMemories(): Promise<void> {
    // Find similar memories and consolidate
    const agents = await this.db.agents.findMany();
    
    for (const agent of agents) {
      const memories = await this.db.memories.findMany({
        where: { agentId: agent.id },
        orderBy: { 'metadata.timestamp': 'desc' },
      });
      
      const consolidated = await this.consolidateSimilar(memories);
      await this.replaceMemories(memories, consolidated);
    }
  }
  
  private async consolidateSimilar(memories: MemoryEntry[]): Promise<MemoryEntry[]> {
    const groups = await this.clusterMemories(memories);
    const consolidated: MemoryEntry[] = [];
    
    for (const group of groups) {
      if (group.length === 1) {
        consolidated.push(group[0]);
      } else {
        // Merge similar memories
        const merged = await this.mergeMemories(group);
        consolidated.push(merged);
      }
    }
    
    return consolidated;
  }
}
```

### 2. Memory Optimization

```typescript
// Memory optimization strategies
class MemoryOptimizer {
  // Compression for storage efficiency
  async compressMemory(memory: MemoryEntry): Promise<CompressedMemory> {
    return {
      ...memory,
      content: {
        ...memory.content,
        raw: await this.compress(memory.content.raw),
      },
      semantic: {
        ...memory.semantic,
        embedding: this.quantizeEmbedding(memory.semantic.embedding),
      },
    };
  }
  
  // Quantize embeddings to reduce storage
  private quantizeEmbedding(embedding: number[]): Int8Array {
    // Convert float32 to int8 with minimal loss
    const scale = 127 / Math.max(...embedding.map(Math.abs));
    return new Int8Array(embedding.map(v => Math.round(v * scale)));
  }
  
  // Adaptive memory loading
  async loadMemoriesAdaptive(
    query: MemoryQuery,
    context: LoadContext
  ): Promise<MemoryEntry[]> {
    // Determine loading strategy based on context
    const strategy = this.selectStrategy(context);
    
    switch (strategy) {
      case 'eager':
        // Load all relevant memories
        return await this.loadAll(query);
        
      case 'lazy':
        // Load only summaries first
        const summaries = await this.loadSummaries(query);
        return await this.expandAsNeeded(summaries, context);
        
      case 'progressive':
        // Load in chunks as needed
        return await this.loadProgressive(query, context);
    }
  }
}
```

## Memory Queries

### 1. Query Language

```typescript
// Memory query DSL
interface MemoryQueryDSL {
  // Text search
  text?: string;
  
  // Filters
  filter?: {
    agentId?: string;
    userId?: string;
    threadId?: string;
    type?: MemoryType;
    timeRange?: {
      start?: Date;
      end?: Date;
    };
    importance?: {
      min?: number;
      max?: number;
    };
  };
  
  // Semantic search
  semantic?: {
    similar_to?: string;
    entities?: string[];
    topics?: string[];
    sentiment?: SentimentFilter;
  };
  
  // Aggregations
  aggregations?: {
    topics?: boolean;
    entities?: boolean;
    timeline?: boolean;
  };
  
  // Options
  options?: {
    limit?: number;
    offset?: number;
    includeRelated?: boolean;
    expandReferences?: boolean;
  };
}

// Query executor
class MemoryQueryExecutor {
  async execute(query: MemoryQueryDSL): Promise<MemoryQueryResult> {
    // Build execution plan
    const plan = this.buildExecutionPlan(query);
    
    // Execute query stages
    let results: MemoryEntry[] = [];
    
    for (const stage of plan.stages) {
      results = await this.executeStage(stage, results);
    }
    
    // Apply aggregations if requested
    const aggregations = query.aggregations 
      ? await this.aggregate(results, query.aggregations)
      : undefined;
    
    return {
      memories: results,
      total: await this.countTotal(query),
      aggregations,
    };
  }
}
```

### 2. Memory Retrieval Strategies

```typescript
// Different retrieval strategies for different use cases
class MemoryRetrievalStrategy {
  // Recency-weighted retrieval
  async retrieveRecent(
    agentId: string,
    limit: number = 10
  ): Promise<MemoryEntry[]> {
    return await this.db.memories.findMany({
      where: { agentId },
      orderBy: { 'metadata.timestamp': 'desc' },
      take: limit,
    });
  }
  
  // Importance-weighted retrieval
  async retrieveImportant(
    agentId: string,
    limit: number = 10
  ): Promise<MemoryEntry[]> {
    return await this.db.memories.findMany({
      where: { agentId },
      orderBy: { 'metadata.importance': 'desc' },
      take: limit,
    });
  }
  
  // Context-aware retrieval
  async retrieveContextual(
    agentId: string,
    context: string,
    limit: number = 10
  ): Promise<MemoryEntry[]> {
    // Combine semantic search with other factors
    const embedding = await this.embedder.embed(context);
    
    const candidates = await this.vectorStore.search({
      vector: embedding,
      filter: { agentId },
      limit: limit * 3, // Get more candidates
    });
    
    // Re-rank based on multiple factors
    const memories = await this.loadMemories(candidates.map(c => c.id));
    
    return this.rankByRelevance(memories, context, limit);
  }
  
  // Associative retrieval (follow references)
  async retrieveAssociative(
    startMemoryId: string,
    depth: number = 2,
    limit: number = 20
  ): Promise<MemoryEntry[]> {
    const visited = new Set<string>();
    const queue = [{ id: startMemoryId, depth: 0 }];
    const results: MemoryEntry[] = [];
    
    while (queue.length > 0 && results.length < limit) {
      const { id, depth: currentDepth } = queue.shift()!;
      
      if (visited.has(id) || currentDepth > depth) continue;
      visited.add(id);
      
      const memory = await this.db.memories.findUnique({ where: { id } });
      if (!memory) continue;
      
      results.push(memory);
      
      // Add related memories to queue
      if (currentDepth < depth) {
        for (const relatedId of memory.relations.references) {
          queue.push({ id: relatedId, depth: currentDepth + 1 });
        }
      }
    }
    
    return results;
  }
}
```

## Integration with Agents

### 1. Memory-Augmented Generation

```typescript
// Integration with agent execution
class MemoryAugmentedAgent {
  private memoryService: MemoryService;
  private agent: Agent;
  
  async execute(input: AgentInput): Promise<AgentOutput> {
    // 1. Load working memory
    const workingMemory = await this.memoryService.getWorkingMemory(input.threadId);
    
    // 2. Retrieve relevant long-term memories
    const relevantMemories = await this.retrieveRelevantMemories(input, workingMemory);
    
    // 3. Build augmented context
    const context = this.buildAugmentedContext(input, workingMemory, relevantMemories);
    
    // 4. Execute agent with memory context
    const response = await this.agent.execute(context);
    
    // 5. Update memories
    await this.updateMemories(input, response, workingMemory);
    
    return response;
  }
  
  private async retrieveRelevantMemories(
    input: AgentInput,
    workingMemory: WorkingMemory
  ): Promise<MemoryEntry[]> {
    // Combine multiple retrieval strategies
    const strategies = [
      // Semantic similarity to current input
      this.memoryService.searchSemantic(input.message, 5),
      
      // Recent memories from this thread
      this.memoryService.getRecent(input.threadId, 5),
      
      // Memories with mentioned entities
      this.memoryService.searchByEntities(
        this.extractEntities(input.message),
        5
      ),
    ];
    
    const results = await Promise.all(strategies);
    
    // Deduplicate and rank
    return this.deduplicateAndRank(results.flat());
  }
}
```

## Performance Considerations

### 1. Caching Strategy

```typescript
// Multi-level memory cache
class MemoryCache {
  private l1Cache: LRUCache<string, MemoryEntry>; // In-memory
  private l2Cache: RedisCache; // Redis
  
  async get(id: string): Promise<MemoryEntry | null> {
    // Check L1 cache
    const l1Result = this.l1Cache.get(id);
    if (l1Result) return l1Result;
    
    // Check L2 cache
    const l2Result = await this.l2Cache.get(id);
    if (l2Result) {
      this.l1Cache.set(id, l2Result);
      return l2Result;
    }
    
    // Load from database
    const dbResult = await this.db.memories.findUnique({ where: { id } });
    if (dbResult) {
      await this.populateCaches(id, dbResult);
    }
    
    return dbResult;
  }
}
```

### 2. Batch Operations

```typescript
// Batch memory operations for efficiency
class MemoryBatchProcessor {
  private batchQueue: Map<string, MemoryOperation[]> = new Map();
  private batchInterval: number = 100; // ms
  
  async queueOperation(operation: MemoryOperation): Promise<void> {
    const batchKey = this.getBatchKey(operation);
    
    if (!this.batchQueue.has(batchKey)) {
      this.batchQueue.set(batchKey, []);
      setTimeout(() => this.processBatch(batchKey), this.batchInterval);
    }
    
    this.batchQueue.get(batchKey)!.push(operation);
  }
  
  private async processBatch(batchKey: string): Promise<void> {
    const operations = this.batchQueue.get(batchKey);
    if (!operations || operations.length === 0) return;
    
    this.batchQueue.delete(batchKey);
    
    // Process operations in batch
    await this.executeBatch(operations);
  }
}
```

## Best Practices

1. **Memory Hygiene**: Regular pruning and consolidation
2. **Semantic Richness**: Store rich metadata for better retrieval
3. **Privacy First**: User-specific memory isolation
4. **Efficient Indexing**: Proper vector indexing for fast search
5. **Graceful Degradation**: Handle memory service failures

## Future Enhancements

1. **Episodic Memory**: Story-like memory organization
2. **Emotional Memory**: Sentiment-aware memory storage
3. **Collaborative Memory**: Shared memories between agents
4. **Memory Visualization**: Tools to explore agent memories
5. **Adaptive Forgetting**: Intelligent memory pruning based on usage