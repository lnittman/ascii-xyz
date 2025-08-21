# attachment architecture decision

*"embeddings in ai service, simple context in main app"*

## decision: hybrid attachment approach

after researching claude's implementation and mastra's capabilities, we're implementing a hybrid approach that balances simplicity with advanced features.

### architecture overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   main app      │     │   ai service    │     │    database     │
│                 │     │                 │     │                 │
│ • file upload   │────▶│ • embeddings    │────▶│ • attachment    │
│ • base64 encode │     │ • vector search │     │   table         │
│ • token count   │◀────│ • semantic rag  │     │ • pgvector      │
│ • ui display    │     │                 │     │   (future)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### implementation phases

#### phase 1: direct context (current)
- attachments stored in database without embeddings
- full content sent to chat agent
- works like claude's approach
- no build issues, immediate value

#### phase 2: embeddings in ai service (next)
- ai service generates embeddings using openai
- stores vectors in pgvector
- enables semantic search across attachments
- avoids next.js native module issues

### key decisions

1. **no fastembed** - causes vercel build failures with native modules
2. **openai embeddings** - reliable, no build issues, already configured
3. **proxy pattern** - ai service calls main app api for attachment search
4. **token counting** - display in ui for transparency

### benefits

- **immediate functionality** - attachments work now without embeddings
- **future-proof** - can add embeddings without breaking changes
- **clean separation** - ai service handles complex ml operations
- **production-ready** - no native module build issues

### implementation details

#### token counting (ui feature)
```typescript
// simple token estimation for display
export function estimateTokens(text: string): number {
  // rough estimate: ~4 chars per token
  return Math.ceil(text.length / 4);
}

// more accurate with tiktoken
import { encoding_for_model } from 'tiktoken';
const encoder = encoding_for_model('gpt-4');
export function countTokens(text: string): number {
  return encoder.encode(text).length;
}
```

#### attachment processing flow
1. user uploads file in promptbar
2. main app extracts text/converts to base64
3. stores in attachment table with token count
4. sends full content to chat agent (phase 1)
5. ai service generates embeddings async (phase 2)

#### when to use embeddings vs direct context

**use direct context when:**
- single document analysis
- document under 50k tokens
- real-time processing needed
- avoiding complexity

**use embeddings when:**
- searching across multiple documents
- documents over 50k tokens
- building knowledge base
- semantic similarity needed

### migration path

current simple implementation allows smooth migration:
1. keep attachment table schema
2. add embedding generation in ai service
3. add vector search tool to agent
4. agent automatically uses both approaches

this follows the teenage engineering principle: start simple, evolve thoughtfully.