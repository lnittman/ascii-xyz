import { openai } from '@ai-sdk/openai';
import { Memory } from '@mastra/memory';
import {
  createPostgresStorage,
  createPostgresVector,
} from '../../lib/storage/index';

/**
 * Create memory configuration for chat agent
 * Uses PostgreSQL with pgvector for full semantic recall support
 */
export const createMemory = (env?: any) => {
  const storage = createPostgresStorage(env);
  const vector = createPostgresVector(env);

  return new Memory({
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
        scope: 'resource', // Enable resource-scoped working memory (persists across all user threads)
        template: `
# User Profile

## Personal Info
- Name:
- Location:
- Timezone:
- Occupation:
- Background:

## Response Preferences
- Communication Style: [concise/detailed/structured]
- Technical Level: [beginner/intermediate/expert]
- Format Preferences: [plain text/markdown/code blocks]
- Implementation Focus: [theoretical/practical/both]

## Technical Context
- Primary Stack:
- Frameworks & Tools:
- Current Projects:
  - Project 1:
    - Description:
    - Tech Stack:
    - Status:
  - Project 2:
    - Description:
    - Tech Stack:
    - Status:

## Notable Topics & Expertise
- Main Areas of Interest:
- Recent Discussion Topics:
- Domain Expertise:

## Behavioral Patterns
- Prefers: [e.g., structured outputs, efficiency, modern tooling]
- Avoids: [e.g., redundancy, theoretical discussions]
- Interaction Style: [e.g., iterative refinement, direct questions]

## Personal Context
- Goals:
- Important Notes:
- Helpful Background:

## Session State
- Current Focus:
- Open Questions:
- Follow-up Items:

## Confidence Notes
- High Confidence Items:
- Medium Confidence Items:
- To Be Confirmed:
`,
      },
    },
  });
};
