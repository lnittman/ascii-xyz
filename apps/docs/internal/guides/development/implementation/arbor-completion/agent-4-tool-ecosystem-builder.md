# agent 4: tool ecosystem builder
*"expanding capabilities through integrations"*

## scope

this agent integrates a comprehensive suite of mcp (model context protocol) tools and custom arbor tools to expand the ai agents' capabilities. the goal is a rich, extensible tool ecosystem that makes the ai feel omnipotent while maintaining security and performance.

## packages to modify

- `apps/ai/src/mastra/tools/` - new tool implementations
- `apps/ai/tools/mcp/` - mcp tool configurations
- `apps/ai/src/mastra/agents/` - tool integration in agents
- `apps/app/src/components/chat/` - tool ui rendering

## implementation details

### 1. mcp tool integration

#### a. comprehensive mcp tool loader
```typescript
// apps/ai/src/mastra/tools/mcp/loader.ts
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { XMLParser } from 'fast-xml-parser';
import { createMCPTool } from './creator';

export class MCPToolLoader {
  private parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  
  async loadAllTools(): Promise<Record<string, any>> {
    const toolsDir = join(process.cwd(), 'tools/mcp');
    const files = readdirSync(toolsDir).filter(f => f.endsWith('.xml'));
    
    const tools: Record<string, any> = {};
    
    for (const file of files) {
      const content = readFileSync(join(toolsDir, file), 'utf-8');
      const parsed = this.parser.parse(content);
      
      if (parsed.tool) {
        const tool = createMCPTool(parsed.tool);
        tools[tool.id] = tool;
      } else if (parsed.tools) {
        // handle multiple tools in one file
        for (const toolDef of parsed.tools.tool) {
          const tool = createMCPTool(toolDef);
          tools[tool.id] = tool;
        }
      }
    }
    
    return tools;
  }
}

// apps/ai/src/mastra/tools/mcp/creator.ts
export function createMCPTool(definition: MCPToolDefinition) {
  return createTool({
    id: definition.name,
    description: definition.description,
    inputSchema: parseParametersToZod(definition.parameters),
    execute: async ({ context }) => {
      return executeMCPTool(definition.name, context);
    }
  });
}
```

#### b. essential mcp tools
```xml
<!-- apps/ai/tools/mcp/web-tools.xml -->
<tools>
  <tool>
    <name>web_search</name>
    <description>Search the web for current information</description>
    <parameters>
      <parameter name="query" type="string" required="true">
        The search query
      </parameter>
      <parameter name="num_results" type="number" required="false">
        Number of results to return (default: 5)
      </parameter>
    </parameters>
  </tool>
  
  <tool>
    <name>web_scrape</name>
    <description>Extract content from a webpage</description>
    <parameters>
      <parameter name="url" type="string" required="true">
        The URL to scrape
      </parameter>
      <parameter name="selector" type="string" required="false">
        CSS selector to extract specific content
      </parameter>
    </parameters>
  </tool>
</tools>

<!-- apps/ai/tools/mcp/developer-tools.xml -->
<tools>
  <tool>
    <name>github_search</name>
    <description>Search GitHub repositories, issues, and code</description>
    <parameters>
      <parameter name="query" type="string" required="true">
        Search query
      </parameter>
      <parameter name="type" type="string" required="false">
        Type: repositories, issues, code, users
      </parameter>
    </parameters>
  </tool>
  
  <tool>
    <name>npm_search</name>
    <description>Search npm packages</description>
    <parameters>
      <parameter name="query" type="string" required="true">
        Package name or keywords
      </parameter>
    </parameters>
  </tool>
</tools>
```

### 2. custom arbor tools

#### a. project context tool
```typescript
// apps/ai/src/mastra/tools/arbor/projectContext.ts
export const projectContextTool = createTool({
  id: "get-project-context",
  description: "Get current project information and files",
  inputSchema: z.object({
    projectId: z.string().describe("Project ID to get context for")
  }),
  outputSchema: z.object({
    project: z.object({
      name: z.string(),
      description: z.string().optional(),
      instructions: z.string().optional(),
      files: z.array(z.object({
        path: z.string(),
        content: z.string()
      }))
    })
  }),
  execute: async ({ context }) => {
    const project = await projectService.getById(context.projectId);
    
    // fetch project files if configured
    const files = project.files ? 
      await Promise.all(
        project.files.map(async (file: any) => ({
          path: file.path,
          content: await fetchFileContent(file.url)
        }))
      ) : [];
    
    return {
      project: {
        name: project.name,
        description: project.description,
        instructions: project.instructions,
        files
      }
    };
  }
});
```

#### b. workspace execution tool
```typescript
// apps/ai/src/mastra/tools/arbor/workspaceExecute.ts
export const workspaceExecuteTool = createTool({
  id: "workspace-execute",
  description: "Execute code or commands in a workspace",
  inputSchema: z.object({
    workspaceId: z.string(),
    type: z.enum(["command", "code"]),
    content: z.string(),
    language: z.string().optional()
  }),
  outputSchema: z.object({
    success: z.boolean(),
    output: z.string(),
    error: z.string().optional(),
    executionTime: z.number()
  }),
  execute: async ({ context }) => {
    const startTime = Date.now();
    
    const task = await taskService.createTask({
      workspaceId: context.workspaceId,
      title: `Execute ${context.type}`,
      prompt: context.content,
      userId: 'system'
    });
    
    // wait for completion
    const result = await waitForTaskCompletion(task.id);
    
    return {
      success: result.status === 'completed',
      output: result.output || '',
      error: result.error,
      executionTime: Date.now() - startTime
    };
  }
});
```

#### c. knowledge base tool
```typescript
// apps/ai/src/mastra/tools/arbor/knowledgeBase.ts
export const knowledgeBaseTool = createTool({
  id: "search-knowledge",
  description: "Search arbor's knowledge base and documentation",
  inputSchema: z.object({
    query: z.string(),
    category: z.enum(["docs", "api", "examples", "all"]).optional()
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string(),
      content: z.string(),
      url: z.string(),
      relevance: z.number()
    }))
  }),
  execute: async ({ context }) => {
    // search through embedded docs
    const results = await vectorSearch({
      query: context.query,
      filter: context.category !== 'all' ? { category: context.category } : undefined,
      topK: 5
    });
    
    return {
      results: results.map(r => ({
        title: r.metadata.title,
        content: r.text,
        url: r.metadata.url,
        relevance: r.score
      }))
    };
  }
});
```

### 3. tool ui components

#### a. interactive tool renderer
```typescript
// apps/app/src/components/chat/ToolInvocationRenderer.tsx
export function ToolInvocationRenderer({ 
  toolInvocation 
}: { 
  toolInvocation: ToolInvocation 
}) {
  const renderByToolName = () => {
    switch (toolInvocation.toolName) {
      case 'web_search':
        return <WebSearchResults invocation={toolInvocation} />;
      
      case 'github_search':
        return <GithubSearchResults invocation={toolInvocation} />;
        
      case 'workspace-execute':
        return <CodeExecutionResult invocation={toolInvocation} />;
        
      case 'get-project-context':
        return <ProjectContextDisplay invocation={toolInvocation} />;
        
      default:
        return <GenericToolResult invocation={toolInvocation} />;
    }
  };
  
  return (
    <div className="my-2 border rounded-lg overflow-hidden">
      <div className="bg-muted px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <ToolIcon name={toolInvocation.toolName} />
          <span className="font-mono">{toolInvocation.toolName}</span>
        </div>
        <ToolStatus state={toolInvocation.state} />
      </div>
      
      <div className="p-3">
        {toolInvocation.state === 'call' && (
          <div className="text-sm text-muted-foreground">
            <LoadingSpinner size="sm" />
            <span className="ml-2">executing...</span>
          </div>
        )}
        
        {toolInvocation.state === 'result' && renderByToolName()}
        
        {toolInvocation.state === 'error' && (
          <div className="text-sm text-red-500">
            error: {toolInvocation.error}
          </div>
        )}
      </div>
    </div>
  );
}
```

#### b. specialized result components
```typescript
// apps/app/src/components/chat/tools/WebSearchResults.tsx
export function WebSearchResults({ 
  invocation 
}: { 
  invocation: ToolInvocation 
}) {
  const results = invocation.result?.results || [];
  
  return (
    <div className="space-y-2">
      {results.map((result: any, i: number) => (
        <a
          key={i}
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 hover:bg-muted/50 rounded-lg transition-colors"
        >
          <div className="font-medium text-sm mb-1">{result.title}</div>
          <div className="text-xs text-muted-foreground line-clamp-2">
            {result.snippet}
          </div>
          <div className="text-xs text-primary mt-1">{result.domain}</div>
        </a>
      ))}
    </div>
  );
}

// apps/app/src/components/chat/tools/CodeExecutionResult.tsx
export function CodeExecutionResult({ 
  invocation 
}: { 
  invocation: ToolInvocation 
}) {
  const { success, output, error, executionTime } = invocation.result || {};
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{success ? 'completed' : 'failed'}</span>
        <span>{executionTime}ms</span>
      </div>
      
      {output && (
        <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
          {output}
        </pre>
      )}
      
      {error && (
        <pre className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </pre>
      )}
    </div>
  );
}
```

### 4. tool orchestration

#### a. smart tool selection
```typescript
// apps/ai/src/mastra/agents/chat/tools.ts
export function selectToolsForQuery(query: string): string[] {
  const toolCategories = {
    web: ['web_search', 'web_scrape', 'jina-reader'],
    code: ['github_search', 'npm_search', 'workspace-execute'],
    project: ['get-project-context', 'search-knowledge'],
    output: ['create-output']
  };
  
  // analyze query to determine needed tools
  const needed = new Set<string>();
  
  if (query.match(/search|find|look up|current|latest|news/i)) {
    toolCategories.web.forEach(t => needed.add(t));
  }
  
  if (query.match(/code|github|npm|package|library|execute|run/i)) {
    toolCategories.code.forEach(t => needed.add(t));
  }
  
  if (query.match(/project|context|files|instructions/i)) {
    toolCategories.project.forEach(t => needed.add(t));
  }
  
  // always include output creation
  needed.add('create-output');
  
  return Array.from(needed);
}
```

#### b. dynamic tool loading
```typescript
// apps/ai/src/mastra/agents/chat/index.ts
export const chatAgent = new Agent({
  name: "chat",
  instructions: loadPrompt("agents/chat/instructions.xml"),
  model: createModelFactory("anthropic/claude-sonnet-4"),
  memory: memory,
  tools: async (context) => {
    // load base tools
    const mcpTools = await mcpToolLoader.loadAllTools();
    const arborTools = {
      createOutput: createOutputTool,
      projectContext: projectContextTool,
      workspaceExecute: workspaceExecuteTool,
      searchKnowledge: knowledgeBaseTool
    };
    
    // dynamically select relevant tools
    const query = context.messages[context.messages.length - 1]?.content || '';
    const selectedToolIds = selectToolsForQuery(query);
    
    const selectedTools: Record<string, any> = {};
    selectedToolIds.forEach(id => {
      if (mcpTools[id]) selectedTools[id] = mcpTools[id];
      if (arborTools[id]) selectedTools[id] = arborTools[id];
    });
    
    return selectedTools;
  }
});
```

### 5. tool analytics

#### a. usage tracking
```typescript
// packages/api/services/toolAnalytics.ts
export class ToolAnalyticsService {
  async trackToolUsage(data: {
    toolName: string;
    userId: string;
    success: boolean;
    executionTime: number;
    error?: string;
  }) {
    await database.toolUsage.create({
      data: {
        ...data,
        timestamp: new Date()
      }
    });
  }
  
  async getPopularTools(timeframe: 'day' | 'week' | 'month') {
    const since = getTimeframeStart(timeframe);
    
    return database.toolUsage.groupBy({
      by: ['toolName'],
      where: {
        timestamp: { gte: since },
        success: true
      },
      _count: { toolName: true },
      orderBy: { _count: { toolName: 'desc' } },
      take: 10
    });
  }
}
```

## dependencies

- none - can work independently
- coordinates with agent 5 for error handling

## testing strategy

### unit tests
- tool schema validation
- mcp xml parsing
- tool selection logic
- result formatting

### integration tests
- full tool execution flow
- error handling and retries
- ui rendering of results

### e2e tests
- chat → tool call → result display
- multiple tool orchestration
- tool failure recovery

## security considerations

- validate all tool inputs
- sandbox external api calls
- rate limit tool usage
- audit tool permissions
- encrypt api credentials
- prevent tool result injection

## effort estimate

**4-5 developer days**

### breakdown:
- day 1: mcp tool loader and integration
- day 2: custom arbor tools
- day 3: tool ui components
- day 4: orchestration and analytics
- day 5: testing and security

## success metrics

- [ ] 20+ integrated mcp tools
- [ ] 5+ custom arbor tools
- [ ] <200ms tool selection time
- [ ] 99% tool execution success rate
- [ ] rich ui for all tool types
- [ ] tool usage analytics dashboard
- [ ] zero security vulnerabilities