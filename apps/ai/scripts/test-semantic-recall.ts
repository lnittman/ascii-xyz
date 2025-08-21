import path from 'node:path';
import { openai } from '@ai-sdk/openai';
import { Memory } from '@mastra/memory';
import { PgVector, PostgresStore } from '@mastra/pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });

async function testSemanticRecall(connectionString: string, _label: string) {
  try {
    // Create storage and vector instances
    const storage = new PostgresStore({ connectionString });
    const vector = new PgVector({ connectionString });

    // Create memory instance
    const memory = new Memory({
      storage,
      vector,
      embedder: openai.embedding('text-embedding-3-small'),
      options: {
        semanticRecall: {
          topK: 3,
          messageRange: {
            before: 1,
            after: 1,
          },
          scope: 'resource',
        },
      },
    });

    // Test data
    const testResourceId = 'test-user-123';
    const testThreadId = 'test-thread-123';
    const messages = [
      { role: 'user', content: 'I love programming in TypeScript' },
      { role: 'assistant', content: 'TypeScript is great for type safety!' },
      { role: 'user', content: 'What about Python for data science?' },
      {
        role: 'assistant',
        content:
          'Python excels at data science with libraries like pandas and numpy.',
      },
      { role: 'user', content: 'Tell me about JavaScript frameworks' },
      {
        role: 'assistant',
        content:
          'Popular JavaScript frameworks include React, Vue, and Angular.',
      },
    ];

    // Get or create thread
    const thread = memory.getThread(testThreadId, 'test-thread');

    for (const msg of messages) {
      await thread.addMessage({
        ...msg,
        resourceId: testResourceId,
      } as any);
    }
    const semanticResults = await thread.getMessages({
      resourceId: testResourceId,
      lastMessages: 10,
      semanticRecall: {
        query: 'TypeScript programming',
        topK: 3,
      },
    });
    semanticResults.messages.forEach((_msg, _i) => {});
    const _embedding = await openai
      .embedding('text-embedding-3-small')
      .doEmbed({
        values: ['TypeScript programming'],
      });
    return true;
  } catch (_error) {
    return false;
  }
}

async function main() {
  const directUrl = process.env.DATABASE_URL;
  const hyperdriveUrl = process.env.HYPERDRIVE_URL || directUrl; // You'll need to get this from Cloudflare

  if (!directUrl) {
    process.exit(1);
  }

  // Test direct connection
  const _directSuccess = await testSemanticRecall(
    directUrl,
    'Direct Connection'
  );

  // Test Hyperdrive connection (if available)
  if (hyperdriveUrl && hyperdriveUrl !== directUrl) {
    const _hyperdriveSuccess = await testSemanticRecall(
      hyperdriveUrl,
      'Hyperdrive Connection'
    );
  } else {
  }
}

main().catch(console.error);
