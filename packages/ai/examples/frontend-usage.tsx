/**
 * Example: Frontend usage of Mastra hooks
 * Demonstrates proper integration with AI SDK hooks
 */

'use client';

import { useMastraChat, useMastraCompletion, useMastraObject } from '@repo/ai';
import { z } from 'zod';

// Example 1: Chat with memory and tools
export function ChatExample() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useMastraChat({
      agentId: 'chat',
      threadId: 'chat-123', // Your chat/thread ID
      runtimeContext: {
        // Custom context that gets passed to Mastra
        userId: 'user-123',
        preferences: { theme: 'dark' },
      },
      // Handle tool calls on the client
      onToolCall: async ({ toolCall }) => {
        // You can execute tools client-side here
        // Return the result to be sent back to the agent
        return { success: true, data: 'Tool result' };
      },
      onError: (_error) => {},
    });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e, {
      // Additional data sent with sendExtraMessageFields
      data: {
        timestamp: new Date().toISOString(),
        source: 'web',
      },
    });
  };

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
          {m.toolInvocations?.map((tool, i) => (
            <div key={i}>Tool: {tool.toolName}</div>
          ))}
        </div>
      ))}
      <form onSubmit={handleFormSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={isLoading}
        />
      </form>
    </div>
  );
}

// Example 2: Single completion
export function CompletionExample() {
  const { completion, complete, isLoading } = useMastraCompletion({
    agentId: 'summarizer',
    runtimeContext: {
      maxTokens: 500,
    },
  });

  const handleSummarize = () => {
    complete('Summarize the key points of quantum computing');
  };

  return (
    <div>
      <button onClick={handleSummarize} disabled={isLoading}>
        Generate Summary
      </button>
      {completion && <p>{completion}</p>}
    </div>
  );
}

// Example 3: Structured output
const weatherSchema = z.object({
  location: z.string(),
  temperature: z.number(),
  conditions: z.string(),
});

export function WeatherExample() {
  const { object, submit, isLoading } = useMastraObject({
    agentId: 'weather',
    schema: weatherSchema,
    api: '/api/weather', // Custom endpoint if needed
  });

  return (
    <div>
      <button
        onClick={() => submit('What is the weather in Tokyo?')}
        disabled={isLoading}
      >
        Get Weather
      </button>
      {object && (
        <div>
          <p>Location: {object.location}</p>
          <p>Temperature: {object.temperature}°C</p>
          <p>Conditions: {object.conditions}</p>
        </div>
      )}
    </div>
  );
}
