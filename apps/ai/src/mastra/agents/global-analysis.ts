import { Agent } from '@mastra/core/agent'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { readFileSync } from 'fs'
import { join } from 'path'
import { globalAnalysisSchema } from '../types/analysis'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

// Load XML instructions
const instructions = readFileSync(
  join(process.cwd(), 'src/mastra/instructions/global-analysis.xml'),
  'utf-8'
)

export const globalAnalysisAgent = new Agent({
  id: 'global-analysis',
  name: 'Global Analysis Agent',
  description: 'Creates comprehensive daily summaries with contextual suggestions',
  model: openrouter('anthropic/claude-sonnet-4'),
  instructions,
  defaultGenerateOptions: {
    output: globalAnalysisSchema,
    temperature: 0.5, // Higher for creative suggestions
  },
})