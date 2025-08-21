# attachment embeddings implementation guide

*"embeddings in ai service, seamless integration"*

## overview

this guide explains how attachments work with embeddings in arbor, following a hybrid approach that balances simplicity with advanced features.

## current implementation (phase 1)

### data flow
1. user uploads attachment in chat ui
2. main app extracts content and stores in database
3. full content sent directly to chat agent
4. agent can access attachments immediately

### benefits
- works immediately without complex setup
- no build issues with native modules
- simple and reliable

## embeddings implementation (phase 2)

### architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   chat ui       │     │   main app      │     │   ai service    │
│                 │     │                 │     │                 │
│ upload file ────┼────▶│ store in db     │     │ generate        │
│                 │     │                 │◀────┤ embeddings      │
│                 │     │ api endpoint    │     │                 │
│                 │     │ /attachments/   │     │ search with     │
│                 │     │ search          │     │ vector sim      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### key components

#### 1. embedding generation (ai service)
```typescript
// apps/ai/src/embeddings/attachment-embeddings.ts
export async function generateAttachmentEmbedding(text: string) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  return embedding;
}
```

#### 2. attachment search tool (ai service)
```typescript
// apps/ai/src/mastra/tools/attachment-search.ts
export const attachmentSearchTool = createTool({
  execute: async ({ context, threadId }) => {
    // generate embedding for query
    const queryEmbedding = await generateAttachmentEmbedding(context.query);
    
    // call main app api with embedding
    const response = await fetch(`${apiUrl}/api/attachments/search`, {
      body: JSON.stringify({
        chatId,
        query: context.query,
        queryEmbedding, // pass embedding
        topK: 5,
      }),
    });
  },
});
```

#### 3. search endpoint (main app)
```typescript
// apps/app/src/app/api/attachments/search/route.ts
const searchResults = queryEmbedding 
  ? await attachmentService.searchAttachmentsWithEmbedding(
      chatId,
      queryEmbedding,
      topK
    )
  : await attachmentService.searchAttachments(
      chatId,
      query,
      topK
    );
```

### token counting ui

attachments now display token counts:
```typescript
// apps/app/src/utils/tokenCounter.ts
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.75);
}

// displayed in ui as: "document.pdf • 2.5k tokens"
```

## migration path

### phase 1 → phase 2

1. **add pgvector extension**
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ALTER TABLE "Attachment" ADD COLUMN embedding vector(1536);
   ```

2. **background job for embeddings**
   ```typescript
   // process new attachments
   async function processAttachmentEmbeddings(attachmentId: string) {
     const attachment = await db.attachment.findUnique({ where: { id: attachmentId } });
     if (attachment.content && !attachment.embedding) {
       const embedding = await generateAttachmentEmbedding(attachment.content);
       await db.attachment.update({
         where: { id: attachmentId },
         data: { embedding }
       });
     }
   }
   ```

3. **update search to use vectors**
   ```typescript
   async searchAttachmentsWithEmbedding(chatId: string, queryEmbedding: number[], topK: number) {
     const result = await db.$queryRaw`
       SELECT *, (embedding <=> ${queryEmbedding}::vector) as distance
       FROM "Attachment"
       WHERE "chatId" = ${chatId}
       ORDER BY distance
       LIMIT ${topK}
     `;
     return result;
   }
   ```

## why this approach?

### avoids native module issues
- fastembed uses onnxruntime (c++ bindings)
- next.js can't bundle .node files
- vercel builds fail with native modules

### clean separation
- ai service handles ml operations
- main app handles data storage
- clear api boundaries

### progressive enhancement
- start simple (direct context)
- add embeddings when needed
- no breaking changes

## usage patterns

### when to use direct context
- single document analysis
- small attachments (<10k tokens)
- immediate processing needed

### when to use embeddings
- searching across many documents
- large knowledge bases
- semantic similarity needed
- finding specific information

## monitoring

track these metrics:
- attachment upload count
- average token count
- search query performance
- embedding generation time

## future enhancements

1. **chunking strategies**
   - split large documents
   - overlap for context
   - metadata preservation

2. **hybrid search**
   - combine text + vector search
   - keyword boosting
   - relevance tuning

3. **caching layer**
   - cache frequent queries
   - pre-compute common embeddings
   - reduce api calls

this implementation follows arbor's principles: start simple, add complexity only when needed, maintain clean boundaries.