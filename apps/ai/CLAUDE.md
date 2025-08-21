# Claude Guide to Arbor AI Service

Welcome to the Arbor AI service - the intelligent backend powered by Mastra.

## 🤖 Service Overview

This directory contains the AI agents, tools, and workflows that power Arbor's intelligent features. It's now part of the arbor-xyz turborepo and runs as a Mastra service on port 3999.

## 🏗️ Repository Structure

```
apps/ai/
├── src/
│   └── mastra/           # Only directory in src/
│       ├── agents/       # AI agents
│       ├── tools/        # Agent capabilities
│       ├── workflows/    # Multi-step processes
│       └── lib/          # Utilities
│           └── attachments/  # RAG system
├── .env.local            # Environment config
├── mastra.config.ts      # Mastra configuration
└── package.json
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
pnpm dev
# Service runs on http://localhost:3999
```

## 🔧 Key Components

### Storage & Memory
- **PostgreSQL with pgvector** - Full semantic recall and resource-scoped memory
- **Cloudflare Hyperdrive** - Connection pooling for edge deployment
- **OpenAI Embeddings** - text-embedding-3-small for semantic search

### Agents (`src/mastra/agents/`)
1. **chat** - General conversational AI with full memory (resource-scoped)
2. **code** - Programming assistant with developer context (resource-scoped)
3. **summarizer** - Content summarization with thread memory

### Tools (`src/mastra/tools/`)
- **jina-reader** - Web content extraction
- **url-summarizer** - Webpage summarization
- **attachment-search** - RAG-based document search
- **outputs** - Structured output creation
- **MCP tools** - GitHub, Gmail, Firecrawl (XML-based)

### Workflows (`src/mastra/workflows/`)
- **url-summary** - Combines Jina + summarizer agent

### Utilities (`src/mastra/lib/`)
- **models.ts** - Model factory with lazy init
- **tools.ts** - Tool loading and registration
- **attachments/** - RAG implementation

## 🎯 Common Tasks

### Adding a New Agent
```typescript
// src/mastra/agents/your-agent/index.ts
import { Agent } from '@mastra/core/agent';
import { createModelFactory } from '../../lib/models';
import { createMemory } from '../../lib/memory';

// Lazy initialization pattern
let model: ReturnType<typeof createModelFactory> | undefined;
const getModel = () => {
  if (!model) {
    model = createModelFactory('anthropic/claude-3-sonnet');
  }
  return model;
};

export const yourAgent = new Agent({
  name: 'your-agent',
  description: 'Agent purpose',
  instructions: loadInstructions(), // From XML file
  model: getModel(),
  memory: createMemory(),
  tools: {
    // Add tools here
  }
});
```

### Creating Agent Instructions
```xml
<!-- src/mastra/agents/your-agent/instructions.xml -->
<instructions>
  <role>Define the agent's role and purpose</role>
  
  <capabilities>
    <capability>What the agent can do</capability>
  </capabilities>
  
  <guidelines>
    <guideline>How the agent should behave</guideline>
  </guidelines>
  
  <constraints>
    <constraint>What the agent should not do</constraint>
  </constraints>
</instructions>
```

### Adding a Tool
```typescript
// src/mastra/tools/your-tool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const yourTool = createTool({
  id: 'your-tool',
  description: 'Clear description of what the tool does',
  inputSchema: z.object({
    param: z.string().describe('Parameter description'),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ context }) => {
    // Tool implementation
    return { result: 'output' };
  }
});
```

## 🔌 API Endpoints

The Mastra dev server automatically creates endpoints:

- `GET /api/agents` - List all agents
- `POST /api/agents/:id/generate` - Generate text
- `POST /api/agents/:id/stream` - Stream responses
- `GET /api/tools` - List all tools
- `POST /api/tools/:id/execute` - Execute tool
- `GET /api/workflows` - List workflows
- `POST /api/workflows/:id/start` - Start workflow

## 🐛 Debugging

### Enable Debug Logging
```env
# .env.local
DEBUG=true
DEBUG_AGENTS=true
DEBUG_TOOLS=true
```

### Common Issues

1. **"Creating model factory" spam**
   - Use lazy initialization pattern
   - Check for multiple imports

2. **Memory not persisting**
   - Verify resourceId consistency
   - Check database connection

3. **Tools not available**
   - Ensure tool is registered
   - Check tool ID matches

### Monitoring
```bash
# View logs
pnpm dev

# Check service health
curl http://localhost:3999/api/agents

# Test agent
curl -X POST http://localhost:3999/api/agents/chat/generate \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

## 📝 Environment Variables

```env
# Database - Neon PostgreSQL with pgvector
DATABASE_URL=postgresql://...@neon.tech/...?sslmode=require
# In production, Hyperdrive URL is set automatically via binding

# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
GOOGLE_API_KEY=...

# App Configuration
MAIN_APP_URL=http://localhost:3000
NODE_ENV=development
DEBUG=true

# Cloudflare (for production deployment)
CLOUDFLARE_API_TOKEN=...
```

## 🚀 Deployment

This service deploys to Mastra Cloud:

```bash
# Deploy to Mastra Cloud
pnpm mastra deploy

# Check deployment
pnpm mastra status
```

## 🏛️ Architecture Notes

- **Stateless**: Agents don't store state between requests
- **Memory**: Handled by Mastra Memory with PostgreSQL
- **Streaming**: All agents support streaming responses
- **Tools**: Can be sync or async, with error handling
- **Workflows**: Combine agents and tools for complex tasks

## ⚡ Performance Tips

1. Use appropriate models:
   - Heavy tasks: Claude Sonnet
   - Code: Gemini Flash (fast/cheap)
   - Simple tasks: GPT-4o-mini

2. Cache tool results when possible
3. Implement timeouts for external APIs
4. Monitor token usage and costs

Remember: This service is the brain of Arbor. Keep agents focused, tools reliable, and always handle errors gracefully.

## 🤖 Agents Directory Details

This section contains detailed information about the AI agents in `src/mastra/agents/`.

### Available Agents

#### 1. Chat Agent (`/chat`)
General-purpose conversational AI assistant.

```typescript
// Configuration
model: ({ runtimeContext }) => {
  return createDynamicModel({ 
    runtimeContext, 
    defaultModelId: "z.ai/glm-4.5" 
  });
}

// Key features:
- Conversational AI with memory
- Tool usage (MCP tools, output creation)
- Attachment search via RAG
- Streaming responses
- XML-based instructions
- Dynamic model selection via RuntimeContext
```

#### 2. Code Agent (`/code`)
Specialized agent for programming assistance.

```typescript
// Configuration
model: ({ runtimeContext }) => {
  return createDynamicModel({ 
    runtimeContext, 
    defaultModelId: "z.ai/glm-4.5" 
  });
}

// Key features:
- Code generation and analysis
- Technical documentation
- Debugging assistance
- Uses Google's Gemini for cost efficiency
- Dynamic model selection via RuntimeContext
```

#### 3. Summarizer Agent (`/summarizer`)
Content summarization specialist.

```typescript
// Configuration
model: ({ runtimeContext }) => {
  return createDynamicModel({ 
    runtimeContext, 
    defaultModelId: "z.ai/glm-4.5" 
  });
}

// Key features:
- Text summarization
- Key point extraction
- Configurable output length
- Used in workflows
- Dynamic model selection via RuntimeContext
```

### Dynamic Model Configuration with RuntimeContext
```typescript
// Models are now configured dynamically based on RuntimeContext
model: ({ runtimeContext }) => {
  return createDynamicModel({ 
    runtimeContext, 
    defaultModelId: "z.ai/glm-4.5" 
  });
}

// RuntimeContext can provide:
// - "chat-model": Override default model
// - "openai-api-key": Custom OpenAI API key
// - "anthropic-api-key": Custom Anthropic API key
// - "google-api-key": Custom Google API key
// - "openrouter-api-key": Custom OpenRouter API key
```

### Agent Definition Pattern
```typescript
export const chatAgent = new Agent({
  name: "chat",
  description: "A helpful AI assistant",
  instructions: loadInstructions(), // XML file
  model: ({ runtimeContext }) => {
    return createDynamicModel({ 
      runtimeContext, 
      defaultModelId: "z.ai/glm-4.5" 
    });
  },
  memory: createMemory(),
  tools: {
    ...loadTools(),
    attachmentSearch,
    createOutput,
  },
});
```

### Memory Configuration
```typescript
const createMemory = () => new Memory({
  storage: getSharedStorageDb(),
  vector: getSharedEmbeddingDb(),
  embedder: new EmbedderClient().getEmbedder(),
  options: {
    lastMessages: 10,
    semanticRecall: {
      topK: 5,
      messageRange: {
        before: 1,
        after: 1
      }
    }
  }
});
```

### Instructions Format
Agents use XML-based instructions for flexibility:

```xml
<!-- chat/instructions.xml -->
<instructions>
  <role>
    You are a helpful AI assistant that can help with a variety of tasks.
  </role>
  
  <capabilities>
    <capability>Answer questions accurately and concisely</capability>
    <capability>Search through attached documents</capability>
    <capability>Create structured outputs</capability>
  </capabilities>
  
  <guidelines>
    <guideline>Be helpful and professional</guideline>
    <guideline>Admit when you don't know something</guideline>
    <guideline>Use tools when appropriate</guideline>
  </guidelines>
</instructions>
```

### Agent Best Practices

1. **Dynamic Model Configuration**
```typescript
// Use RuntimeContext for dynamic model selection
model: ({ runtimeContext }) => {
  return createDynamicModel({ 
    runtimeContext, 
    defaultModelId: "your-default-model" 
  });
}

// When calling the agent, provide context:
const runtimeContext = new RuntimeContext<ModelRuntimeContext>();
runtimeContext.set("chat-model", "anthropic/claude-3-opus-4");

const response = await agent.generate(prompt, {
  runtimeContext,
  threadId,
  resourceId: userId,
});
```

2. **Error Handling**
```typescript
try {
  const response = await agent.generate(messages);
  return response;
} catch (error) {
  console.error(`[${agent.name}] Error:`, error);
  throw new Error(`Agent error: ${error.message}`);
}
```

3. **Memory Management**
```typescript
// Always provide resourceId (user.clerkId)
const response = await agent.stream(prompt, {
  threadId,
  resourceId: userId,
});
```

## 🛠️ Tools Directory Details

This section contains detailed information about tools in `src/mastra/tools/`.

### Tool Categories

#### Core Tools
Tools that are part of the main Mastra framework.

##### Jina Reader (`jina-reader.ts`)
```typescript
export const jinaReader = createTool({
  id: "jina-reader",
  description: "Extract clean content from any URL",
  inputSchema: z.object({
    url: z.string().url(),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const response = await fetch(`https://r.jina.ai/${context.url}`);
    const content = await response.text();
    
    // Parse Jina response format
    const lines = content.split('\n');
    const title = lines[0]?.replace('Title: ', '') || '';
    const body = lines.slice(2).join('\n');
    
    return { title, content: body, url: context.url };
  },
});
```

##### URL Summarizer (`url-summarizer.ts`)
```typescript
export const urlSummarizer = createTool({
  id: "url-summarizer",
  description: "Summarize content from a URL",
  inputSchema: z.object({
    url: z.string().url(),
    maxLength: z.number().optional().default(500),
  }),
  execute: async ({ context, mastra }) => {
    // Use Jina to fetch content
    const { content } = await jinaReader.execute({ 
      context: { url: context.url } 
    });
    
    // Use summarizer agent
    const agent = mastra?.getAgent('summarizer');
    const summary = await agent?.generate(
      `Summarize this content in ${context.maxLength} words: ${content}`
    );
    
    return { summary: summary.text, url: context.url };
  },
});
```

##### Output Creation (`outputs.ts`)
```typescript
const createOutputTool = (type: OutputType) => createTool({
  id: `create-${type}`,
  description: `Create a ${type} output`,
  inputSchema: outputSchemas[type],
  execute: async ({ context }) => {
    const output = {
      id: generateId(),
      type,
      ...context,
      createdAt: new Date().toISOString(),
    };
    
    // Store output if needed
    await storeOutput(output);
    
    return output;
  },
});

// Generate multiple output tools
export const outputTools = {
  createMarkdown: createOutputTool('markdown'),
  createDiagram: createOutputTool('diagram'),
  createCode: createOutputTool('code'),
};
```

#### MCP Tools (`/xml`)
Model Context Protocol tools defined in XML format.

##### Structure
```
xml/
├── firecrawl/
│   ├── crawl-url.xml
│   ├── map-url.xml
│   └── search.xml
├── github/
│   ├── create-issue.xml
│   ├── create-pull-request.xml
│   └── search-repositories.xml
└── gmail/
    ├── create-draft.xml
    ├── search-emails.xml
    └── send-email.xml
```

##### XML Tool Format
```xml
<!-- github/create-issue.xml -->
<tool>
  <name>github-create-issue</name>
  <description>Create a new issue in a GitHub repository</description>
  <parameters>
    <parameter>
      <name>repository</name>
      <type>string</type>
      <description>Repository in format owner/repo</description>
      <required>true</required>
    </parameter>
    <parameter>
      <name>title</name>
      <type>string</type>
      <description>Issue title</description>
      <required>true</required>
    </parameter>
    <parameter>
      <name>body</name>
      <type>string</type>
      <description>Issue body content</description>
      <required>false</required>
    </parameter>
  </parameters>
</tool>
```

##### Loading MCP Tools
```typescript
// index.ts
export const loadMcpTools = async () => {
  const toolsDir = path.join(__dirname, 'xml');
  const tools: Record<string, any> = {};
  
  // Recursively load XML files
  const files = await glob('**/*.xml', { cwd: toolsDir });
  
  for (const file of files) {
    const content = await fs.readFile(path.join(toolsDir, file), 'utf-8');
    const tool = parseXmlTool(content);
    tools[tool.name] = createToolFromXml(tool);
  }
  
  return tools;
};
```

### Tool Patterns

#### Input Validation
```typescript
const inputSchema = z.object({
  url: z.string().url().refine(
    (url) => url.startsWith('https://'),
    'Only HTTPS URLs are supported'
  ),
  options: z.object({
    includeImages: z.boolean().default(false),
    maxDepth: z.number().min(1).max(5).default(3),
  }).optional(),
});
```

#### Error Handling
```typescript
execute: async ({ context }) => {
  try {
    const result = await performOperation(context);
    return { success: true, data: result };
  } catch (error) {
    console.error(`[${tool.id}] Error:`, error);
    return { 
      success: false, 
      error: error.message,
      retryable: isRetryableError(error)
    };
  }
}
```

#### Rate Limiting
```typescript
const rateLimiter = new Map<string, number>();

execute: async ({ context }) => {
  const key = `${tool.id}:${context.userId}`;
  const lastCall = rateLimiter.get(key) || 0;
  
  if (Date.now() - lastCall < 1000) {
    throw new Error('Rate limit exceeded');
  }
  
  rateLimiter.set(key, Date.now());
  // ... perform operation
}
```

### Tool Best Practices

1. **Clear Descriptions**
```typescript
// Good: Specific and actionable
description: "Extract and clean the main content from a web page URL"

// Bad: Vague
description: "Process URL"
```

2. **Robust Schemas**
```typescript
// Include validation and defaults
inputSchema: z.object({
  query: z.string().min(1).max(1000),
  limit: z.number().int().positive().default(10),
  filters: z.array(z.string()).optional(),
});
```

3. **Idempotency**
```typescript
// Tools should be safe to retry
execute: async ({ context }) => {
  const existingResult = await checkCache(context);
  if (existingResult) return existingResult;
  
  const result = await performOperation(context);
  await cacheResult(context, result);
  return result;
}
```

### Adding New Tools

1. Create tool file in appropriate directory
2. Define clear input/output schemas
3. Implement robust error handling
4. Add to tool registry
5. Test with agents

### Debugging Tools

```typescript
// Enable tool execution logging
if (process.env.DEBUG_TOOLS) {
  console.log(`[Tool: ${tool.id}] Input:`, context);
  console.log(`[Tool: ${tool.id}] Output:`, result);
}

// Tool execution metrics
const metrics = {
  executions: 0,
  errors: 0,
  avgDuration: 0,
};
```

Remember: Tools extend agent capabilities. Keep them focused, well-documented, and resilient to failures.
