import { Agent } from '@mastra/core/agent'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { readFileSync } from 'fs'
import { join } from 'path'
import { repoAnalysisSchema } from '../types/analysis'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

// Load XML instructions
const instructions = readFileSync(
  join(process.cwd(), 'src/mastra/instructions/repository-analysis.xml'),
  'utf-8'
)

export const repositoryAnalysisAgent = new Agent({
  id: 'repository-analysis',
  name: 'Repository Analysis Agent',
  description: 'Synthesizes commit analyses into repository-level insights',
  model: openrouter('anthropic/claude-sonnet-4'),
  instructions,
  defaultGenerateOptions: {
    output: repoAnalysisSchema,
    temperature: 0.4, // Slightly higher for narrative generation
  },
})