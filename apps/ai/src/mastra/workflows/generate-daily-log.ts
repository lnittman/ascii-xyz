import { createStep, createWorkflow } from '@mastra/core/workflows'
import { Octokit } from '@octokit/rest'
import { and, eq, gte, isNull, lt } from 'drizzle-orm'
import { z } from 'zod'
import {
  activityDetails,
  activityLogs,
  db,
  repositories,
  userPreferences,
} from '@/lib/db'
import { codeAnalysisAgent } from '../agents/code-analysis-agents'

const dailyLogInputSchema = z.object({
  date: z.date().default(() => new Date()),
  forceRegenerate: z.boolean().default(false),
})

// Single step that generates the daily log
const generateDailyLogStep = createStep({
  id: 'generate-daily-log',
  description: 'Generate comprehensive daily activity log from GitHub',
  inputSchema: dailyLogInputSchema,
  outputSchema: z.object({
    logId: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    const { date, forceRegenerate } = inputData

    try {
      // Check if log already exists for this date
      if (!forceRegenerate) {
        const existingLog = await db
          .select()
          .from(activityLogs)
          .where(
            and(
              eq(activityLogs.logType, 'global'),
              isNull(activityLogs.repositoryId),
              gte(activityLogs.date, new Date(date.setHours(0, 0, 0, 0))),
              lt(activityLogs.date, new Date(date.setHours(23, 59, 59, 999)))
            )
          )
          .limit(1)

        if (existingLog.length > 0) {
          console.log('Daily log already exists for', date)
          return { logId: existingLog[0].id, success: true }
        }
      }

      // Get user preferences and GitHub token
      const [userPref] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, 'default'))
        .limit(1)

      if (!userPref?.globalLogsEnabled) {
        console.log('Global logs disabled')
        return { logId: '', success: false }
      }

      const githubToken = (userPref.metadata as any)?.githubToken
      if (!githubToken) {
        console.error('GitHub not connected')
        return { logId: '', success: false }
      }

      const octokit = new Octokit({ auth: githubToken })

      // Get enabled repositories
      const enabledRepos = await db
        .select()
        .from(repositories)
        .where(
          and(
            eq(repositories.scope, 'github'),
            eq(repositories.analysisEnabled, true)
          )
        )

      if (enabledRepos.length === 0) {
        console.log('No repositories enabled for analysis')
        return { logId: '', success: false }
      }

      // Fetch activity from GitHub for each repo
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const allActivities = []

      for (const repo of enabledRepos) {
        try {
          // Fetch commits
          const { data: commits } = await octokit.repos.listCommits({
            owner: repo.owner,
            repo: repo.name,
            since: startOfDay.toISOString(),
            until: endOfDay.toISOString(),
          })

          // Fetch pull requests
          const { data: pulls } = await octokit.pulls.list({
            owner: repo.owner,
            repo: repo.name,
            state: 'all',
            sort: 'updated',
            direction: 'desc',
          })

          // Filter PRs updated today
          const todayPRs = pulls.filter((pr) => {
            const updatedAt = new Date(pr.updated_at)
            return updatedAt >= startOfDay && updatedAt <= endOfDay
          })

          // Fetch issues
          const { data: issues } = await octokit.issues.listForRepo({
            owner: repo.owner,
            repo: repo.name,
            state: 'all',
            since: startOfDay.toISOString(),
          })

          // Filter issues updated today (excluding PRs)
          const todayIssues = issues.filter((issue) => {
            const updatedAt = new Date(issue.updated_at)
            return (
              updatedAt >= startOfDay &&
              updatedAt <= endOfDay &&
              !issue.pull_request
            )
          })

          allActivities.push({
            repository: repo.fullName,
            language: repo.language,
            commits: commits.map((c) => ({
              sha: c.sha,
              message: c.commit.message,
              author: c.commit.author?.name,
              url: c.html_url,
            })),
            pullRequests: todayPRs.map((pr) => ({
              number: pr.number,
              title: pr.title,
              state: pr.state,
              url: pr.html_url,
              merged: pr.merged_at !== null,
            })),
            issues: todayIssues.map((issue) => ({
              number: issue.number,
              title: issue.title,
              state: issue.state,
              url: issue.html_url,
            })),
          })
        } catch (error) {
          console.error(`Error fetching activity for ${repo.fullName}:`, error)
        }
      }

      // Generate AI summary
      const analysisPrompt = `
        Analyze the following GitHub activity across multiple repositories and create a comprehensive daily summary.
        
        Date: ${date.toISOString().split('T')[0]}
        
        Activity by Repository:
        ${JSON.stringify(allActivities, null, 2)}
        
        Please provide:
        1. A compelling narrative summary (2-3 paragraphs) that tells the story of the day's development work
        2. 5-10 bullet points highlighting the most significant accomplishments
        3. Cross-repository patterns and insights if multiple repos were active
        4. Technical highlights and decisions made
        5. Metrics summary
        
        Consider:
        - What was the main focus of the day?
        - What problems were solved?
        - What progress was made on ongoing projects?
        - Any interesting patterns across repositories?
        
        Format the response as JSON with:
        {
          "title": "string - a short, human-readable title (3-6 words) that captures the essence of the day's work",
          "summary": "string - narrative summary",
          "bullets": ["string - key accomplishments"],
          "technicalHighlights": ["string - technical decisions and patterns"],
          "metrics": {
            "totalCommits": number,
            "totalPRs": number,
            "totalIssues": number,
            "activeRepos": number,
            "primaryLanguages": ["string"]
          }
        }
      `

      const analysisResult = await codeAnalysisAgent.generate([
        { role: 'user', content: analysisPrompt },
      ])

      const analysis = JSON.parse(analysisResult.text || '{}')

      // Calculate metrics
      const metrics = {
        totalCommits: allActivities.reduce(
          (sum, a) => sum + a.commits.length,
          0
        ),
        totalPullRequests: allActivities.reduce(
          (sum, a) => sum + a.pullRequests.length,
          0
        ),
        totalIssues: allActivities.reduce((sum, a) => sum + a.issues.length, 0),
        totalRepos: allActivities.filter(
          (a) =>
            a.commits.length > 0 ||
            a.pullRequests.length > 0 ||
            a.issues.length > 0
        ).length,
        languages: Array.from(
          new Set(allActivities.map((a) => a.language).filter(Boolean))
        ) as string[],
      }

      // Store the log
      const [newLog] = await db
        .insert(activityLogs)
        .values({
          date: new Date(date),
          logType: 'global',
          repositoryId: null,
          title:
            analysis.title ||
            `Activity for ${date.toISOString().split('T')[0]}`,
          summary: analysis.summary || 'Daily development activity analyzed.',
          bullets: analysis.bullets || [],
          rawData: { activities: allActivities, analysis },
          metadata: {
            totalCommits: metrics.totalCommits,
            totalPullRequests: metrics.totalPullRequests,
            totalIssues: metrics.totalIssues,
            totalRepos: metrics.totalRepos,
            languages: metrics.languages,
            topProjects: allActivities
              .filter(
                (a) =>
                  a.commits.length > 0 ||
                  a.pullRequests.length > 0 ||
                  a.issues.length > 0
              )
              .map((a) => a.repository)
              .slice(0, 5),
            architectureDecisions: analysis.technicalHighlights || [],
          },
          processed: true,
        })
        .returning()

      // Store activity details
      const details = []

      for (const activity of allActivities) {
        // Store commits
        for (const commit of activity.commits) {
          details.push({
            logId: newLog.id,
            type: 'commit' as const,
            title: commit.message.split('\n')[0],
            description: commit.message,
            url: commit.url,
            metadata: {
              repository: activity.repository,
              sha: commit.sha,
              author: commit.author,
            },
          })
        }

        // Store PRs
        for (const pr of activity.pullRequests) {
          details.push({
            logId: newLog.id,
            type: 'pr' as const,
            title: `PR #${pr.number}: ${pr.title}`,
            description: `${pr.state} - ${pr.merged ? 'Merged' : 'Not merged'}`,
            url: pr.url,
            metadata: {
              repository: activity.repository,
              number: pr.number,
              state: pr.state,
              merged: pr.merged,
            },
          })
        }

        // Store issues
        for (const issue of activity.issues) {
          details.push({
            logId: newLog.id,
            type: 'issue' as const,
            title: `Issue #${issue.number}: ${issue.title}`,
            description: issue.state,
            url: issue.url,
            metadata: {
              repository: activity.repository,
              number: issue.number,
              state: issue.state,
            },
          })
        }
      }

      if (details.length > 0) {
        await db.insert(activityDetails).values(details)
      }

      return { logId: newLog.id, success: true }
    } catch (error) {
      console.error('Error generating daily log:', error)
      return { logId: '', success: false }
    }
  },
})

// Create the workflow
export const generateDailyLog = createWorkflow({
  id: 'generate-daily-log',
  description: 'Generate daily activity log from GitHub',
  inputSchema: dailyLogInputSchema,
  outputSchema: z.object({
    logId: z.string(),
    success: z.boolean(),
  }),
})
  .then(generateDailyLogStep)
  .commit()

export default generateDailyLog
