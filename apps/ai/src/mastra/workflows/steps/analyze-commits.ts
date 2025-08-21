import { createStep, createWorkflow } from '@mastra/core/workflows'
import { Octokit } from '@octokit/rest'
import { z } from 'zod'
import { commitAnalysisAgent } from '../../agents/commit-analysis'
import type { CommitAnalysis } from '../../types/analysis'

// Fetch commit details with rate limit handling
async function fetchCommitDiff(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string
) {
  try {
    const { data: commit } = await octokit.repos.getCommit({
      owner,
      repo,
      ref: sha,
    })

    const files = commit.files?.map((file) => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch,
      previous_filename: file.previous_filename,
    })) || []

    return {
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author,
      committer: commit.commit.committer,
      stats: commit.stats,
      files,
      html_url: commit.html_url,
      parents: commit.parents.map((p) => p.sha),
    }
  } catch (error: any) {
    // If rate limited or 404, return basic info we already have
    if (error.status === 403 || error.status === 404) {
      console.log(`⚠️ Skipping detailed fetch for ${sha} (${error.status})`)
      return null
    }
    console.error(`Error fetching commit ${sha}:`, error)
    return null
  }
}

// Bulk fetch commits using GraphQL to minimize API calls
async function bulkFetchCommits(
  octokit: Octokit,
  commits: Array<{ repository: string; sha: string; message: string }>
) {
  // Group commits by repository for efficient fetching
  const commitsByRepo = commits.reduce((acc, commit) => {
    if (!acc[commit.repository]) {
      acc[commit.repository] = []
    }
    acc[commit.repository].push(commit)
    return acc
  }, {} as Record<string, typeof commits>)

  console.log(`📦 Bulk fetching commits from ${Object.keys(commitsByRepo).length} repos using GraphQL`)

  const results = []
  
  // Use GraphQL to fetch multiple commits in one request per repo
  for (const [repoPath, repoCommits] of Object.entries(commitsByRepo)) {
    const [owner, repo] = repoPath.split('/')
    
    try {
      // GraphQL query to fetch multiple commits at once
      const query = `
        query($owner: String!, $repo: String!, $shas: [String!]!) {
          repository(owner: $owner, name: $repo) {
            ${repoCommits.slice(0, 10).map((c, i) => `
              commit${i}: object(oid: "${c.sha}") {
                ... on Commit {
                  oid
                  message
                  additions
                  deletions
                  changedFiles
                  author {
                    name
                    email
                    date
                  }
                }
              }
            `).join('\n')}
          }
        }
      `
      
      const response = await octokit.graphql(query, {
        owner,
        repo,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
      
      // Process GraphQL response
      if (response.repository) {
        repoCommits.forEach((commit, i) => {
          const commitData = response.repository[`commit${i}`]
          if (commitData) {
            results.push({
              repository: repoPath,
              sha: commit.sha,
              message: commit.message,
              stats: {
                additions: commitData.additions || 0,
                deletions: commitData.deletions || 0,
                total: (commitData.additions || 0) + (commitData.deletions || 0)
              },
              author: commitData.author
            })
          } else {
            // Fallback to basic info
            results.push({
              repository: repoPath,
              sha: commit.sha,
              message: commit.message,
              stats: null,
              author: null
            })
          }
        })
      }
    } catch (error: any) {
      console.log(`⚠️ GraphQL failed for ${repoPath}, using basic info:`, error.message)
      // If GraphQL fails, use the basic info we have
      repoCommits.forEach(commit => {
        results.push({
          repository: repoPath,
          sha: commit.sha,
          message: commit.message,
          stats: null,
          author: null
        })
      })
    }
  }
  
  return results
}

// Step to prepare commits for parallel processing
export const prepareCommitsStep = createStep({
  id: 'prepare-commits',
  description: 'Prepare commits for parallel analysis',
  inputSchema: z.object({
    commits: z.array(
      z.object({
        repository: z.string(),
        owner: z.string(),
        name: z.string(),
        sha: z.string(),
        message: z.string(),
        url: z.string(),
        author: z.object({
          name: z.string().nullable(),
          email: z.string().nullable(),
          date: z.string().nullable(),
        }),
      })
    ),
    githubToken: z.string(),
  }),
  outputSchema: z.object({
    commitsToAnalyze: z.array(
      z.object({
        commit: z.object({
          repository: z.string(),
          owner: z.string(),
          name: z.string(),
          sha: z.string(),
          message: z.string(),
          url: z.string(),
          author: z.object({
            name: z.string().nullable(),
            email: z.string().nullable(),
            date: z.string().nullable(),
          }),
        }),
        githubToken: z.string(),
      })
    ),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger()
    const { commits, githubToken } = inputData
    const octokit = new Octokit({ auth: githubToken })
    
    logger?.info('📦 Preparing commits for parallel analysis', { 
      commitCount: commits.length 
    })
    
    // First try bulk fetching with GraphQL
    const enrichedCommits = await bulkFetchCommits(octokit, commits)
    console.log(`📊 Bulk fetch complete: ${enrichedCommits.length} commits enriched`)
    
    // Map each commit with the github token for individual processing
    const commitsToAnalyze = commits.map(commit => ({
      commit,
      githubToken,
    }))
    
    logger?.info(`✅ Ready for parallel processing: ${commitsToAnalyze.length} commits`)
    return { commitsToAnalyze }
  },
})

// Individual commit analysis step
export const analyzeSingleCommitStep = createStep({
  id: 'analyze-single-commit',
  description: 'Analyze a single commit with full code diff',
  inputSchema: z.object({
    commit: z.object({
      repository: z.string(),
      owner: z.string(),
      name: z.string(),
      sha: z.string(),
      message: z.string(),
      url: z.string(),
      author: z.object({
        name: z.string().nullable(),
        email: z.string().nullable(),
        date: z.string().nullable(),
      }),
    }),
    githubToken: z.string(),
  }),
  outputSchema: z.object({
    repository: z.string(),
    sha: z.string(),
    analysis: z.any(), // CommitAnalysis type
    error: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger()
    const { commit, githubToken } = inputData
    const octokit = new Octokit({ auth: githubToken })
    
    logger?.info(`🔧 Analyzing commit: ${commit.sha.slice(0, 7)} in ${commit.repository}`)
    
    try {
      // Fetch full commit details including diffs
      const commitDetails = await fetchCommitDiff(
        octokit,
        commit.owner,
        commit.name,
        commit.sha
      )

      if (!commitDetails) {
        logger?.error(`❌ Failed to fetch details for ${commit.sha}`)
        return {
          repository: commit.repository,
          sha: commit.sha,
          analysis: null,
          error: 'Failed to fetch commit details',
        }
      }
      
      logger?.info(`📊 Fetched commit details`, { 
        sha: commit.sha.slice(0, 7),
        filesChanged: commitDetails.files.length,
        additions: commitDetails.stats?.additions,
        deletions: commitDetails.stats?.deletions 
      })

      // Prepare diff context for analysis (include all files but limit huge diffs)
      const MAX_DIFF_SIZE = 3000 // Characters per file diff
      const MAX_TOTAL_DIFF = 50000 // Total diff size to avoid context overflow
      
      let totalDiffSize = 0
      const diffContext = commitDetails.files
        .map((file) => {
          // Skip if we've already hit our total limit
          if (totalDiffSize >= MAX_TOTAL_DIFF) return null
          
          const patch = file.patch || ''
          const truncatedPatch = patch.length > MAX_DIFF_SIZE 
            ? patch.slice(0, MAX_DIFF_SIZE) + '\n... [diff truncated]'
            : patch
          
          const fileDiff = `
File: ${file.filename}
Status: ${file.status}
Changes: +${file.additions} -${file.deletions}
${truncatedPatch ? `\nDiff:\n${truncatedPatch}` : 'No diff available'}
          `.trim()
          
          totalDiffSize += fileDiff.length
          return fileDiff
        })
        .filter(Boolean)
        .join('\n\n---\n\n')

      const analysisPrompt = `
Analyze this Git commit:

Repository: ${commit.repository}
SHA: ${commit.sha}
Message: ${commitDetails.message}
Author: ${commitDetails.author?.name} <${commitDetails.author?.email}>
Stats: ${commitDetails.stats?.total} changes (+${commitDetails.stats?.additions} -${commitDetails.stats?.deletions})
Files: ${commitDetails.files.length}

Code Changes:
${diffContext}

Provide comprehensive analysis following your instructions.
      `.trim()

      logger?.info(`🤖 Sending to AI for analysis: ${commit.sha.slice(0, 7)}`)
      
      const result = await commitAnalysisAgent.generate([
        { role: 'user', content: analysisPrompt },
      ])

      logger?.info(`✅ Analysis complete for ${commit.sha.slice(0, 7)}`)
      
      return {
        repository: commit.repository,
        sha: commit.sha,
        analysis: result.object || JSON.parse(result.text || '{}'),
      }
    } catch (error) {
      logger?.error(`❌ Error analyzing commit ${commit.sha}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        repository: commit.repository,
        sha: commit.sha,
        analysis: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
})

// Step to collect results from parallel analysis
export const collectAnalysesStep = createStep({
  id: 'collect-analyses',
  description: 'Collect and filter successful analyses',
  inputSchema: z.object({
    results: z.array(
      z.object({
        repository: z.string(),
        sha: z.string(),
        analysis: z.any().nullable(),
        error: z.string().optional(),
      })
    ),
  }),
  outputSchema: z.object({
    analyses: z.array(
      z.object({
        repository: z.string(),
        sha: z.string(),
        analysis: z.any(),
      })
    ),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger()
    const { results } = inputData
    
    logger?.info('📦 Collecting analysis results', { 
      totalResults: results.length 
    })
    
    // Filter out failed analyses and transform to expected format
    const analyses = results
      .filter(result => result.analysis !== null && !result.error)
      .map(result => ({
        repository: result.repository,
        sha: result.sha,
        analysis: result.analysis,
      }))
    
    const failedCount = results.length - analyses.length
    if (failedCount > 0) {
      logger?.warn(`⚠️ ${failedCount} commit analyses failed`)
    }
    
    logger?.info(`🎉 Collection complete: ${analyses.length}/${results.length} commits analyzed successfully`)
    return { analyses }
  },
})

// Create a sub-workflow for parallel commit analysis
export const parallelCommitAnalysisWorkflow = createWorkflow({
  id: 'parallel-commit-analysis',
  description: 'Analyze commits in parallel with rate limiting',
  inputSchema: z.object({
    commits: z.array(
      z.object({
        repository: z.string(),
        owner: z.string(),
        name: z.string(),
        sha: z.string(),
        message: z.string(),
        url: z.string(),
        author: z.object({
          name: z.string().nullable(),
          email: z.string().nullable(),
          date: z.string().nullable(),
        }),
      })
    ),
    githubToken: z.string(),
  }),
  outputSchema: z.object({
    analyses: z.array(
      z.object({
        repository: z.string(),
        sha: z.string(),
        analysis: z.any(),
      })
    ),
  }),
})
  .then(prepareCommitsStep)
  .map(({ inputData }) => inputData.commitsToAnalyze)
  .foreach(analyzeSingleCommitStep, { concurrency: 2 }) // Process 2 commits in parallel to avoid rate limits
  .map(({ inputData }) => ({ results: inputData }))
  .then(collectAnalysesStep)
  .commit()

// Keep the original step for backward compatibility but use the parallel workflow
export const analyzeCommitsStep = createStep({
  id: 'analyze-commits',
  description: 'Analyze commits in parallel',
  inputSchema: z.object({
    commits: z.array(
      z.object({
        repository: z.string(),
        owner: z.string(),
        name: z.string(),
        sha: z.string(),
        message: z.string(),
        url: z.string(),
        author: z.object({
          name: z.string().nullable(),
          email: z.string().nullable(),
          date: z.string().nullable(),
        }),
      })
    ),
    githubToken: z.string(),
  }),
  outputSchema: z.object({
    analyses: z.array(
      z.object({
        repository: z.string(),
        sha: z.string(),
        analysis: z.any(),
      })
    ),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger()
    const { commits, githubToken } = inputData
    
    logger?.info('🚀 Starting parallel commit analysis workflow', { 
      commitCount: commits.length 
    })
    
    // Use the parallel workflow for processing
    const workflow = parallelCommitAnalysisWorkflow
    const run = await workflow.createRunAsync()
    const result = await run.start({
      inputData: { commits, githubToken },
    })
    
    if (result.status === 'success') {
      logger?.info('🎉 Parallel analysis workflow completed successfully')
      return result.result
    } else {
      logger?.error('❌ Parallel commit analysis failed', result)
      return { analyses: [] }
    }
  },
})