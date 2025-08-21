import { createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { repositoryAnalysisAgent } from '../../agents/repository-analysis'
import type { CommitAnalysis, RepoAnalysis } from '../../types/analysis'

export const analyzeRepositoriesStep = createStep({
  id: 'analyze-repositories',
  description: 'Generate repository-level analysis from commit analyses',
  inputSchema: z.object({
    commitAnalyses: z.array(
      z.object({
        repository: z.string(),
        sha: z.string(),
        analysis: z.any(),
      })
    ),
    date: z.date(),
  }),
  outputSchema: z.object({
    repoAnalyses: z.array(z.any()), // RepoAnalysis[]
  }),
  execute: async ({ inputData }) => {
    const { commitAnalyses, date } = inputData
    
    // Group analyses by repository
    const byRepo = commitAnalyses.reduce((acc, item) => {
      if (!acc[item.repository]) {
        acc[item.repository] = []
      }
      acc[item.repository].push({
        sha: item.sha,
        ...item.analysis,
      })
      return acc
    }, {} as Record<string, Array<CommitAnalysis & { sha: string }>>)

    const repoAnalyses = []

    for (const [repo, analyses] of Object.entries(byRepo)) {
      // Handle date properly - it might be undefined, string, or Date
      const dateStr = date ? (typeof date === 'string' ? date : date.toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
      
      const repoPrompt = `
Analyze today's repository activity:

Repository: ${repo}
Date: ${dateStr}
Total Commits: ${analyses.length}

Commit Analyses:
${JSON.stringify(analyses, null, 2)}

Synthesize this into a repository-level analysis following your instructions.
Focus on:
1. Overall progress narrative
2. Key achievements and patterns
3. Code health assessment
4. Strategic next steps
5. Development momentum

Connect individual commits into larger features and provide actionable insights.
      `.trim()

      const result = await repositoryAnalysisAgent.generate([
        { role: 'user', content: repoPrompt },
      ])

      const analysis = result.object || JSON.parse(result.text || '{}')
      analysis.repository = repo
      analysis.date = date ? (typeof date === 'string' ? date : date.toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
      
      repoAnalyses.push(analysis)
    }

    return { repoAnalyses }
  },
})