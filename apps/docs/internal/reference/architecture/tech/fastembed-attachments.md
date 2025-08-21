# fastembed attachment implementation

## overview

arbor uses fastembed for generating embeddings for file attachments in the ai service. this provides free, on-device embeddings that work when deployed to mastra cloud.

## architecture

### 1. main app (apps/app)
- handles file uploads in chat ui
- processes attachments and extracts text content
- stores attachments in database via `attachmentRagSimple` service
- sends attachment content to ai service for embedding generation (when not on localhost)

### 2. ai service (apps/ai)
- uses `@mastra/fastembed` for local embedding generation
- stores embeddings in mastra memory with pgvector
- provides semantic search through attachment search tool
- works seamlessly when deployed to mastra cloud

## key components

### attachment-embeddings.ts
```typescript
import { fastembed } from '@mastra/fastembed';
import { embed, embedMany } from 'ai';

export async function generateAttachmentEmbedding(text: string) {
  const { embedding } = await embed({
    model: fastembed,
    value: text,
  });
  return embedding;
}
```

### attachment-rag.ts
```typescript
export const attachmentMemory = new Memory({
  storage: new PostgresStore({ connectionString: DATABASE_URL }),
  vector: new PgVector({ connectionString: DATABASE_URL }),
  embedder: fastembed,
  options: {
    semanticRecall: { topK: 5, scope: 'thread' }
  }
});
```

### attachment search tool
- integrated into chat agent
- performs semantic search using fastembed embeddings
- returns relevant attachment chunks based on user queries

## deployment notes

- fastembed works on mastra cloud without issues
- no api keys required (runs locally)
- embeddings are generated on-demand
- pgvector stores embeddings for fast retrieval

## benefits

1. **free**: no api costs for embeddings
2. **private**: embeddings generated locally
3. **fast**: no network latency
4. **reliable**: works offline once model is cached

## limitations

1. **size**: fastembed has large dependencies (~500mb)
2. **vercel**: doesn't work on vercel (native modules)
3. **quality**: may not match openai embeddings quality

## future improvements

- implement chunking for large documents
- add support for pdf/image embeddings
- optimize embedding generation with batching
- add caching layer for frequently accessed attachments