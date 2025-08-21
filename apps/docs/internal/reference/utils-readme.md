# Mastra Utils

## Dynamic Model Setup (`models.ts`)

The `models.ts` utility provides a reusable way to set up dynamic AI model selection for Mastra agents. It supports multiple providers and automatic API key management through runtime context.

### Features

- **Multi-provider support**: OpenAI, Anthropic, Google, and OpenRouter
- **Automatic provider detection**: Based on model ID patterns
- **Runtime configuration**: API keys and model selection via RuntimeContext
- **Fallback to environment variables**: When runtime context values aren't set
- **Type-safe**: Full TypeScript support with proper typing

### Usage

#### Basic Setup

```typescript
import { Agent } from "@mastra/core/agent";
import { RuntimeContext } from "@mastra/core/di";
import { createModelFactory, ModelRuntimeContext } from "../utils/models";

// 1. Define your agent's runtime context type
export type MyAgentRuntimeContext = ModelRuntimeContext;

// 2. Create a runtime context instance
export const runtimeContext = new RuntimeContext<MyAgentRuntimeContext>();

// 3. Create a model factory (with optional default model)
const model = createModelFactory("claude-3-5-sonnet-20241022");

// 4. Use in your agent
export const myAgent = new Agent({
  instructions: "Your agent instructions...",
  model: model,
  name: "my-agent",
  tools: {
    // your tools
  },
});
```

#### Provider Detection

The utility automatically detects providers based on model ID patterns:

- **OpenRouter**: Contains `/` (e.g., `anthropic/claude-3-5-sonnet`)
- **OpenAI**: Starts with `gpt-` (e.g., `gpt-4o`)
- **Anthropic**: Starts with `claude-` (e.g., `claude-3-5-sonnet-20241022`)
- **Google**: Starts with `gemini-` (e.g., `gemini-2.0-flash-exp`)
- **Default**: OpenRouter for unmatched patterns

#### Runtime Configuration

You can configure models and API keys at runtime:

```typescript
// Set the model to use
runtimeContext.set("chat-model", "gpt-4o");

// Set API keys (optional if environment variables are set)
runtimeContext.set("openai-api-key", "sk-...");
runtimeContext.set("anthropic-api-key", "sk-ant-...");
runtimeContext.set("google-api-key", "AIza...");
runtimeContext.set("openrouter-api-key", "sk-or-...");
```

#### Environment Variables

The utility falls back to these environment variables when runtime context values aren't set:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_API_KEY`
- `OPENROUTER_API_KEY`

### Advanced Usage

#### Custom Default Model

```typescript
// Use a specific default model
const model = createModelFactory("gpt-4o-mini");
```

#### Direct Model Creation

```typescript
import { createDynamicModel } from "../utils/models";

// Create a model instance directly
const modelInstance = createDynamicModel({
  runtimeContext,
  defaultModelId: "claude-3-5-sonnet-20241022"
});
```

#### Provider Detection Only

```typescript
import { getProvider } from "../utils/models";

const provider = getProvider("gpt-4o"); // Returns 'openai'
const provider2 = getProvider("anthropic/claude-3-5-sonnet"); // Returns 'openrouter'
```

### Integration with Database Models

This utility works seamlessly with the database schema defined in `packages/database/prisma/schema.prisma`. The Provider and Model tables can store available models, and the user settings can manage enabled models and API keys that get passed to the runtime context.

### Migration from Inline Logic

To migrate existing agents from inline model logic:

1. Replace the inline model function with `createModelFactory()`
2. Update the runtime context type to extend `ModelRuntimeContext`
3. Remove duplicate provider detection and model creation logic
4. Update imports to use the utility functions

This provides a consistent, reusable approach to model management across all Mastra agents. 