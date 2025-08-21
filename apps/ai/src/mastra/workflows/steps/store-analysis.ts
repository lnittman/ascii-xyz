import { createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { activityDetails, activityLogs, db } from '@/lib/db'
import type { GlobalAnalysis, RepoAnalysis, CommitAnalysis } from '../../types/analysis'

export const storeAnalysisStep = createStep({
  id: 'store-analysis',
  description: 'Store all analysis data in the database',
  inputSchema: z.object({
    globalAnalysis: z.any(), // GlobalAnalysis
    repoAnalyses: z.array(z.any()), // RepoAnalysis[]
    commitAnalyses: z.array(
      z.object({
        repository: z.string(),
        sha: z.string(),
        analysis: z.any(), // CommitAnalysis
      })
    ),
    date: z.union([z.date(), z.string()]),
  }),
  outputSchema: z.object({
    logId: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger()
    const { globalAnalysis, repoAnalyses, commitAnalyses, date } = inputData

    // Handle case where date might be undefined
    const dateStr = date ? (typeof date === 'string' ? date : date.toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
    
    logger?.info('💾 Starting: Storing analysis data to database', { 
      date: dateStr,
      repoCount: repoAnalyses?.length || 0,
      commitCount: commitAnalyses?.length || 0,
      suggestionCount: globalAnalysis?.suggestions?.length || 0
    })

    try {
      // Store main activity log with enhanced metadata
      logger?.info('📝 Storing main activity log')
      const [newLog] = await db
        .insert(activityLogs)
        .values({
          date: new Date(date),
          logType: 'global',
          repositoryId: null,
          title: globalAnalysis.title,
          summary: globalAnalysis.narrative,
          bullets: globalAnalysis.highlights,
          rawData: {
            globalAnalysis,
            repoAnalyses,
            commitAnalyses,
          },
          metadata: {
            ...globalAnalysis.metrics,
            suggestions: globalAnalysis.suggestions?.map((s: any) => ({
              id: s.id,
              title: s.title,
              category: s.category,
              priority: s.priority,
            })),
            repoSummaries: globalAnalysis.repoSummaries,
            crossRepoPatterns: globalAnalysis.crossRepoPatterns,
            technicalThemes: globalAnalysis.technicalThemes,
            codeQualityTrend: globalAnalysis.metrics.codeQualityTrend,
            productivityScore: globalAnalysis.metrics.productivityScore,
          },
          processed: true,
          analysisDepth: 'deep',
        })
        .returning()

      logger?.info('✅ Main log stored', { logId: newLog.id })

      // Store detailed activity records
      const details = []
      
      // Store commit analyses as details
      logger?.info(`📊 Storing ${commitAnalyses.length} commit analyses`)
      for (const { repository, sha, analysis } of commitAnalyses) {
        details.push({
          logId: newLog.id,
          type: 'commit' as const,
          title: analysis.summary,
          description: JSON.stringify({
            impact: analysis.impact,
            category: analysis.category,
            technicalDetails: analysis.technicalDetails,
            codeQuality: analysis.codeQuality,
            patterns: analysis.patterns,
            potentialIssues: analysis.potentialIssues,
          }),
          url: `https://github.com/${repository}/commit/${sha}`,
          metadata: {
            repository,
            sha,
            analysis,
          },
        })
      }

      // Store repository analyses as details
      if (repoAnalyses && repoAnalyses.length > 0) {
        logger?.info(`📁 Storing ${repoAnalyses.length} repository analyses`)
        for (const repoAnalysis of repoAnalyses) {
          const summary = repoAnalysis.summary || 'No activity'
          const title = repoAnalysis.repository 
            ? `${repoAnalysis.repository}: ${summary.substring(0, 100)}${summary.length > 100 ? '...' : ''}`
            : `Repository: ${summary.substring(0, 100)}${summary.length > 100 ? '...' : ''}`
          
          details.push({
            logId: newLog.id,
            type: 'repository' as const,
            title,
            description: JSON.stringify({
              momentum: repoAnalysis.momentum,
              codeHealth: repoAnalysis.codeHealth,
              focusAreas: repoAnalysis.focusAreas,
              metrics: repoAnalysis.metrics,
            }),
            url: repoAnalysis.repository ? `https://github.com/${repoAnalysis.repository}` : '',
            metadata: repoAnalysis,
          })
        }
      }

      // Store suggestions as separate details
      if (globalAnalysis.suggestions && Array.isArray(globalAnalysis.suggestions)) {
        logger?.info(`💡 Storing ${globalAnalysis.suggestions.length} suggestions`)
        for (const suggestion of globalAnalysis.suggestions) {
          details.push({
            logId: newLog.id,
            type: 'suggestion' as const,
            title: suggestion.title,
            description: suggestion.rationale,
            url: '', // No URL for suggestions
            metadata: {
              suggestion,
              prompt: suggestion.prompt,
              category: suggestion.category,
              priority: suggestion.priority,
              estimatedEffort: suggestion.estimatedEffort,
              dependencies: suggestion.dependencies,
              contextFiles: suggestion.contextFiles,
              relatedCommits: suggestion.relatedCommits,
            },
          })
        }
      }

      // Store all details
      if (details.length > 0) {
        logger?.info(`📦 Storing ${details.length} detail records`)
        await db.insert(activityDetails).values(details)
        logger?.info('✅ All detail records stored successfully')
      }

      logger?.info(`🎉 Storage complete: Daily analysis with ${details.length} detail records`, {
        logId: newLog.id,
        commitDetails: commitAnalyses.length,
        repoDetails: repoAnalyses.length,
        suggestionDetails: globalAnalysis.suggestions?.length || 0
      })
      return { logId: newLog.id, success: true }
    } catch (error) {
      logger?.error(`❌ Error storing analysis data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return { logId: '', success: false }
    }
  },
})