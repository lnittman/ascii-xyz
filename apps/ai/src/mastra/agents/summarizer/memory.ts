import { openai } from '@ai-sdk/openai';
import { Memory } from '@mastra/memory';
import {
  createPostgresStorage,
  createPostgresVector,
} from '../../lib/storage/index';

/**
 * Create memory configuration for summarizer agent
 * Uses PostgreSQL with pgvector for full semantic recall support
 * Optimized for Vercel serverless deployment
 */
export const createMemory = (env?: any) => {
  // Create a lazy-initialized memory
  let memory: Memory | null = null;

  const getMemory = () => {
    if (!memory) {
      const storage = createPostgresStorage(env);
      const vector = createPostgresVector(env);

      memory = new Memory({
        storage,
        vector,
        embedder: openai.embedding('text-embedding-3-small'),
        options: {
          lastMessages: 10,
          threads: {
            generateTitle: true,
          },
          // Enable semantic recall with PostgreSQL + pgvector
          semanticRecall: {
            topK: 3,
            messageRange: {
              before: 1,
              after: 1,
            },
            scope: 'thread', // Summarizer uses thread-scoped recall
          },
          workingMemory: {
            enabled: true,
            scope: 'thread', // Thread-scoped working memory for summarizer
            template: `
# Summary Context

## Documents Processed
- Recent items:

## Preferences
- Summary length:
- Emphasis:
- Format:

## Session Notes
- Current document:
- Key points:
      `,
          },
        },
      });
    }
    return memory;
  };

  // Return a proxy that creates the memory on first access
  return new Proxy({} as Memory, {
    get(_target, prop) {
      // Special handling for certain properties that might be checked
      if (prop === 'then' || prop === 'catch' || prop === Symbol.toStringTag) {
        return undefined;
      }
      const actualMemory = getMemory();
      return (actualMemory as any)[prop];
    },
  });
};
