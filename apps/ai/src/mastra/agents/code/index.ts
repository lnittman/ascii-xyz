import { Agent } from '@mastra/core/agent';
import type { RuntimeContext } from '@mastra/core/di';

import { createModelFromContext } from '../../lib/utils/models.js';
import { createMemory } from './memory';
// import { createOutputTool } from "../../tools/output-tools";

const instructions =
  'You are a coding assistant that helps with programming tasks, debugging, and technical questions. You provide clear, concise code examples and explanations.';

export type CodeRuntimeContext = {
  'chat-model'?: string;
  'openai-api-key'?: string;
  'anthropic-api-key'?: string;
  'google-api-key'?: string;
  'openrouter-api-key'?: string;
  [key: string]: any;
};

export const createCodeAgent = (env?: any) => {
  return new Agent({
    instructions: instructions,
    model: ({
      runtimeContext,
    }: { runtimeContext?: RuntimeContext<CodeRuntimeContext> }) => {
      // Use runtime context for dynamic model selection with z.ai/glm-4.5 as default
      return createModelFromContext({
        runtimeContext,
        defaultModelId: 'z-ai/glm-4.5',
      });
    },
    name: 'code',
    memory: createMemory(env),
    tools: {
      // createOutput: createOutputTool,
      // TODO: add code tools
    },
  });
};

// export const codeAgent = createCodeAgent();
// export default codeAgent;
