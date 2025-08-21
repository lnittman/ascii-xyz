import { Agent } from '@mastra/core/agent'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { readFileSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'
import { commitAnalysisSchema } from '../types/analysis'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

// Load XML instructions
const instructions = readFileSync(
  join(process.cwd(), 'src/mastra/instructions/commit-analysis.xml'),
  'utf-8'
)

export const commitAnalysisAgent = new Agent({
  id: 'commit-analysis',
  name: 'Commit Analysis Agent',
  description: 'Analyzes individual git commits with deep code understanding',
  model: openrouter('anthropic/claude-sonnet-4'),
  instructions,
  defaultGenerateOptions: {
    output: commitAnalysisSchema,
    temperature: 0.3, // Lower temperature for consistent technical analysis
  },
})