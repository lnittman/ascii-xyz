#!/usr/bin/env node

/**
 * Test semantic recall on deployed Cloudflare Worker
 */

const WORKER_URL = 'https://apps-ai.luke-nittmann.workers.dev';
const USER_ID = 'test-user-cf-worker';
const THREAD_ID = `test-thread-cf-${Date.now()}`;

// Runtime context with user's API keys
const runtimeContext = {
  'openai-api-key': process.env.OPENAI_API_KEY,
};

async function testSemanticRecall() {
  // Test messages with semantic relationships
  const testMessages = [
    {
      role: 'user',
      content: 'I love TypeScript for building type-safe applications',
    },
    {
      role: 'assistant',
      content:
        'TypeScript is excellent for type safety! It helps catch errors at compile time.',
    },
    { role: 'user', content: 'What about Python for data science?' },
    {
      role: 'assistant',
      content:
        'Python is the go-to language for data science with libraries like pandas, numpy, and scikit-learn.',
    },
    {
      role: 'user',
      content: 'I also enjoy using React for frontend development',
    },
    {
      role: 'assistant',
      content:
        'React is a powerful library for building user interfaces with its component-based architecture.',
    },
    { role: 'user', content: 'Can you recommend a database for my project?' },
    {
      role: 'assistant',
      content:
        'For modern applications, PostgreSQL is excellent for relational data, while MongoDB works well for document storage.',
    },
    { role: 'user', content: 'What programming language did I mention first?' }, // This should trigger semantic recall
  ];

  try {
    // Send messages one by one to build conversation history
    for (let i = 0; i < testMessages.length; i++) {
      const currentMessages = testMessages.slice(0, i + 1);

      const response = await fetch(`${WORKER_URL}/api/agents/chat/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: currentMessages,
          threadId: THREAD_ID,
          resourceId: USER_ID,
          memoryOptions: {
            lastMessages: 5,
            semanticRecall: {
              topK: 3,
              messageRange: {
                before: 2,
                after: 1,
              },
              scope: 'resource',
            },
          },
          runtimeContext,
        }),
      });

      if (!response.ok) {
        const _error = await response.text();
        continue;
      }

      const result = await response.json();

      // For the last message, check if semantic recall worked
      if (i === testMessages.length - 1) {
        if (result.text?.toLowerCase().includes('typescript')) {
        } else {
        }
      }
    }
    const newThreadId = `test-thread-cf-new-${Date.now()}`;

    const crossThreadResponse = await fetch(
      `${WORKER_URL}/api/agents/chat/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content:
                'What programming languages have I mentioned in our previous conversations?',
            },
          ],
          threadId: newThreadId,
          resourceId: USER_ID,
          memoryOptions: {
            lastMessages: 0, // Don't include messages from current thread
            semanticRecall: {
              topK: 5,
              messageRange: {
                before: 2,
                after: 1,
              },
              scope: 'resource', // Search across all user's threads
            },
          },
          runtimeContext,
        }),
      }
    );

    if (crossThreadResponse.ok) {
      const crossThreadResult = await crossThreadResponse.json();

      const mentionedLanguages = ['typescript', 'python', 'react'];
      const foundLanguages = mentionedLanguages.filter((lang) =>
        crossThreadResult.text?.toLowerCase().includes(lang)
      );

      if (foundLanguages.length > 0) {
      } else {
      }
    } else {
    }
  } catch (_error) {}
}

// Run the test
testSemanticRecall().catch(console.error);
