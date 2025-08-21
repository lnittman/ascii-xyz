import { createStep } from '@mastra/core/workflows'
import { and, eq, gte, isNull, lt } from 'drizzle-orm'
import { z } from 'zod'
import { activityLogs, db, userPreferences } from '@/lib/db'

export const checkExistingLogStep = createStep({
  id: 'check-existing-log',
  description: 'Check if daily log already exists and get GitHub token',
  inputSchema: z.object({
    date: z.date().default(() => new Date()),
    forceRegenerate: z.boolean().default(false),
  }),
  outputSchema: z.object({
    shouldContinue: z.boolean(),
    logId: z.string().optional(),
    githubToken: z.string().optional(),
    date: z.date(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger()
    const { date, forceRegenerate } = inputData
    
    logger?.info('🔍 Starting: Checking for existing log', { 
      date: date.toISOString().split('T')[0], 
      forceRegenerate 
    })

    // Check if log already exists
    if (!forceRegenerate) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const existingLog = await db
        .select()
        .from(activityLogs)
        .where(
          and(
            eq(activityLogs.logType, 'global'),
            isNull(activityLogs.repositoryId),
            gte(activityLogs.date, startOfDay),
            lt(activityLogs.date, endOfDay)
          )
        )
        .limit(1)

      if (existingLog.length > 0) {
        logger?.info('✅ Found existing log', { 
          logId: existingLog[0].id, 
          date: date.toISOString().split('T')[0] 
        })
        return { 
          shouldContinue: false,
          logId: existingLog[0].id,
          date
        }
      }
    }

    // Use GitHub token from environment for now
    const githubToken = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN
    if (!githubToken) {
      logger?.error('❌ GitHub token not configured in environment')
      return { 
        shouldContinue: false,
        date
      }
    }
    
    logger?.info('✅ No existing log found - proceeding with generation', { 
      date: date.toISOString().split('T')[0],
      hasToken: !!githubToken 
    })

    return { 
      shouldContinue: true,
      githubToken,
      date
    }
  },
})