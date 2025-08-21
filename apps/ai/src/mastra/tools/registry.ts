import { jinaReaderTool } from './jina';
import { createOutputTool } from './output/create';
import { summarizeUrlTool } from './url-summary';

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'output' | 'communication' | 'development' | 'utility';
  enabled: boolean;
}

// centralized tool registry
export const toolRegistry: Record<string, ToolMetadata> = {
  createOutput: {
    id: 'createOutput',
    name: 'create output',
    description: 'creates structured outputs and artifacts in the ui',
    category: 'output',
    enabled: true,
  },
  jinaReader: {
    id: 'jinaReader',
    name: 'jina reader',
    description: 'extracts clean content from urls',
    category: 'web',
    enabled: true,
  },
  summarizeUrl: {
    id: 'summarizeUrl',
    name: 'summarize url',
    description: 'fetches a webpage and returns a short summary',
    category: 'web',
    enabled: true,
  },
  // mcp tools - to be migrated from xml to typescript
  firecrawl: {
    id: 'firecrawl',
    name: 'firecrawl',
    description: 'comprehensive web scraping and crawling',
    category: 'web',
    enabled: false, // will be enabled when migrated
  },
  github: {
    id: 'github',
    name: 'github',
    description: 'github repository and issue management',
    category: 'development',
    enabled: false, // will be enabled when migrated
  },
  gmail: {
    id: 'gmail',
    name: 'gmail',
    description: 'email management and contact operations',
    category: 'communication',
    enabled: false, // will be enabled when migrated
  },
};

// get tools for a specific agent
export function getToolsForAgent(agentName: string): Record<string, any> {
  const tools: Record<string, any> = {};

  // chat agent gets all enabled tools
  if (agentName === 'chat') {
    if (toolRegistry.createOutput.enabled) {
      tools.createOutput = createOutputTool;
    }
    if (toolRegistry.jinaReader.enabled) {
      tools.jinaReader = jinaReaderTool;
    }
    if (toolRegistry.summarizeUrl.enabled) {
      tools.summarizeUrl = summarizeUrlTool;
    }
    // future mcp tools will be added here when migrated
  }

  // code agent will get code-specific tools
  if (agentName === 'code') {
    // future code-specific tools
  }

  return tools;
}

// get tools by category
export function getToolsByCategory(
  category: ToolMetadata['category']
): ToolMetadata[] {
  return Object.values(toolRegistry).filter(
    (tool) => tool.category === category
  );
}

// get tool metadata
export function getToolMetadata(toolId: string): ToolMetadata | undefined {
  return toolRegistry[toolId];
}
