import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { checkExistingLogStep } from './steps/check-existing-log'
import { fetchCommitsStep } from './steps/fetch-commits'
import { analyzeCommitsStep } from './steps/analyze-commits'
import { analyzeRepositoriesStep } from './steps/analyze-repositories'
import { generateGlobalAnalysisStep } from './steps/generate-global-analysis'
import { storeAnalysisStep } from './steps/store-analysis'

const workflowInputSchema = z.object({
  date: z.date().default(() => new Date()),
  forceRegenerate: z.boolean().default(false),
})

// Conditional step to check if we should continue
const shouldContinueStep = createStep({
  id: 'should-continue',
  description: 'Determine if analysis should proceed',
  inputSchema: z.object({
    shouldContinue: z.boolean(),
    logId: z.string().optional(),
    githubToken: z.string().optional(),
    date: z.date(),
  }),
  outputSchema: z.object({
    proceed: z.boolean(),
    githubToken: z.string(),
    date: z.date(),
    existingLogId: z.string().optional(),
  }),
  execute: async ({ inputData }) => {
    const { shouldContinue, logId, githubToken, date } = inputData
    
    if (!shouldContinue || !githubToken) {
      // Return early termination signal
      return {
        proceed: false,
        githubToken: githubToken || '',
        date,
        existingLogId: logId,
      }
    }
    
    return {
      proceed: true,
      githubToken,
      date,
      existingLogId: logId,
    }
  },
})

// Main workflow definition using proper composition
export const dailyGithubAnalysisWorkflow = createWorkflow({
  id: 'daily-github-analysis',
  description: 'Comprehensive daily GitHub activity analysis with multi-level insights',
  inputSchema: workflowInputSchema,
  outputSchema: z.object({
    logId: z.string(),
    success: z.boolean(),
  }),
})
  .then(checkExistingLogStep)
  .then(shouldContinueStep)
  .branch([
    [
      async ({ inputData }) => inputData.proceed === true,
      createWorkflow({
        id: 'analysis-pipeline',
        inputSchema: z.object({
          proceed: z.boolean(),
          githubToken: z.string(),
          date: z.date(),
          existingLogId: z.string().optional(),
        }),
        outputSchema: z.object({
          logId: z.string(),
          success: z.boolean(),
        }),
      })
        .map(({ inputData }) => ({
          date: inputData.date,
          githubToken: inputData.githubToken,
        }))
        .then(fetchCommitsStep)
        .map({
          commits: { step: fetchCommitsStep, path: 'commits' },
        })
        .then(analyzeCommitsStep)
        .map({
          commitAnalyses: { step: analyzeCommitsStep, path: 'analyses' },
        })
        .then(analyzeRepositoriesStep)
        .map({
          repoAnalyses: { step: analyzeRepositoriesStep, path: 'repoAnalyses' },
          commitAnalyses: { step: analyzeCommitsStep, path: 'analyses' },
        })
        .then(generateGlobalAnalysisStep)
        .map(({ inputData, getInitData }) => ({
          globalAnalysis: inputData.globalAnalysis,
          repoAnalyses: inputData.repoAnalyses,
          commitAnalyses: inputData.commitAnalyses,
          date: getInitData().date,
        }))
        .then(storeAnalysisStep)
        .commit()
    ],
    [
      async ({ inputData }) => inputData.proceed === false,
      createStep({
        id: 'early-exit',
        description: 'Exit early when analysis should not proceed',
        inputSchema: z.object({
          proceed: z.boolean(),
          githubToken: z.string(),
          date: z.date(),
          existingLogId: z.string().optional(),
        }),
        outputSchema: z.object({
          logId: z.string(),
          success: z.boolean(),
        }),
        execute: async ({ inputData }) => {
          return {
            logId: inputData.existingLogId || '',
            success: !!inputData.existingLogId,
          }
        },
      })
    ],
  ])
  .commit()

export default dailyGithubAnalysisWorkflow