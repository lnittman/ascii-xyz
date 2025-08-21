import { Agent } from '@mastra/core/agent'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import {
  fetchCommitDetailsTool,
  fetchRepoInfoTool,
  fetchUserActivityTool,
} from '../tools/github-tools'

// Initialize OpenRouter with Claude
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

export const commitAnalyzerAgent = new Agent({
  id: 'commit-analyzer',
  name: 'Commit Analyzer',
  description: 'Analyzes GitHub commits and provides insights',
  instructions: `You are a commit analyzer that examines GitHub commits and provides insights.
  Your job is to:
  1. Analyze commit messages and code changes
  2. Identify the type of work done (feature, bugfix, refactor, docs, etc.)
  3. Assess the impact and importance of changes
  4. Extract key technical details and dependencies
  5. Summarize the work in a clear, concise manner
  
  Focus on technical accuracy and provide meaningful insights about the development work.`,
  model: openrouter('anthropic/claude-sonnet-4'),
  tools: { fetchCommitDetailsTool },
})

export const activitySummarizerAgent = new Agent({
  id: 'activity-summarizer',
  name: 'Activity Summarizer',
  description: 'Summarizes GitHub activity into actionable insights',
  instructions: `You are a GitHub activity summarizer that creates daily development logs.
  Your job is to:
  1. Analyze all GitHub activity for a given day
  2. Create a high-level summary of the day's work
  3. Generate bullet points of key accomplishments
  4. Identify patterns in development activity
  5. Highlight important milestones or significant changes
  
  Write in a professional but conversational tone, as if you're giving a standup update.
  Focus on what was accomplished, not just what was done.
  Make it interesting and highlight the impact of the work.`,
  model: openrouter('anthropic/claude-sonnet-4'),
  tools: { fetchUserActivityTool, fetchRepoInfoTool },
})

export const repoAnalyzerAgent = new Agent({
  id: 'repo-analyzer',
  name: 'Repository Analyzer',
  description: 'Analyzes repository structure and patterns',
  instructions: `You are a repository analyzer that understands codebases and projects.
  Your job is to:
  1. Analyze repository metadata and structure
  2. Understand the technology stack and dependencies
  3. Identify the project's purpose and scope
  4. Track changes and evolution over time
  5. Provide context for development work
  
  Be technical but accessible, providing insights that help understand the bigger picture.`,
  model: openrouter('anthropic/claude-sonnet-4'),
  tools: { fetchRepoInfoTool },
})
