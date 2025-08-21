# attachment processing architecture

## overview

arbor's attachment processing system is designed to handle file uploads in chat conversations, process them with RAG (retrieval-augmented generation), and make them searchable by the AI agent.

## architecture flow

```mermaid
graph TD
    A[user uploads attachment] --> B[chat UI]
    B --> C[/api/chat route]
    C --> D[attachment processing]
    D --> E[extract content]
    D --> F[determine type]
    D --> G[generate embeddings with fastembed]
    G --> H[store in pgvector]
    
    C --> I[call mastra agent]
    I --> J[agent needs to search]
    J --> K[attachment search proxy tool]
    K --> L[/api/attachments/search]
    L --> M[query pgvector]
    M --> N[return results to agent]
```

## components

### 1. main app attachment processing
**location**: `apps/app/src/app/api/chat/route.ts`

- receives attachments via `experimental_attachments` from vercel ai sdk
- extracts content from data urls
- determines file types (text, image, pdf, code)
- calls `AttachmentRAGService` to process and store

### 2. attachment rag service
**location**: `packages/api/services/rag/attachmentRag.ts`

- uses fastembed (bge small model) for free embeddings
- chunks large documents
- stores embeddings in pgvector (384 dimensions)
- provides semantic search capabilities

### 3. ai service attachment search
**location**: `apps/ai/src/mastra/tools/attachment-search-proxy.ts`

- proxy tool that calls main app's api
- avoids workspace dependency issues
- maintains clean separation between services

### 4. attachment search api
**location**: `apps/app/src/app/api/attachments/search/route.ts`

- internal endpoint for ai service
- protected with `X-Internal-Request` header
- queries attachment embeddings
- returns formatted results

## key design decisions

### 1. processing in main app
attachments are processed in the main app's `/api/chat` route before calling the ai agent. this ensures:
- attachments are stored with the correct chat context
- embeddings are generated immediately
- no duplicate processing

### 2. proxy pattern for ai service
the ai service uses a proxy tool to search attachments via api. this:
- avoids workspace dependency issues during build
- maintains service separation
- allows independent deployment

### 3. fastembed over openai
using fastembed provides:
- free embeddings (no api costs)
- good performance (bge small model)
- 384-dimension vectors (vs 1536 for openai)
- local processing option

## database schema

```sql
-- attachment metadata
model Attachment {
  id        String   @id
  chatId    String
  messageId String
  type      String   -- 'text', 'image', 'document', 'code', 'pdf'
  name      String
  size      Int
  mimeType  String
  content   String?  @db.Text
  metadata  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime
}

-- attachment embeddings
model AttachmentEmbedding {
  id           String                      @id
  attachmentId String
  chunkIndex   Int                         @default(0)
  chunkText    String                      @db.Text
  embedding    Unsupported("vector(384)")? -- bge small dimension
  metadata     Json?
  createdAt    DateTime                    @default(now())
}
```

## configuration

### environment variables
```env
# main app
DATABASE_URL=postgresql://...

# ai service
MAIN_APP_URL=https://arbor-xyz.vercel.app
```

### pgvector setup
```sql
-- enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- create index for efficient search
CREATE INDEX ON attachment_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

## usage example

### 1. user uploads file
```typescript
// in chat ui
const { append } = useChat({
  api: '/api/chat',
  experimental_attachments: true,
});

append({
  role: 'user',
  content: 'analyze this document',
  experimental_attachments: [file],
});
```

### 2. processing in api
```typescript
// automatic in /api/chat route
// extracts content, generates embeddings, stores in db
```

### 3. agent searches attachments
```typescript
// in ai agent conversation
user: "what does the document say about typescript?"
agent: *uses searchAttachments tool*
agent: "based on the document you uploaded, typescript is..."
```

## best practices

1. **chunk size**: use 500-1000 tokens per chunk for optimal retrieval
2. **metadata**: store file type, keywords, and summaries
3. **security**: validate file types and sizes
4. **performance**: index embeddings for fast search
5. **cleanup**: implement retention policies for old attachments

## future improvements

1. **ocr for images**: extract text from image attachments
2. **pdf parsing**: better handling of complex pdf structures
3. **code analysis**: syntax-aware chunking for code files
4. **streaming**: process large files in chunks
5. **caching**: cache frequently accessed embeddings

the attachment processing system demonstrates arbor's engineering-first approach: robust, scalable, and built with the right tools for the job.