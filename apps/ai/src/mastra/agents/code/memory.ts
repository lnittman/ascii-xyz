import { openai } from '@ai-sdk/openai';
import { Memory } from '@mastra/memory';
import {
  createPostgresStorage,
  createPostgresVector,
} from '../../lib/storage/index';

/**
 * Create memory configuration for code agent
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
            topK: 5,
            messageRange: {
              before: 2,
              after: 1,
            },
            scope: 'resource', // Enable cross-thread semantic search
          },
          workingMemory: {
            enabled: true,
            scope: 'resource', // Enable resource-scoped working memory
            template: `
# Developer Profile

## Personal Info
- Name:
- Location:
- Timezone:
- Experience Level:

## Technical Stack & Expertise
- Primary Languages:
- Frameworks & Libraries:
- Development Tools:
- Cloud/Deployment:
- Databases:

## Coding Preferences
- Code Style: [verbose/concise/idiomatic]
- Documentation: [inline/separate/minimal]
- Testing: [TDD/unit/integration/e2e]
- Architecture: [monolithic/microservices/serverless]
- Patterns: [functional/OOP/mixed]

## Current Projects
- Active Project:
  - Name:
  - Tech Stack:
  - Architecture:
  - Status:
  - Challenges:
- Secondary Projects:

## Development Patterns
- Prefers: [e.g., type safety, modern syntax, performance]
- Avoids: [e.g., legacy patterns, verbose boilerplate]
- Focus Areas: [e.g., clean code, optimization, scalability]

## Work Context
- Team Size:
- Role:
- Domain:
- Goals:

## Session State
- Current Task:
- Files/Modules:
- Recent Changes:
- Blockers:
- Next Steps:

## Learning & Interests
- Learning Goals:
- Areas to Explore:
- Recent Discoveries:

## Confidence Notes
- Confirmed Preferences:
- Inferred Patterns:
- To Be Validated:
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
