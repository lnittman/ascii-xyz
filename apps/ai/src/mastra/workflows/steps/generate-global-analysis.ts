import { createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { globalAnalysisAgent } from '../../agents/global-analysis'
import type { GlobalAnalysis } from '../../types/analysis'

const suggestionPromptTemplate = `
# Task: {title}

## Objective
{objective}

## Context
Based on recent work in {repository}:
{recent_context}

## Requirements
- {requirements}

## Implementation Steps
{steps}

## Technical Specifications
{specifications}

## Files to Modify
{files}

## Testing Requirements
{testing}

## Success Criteria
{criteria}

## Related Commits
{commits}

## Current Patterns
{patterns}
`

function generateSuggestionPrompt(
  suggestion: any,
  repoContext: any,
  commits: string[]
): string {
  return suggestionPromptTemplate
    .replace('{title}', suggestion.title)
    .replace('{objective}', suggestion.rationale || 'Complete this task')
    .replace('{repository}', repoContext?.repository || 'the repository')
    .replace('{recent_context}', repoContext?.summary || 'Recent development work')
    .replace('{requirements}', suggestion.dependencies?.join('\n- ') || 'None specified')
    .replace('{steps}', suggestion.steps || '1. Analyze current implementation\n2. Make necessary changes\n3. Test thoroughly')
    .replace('{specifications}', suggestion.specifications || 'Follow project conventions')
    .replace('{files}', suggestion.contextFiles?.join('\n- ') || 'To be determined')
    .replace('{testing}', suggestion.testing || 'Ensure all tests pass')
    .replace('{criteria}', suggestion.criteria || 'Task completed successfully')
    .replace('{commits}', commits.join('\n- '))
    .replace('{patterns}', suggestion.patterns || 'Follow existing patterns')
}

export const generateGlobalAnalysisStep = createStep({
  id: 'generate-global-analysis',
  description: 'Create comprehensive daily analysis with contextual suggestions',
  inputSchema: z.object({
    repoAnalyses: z.array(z.any()),
    commitAnalyses: z.array(
      z.object({
        repository: z.string(),
        sha: z.string(),
        analysis: z.any(),
      })
    ),
    date: z.union([z.date(), z.string()]),
  }),
  outputSchema: z.object({
    globalAnalysis: z.any(), // GlobalAnalysis
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger()
    const { repoAnalyses, commitAnalyses, date } = inputData
    
    // Ensure date is valid
    const analysisDate = date ? new Date(date) : new Date()
    const dateString = analysisDate.toISOString().split('T')[0]
    
    logger?.info('🌍 Starting global analysis generation', { 
      date: dateString,
      repoCount: repoAnalyses.length,
      commitCount: commitAnalyses.length 
    })

    const globalPrompt = `
Create a comprehensive daily development analysis.

Date: ${dateString}

Repository Analyses (${repoAnalyses.length} repos):
${JSON.stringify(repoAnalyses, null, 2)}

All Commit Analyses (${commitAnalyses.length} commits):
${JSON.stringify(commitAnalyses.map(c => ({
  repo: c.repository,
  sha: c.sha.substring(0, 7),
  summary: c.analysis.summary,
  impact: c.analysis.impact,
  category: c.analysis.category,
})), null, 2)}

Generate following your instructions:
1. Compelling narrative (2-3 paragraphs)
2. Key highlights (5-10 bullets)
3. Cross-repository patterns
4. Technical themes
5. 3-5 contextual suggestions for next steps

For each suggestion, create a detailed prompt that can be copy-pasted into Claude or Cursor.
Base suggestions on actual code changes and patterns from today.
Make them highly specific and actionable.
    `.trim()

    logger?.info('🤖 Sending to AI for global analysis')
    
    let globalAnalysis
    try {
      const result = await globalAnalysisAgent.generate([
        { role: 'user', content: globalPrompt },
      ])
      globalAnalysis = result.object || JSON.parse(result.text || '{}')
    } catch (error: any) {
      logger?.warn('⚠️ AI analysis failed, using fallback summary', { error: error.message })
      
      // Create a basic summary without AI when rate limited
      const totalCommits = commitAnalyses.length
      const totalRepos = repoAnalyses.length
      const repoNames = repoAnalyses.map(r => r.repository || 'unknown').filter(Boolean)
      
      globalAnalysis = {
        title: `Development Activity - ${dateString}`,
        narrative: `Worked across ${totalRepos} repositories with ${totalCommits} commits on ${dateString}. ${
          totalCommits > 20 ? 'High activity day with significant progress.' : 
          totalCommits > 10 ? 'Moderate activity with steady progress.' :
          'Focused work session with targeted improvements.'
        }`,
        highlights: [
          `${totalCommits} commits across ${totalRepos} repositories`,
          `Active repositories: ${repoNames.join(', ')}`,
          commitAnalyses.length > 0 ? `Primary focus: ${commitAnalyses[0].repository}` : 'Various development tasks',
        ],
        metrics: {
          totalCommits,
          totalRepos,
          totalAdditions: 0,
          totalDeletions: 0,
          totalChanges: 0,
          productivityScore: Math.min(100, totalCommits * 3),
          codeQualityTrend: 'stable'
        },
        suggestions: [],
        crossRepoPatterns: [],
        technicalThemes: [],
        repoSummaries: repoAnalyses.map(r => ({
          repository: r.repository,
          summary: r.summary || 'Activity recorded'
        }))
      }
    }
    globalAnalysis.date = dateString
    
    logger?.info('✅ Global analysis generated', { 
      date: dateString,
      narrativeLength: globalAnalysis.narrative?.length,
      highlightCount: globalAnalysis.highlights?.length,
      suggestionCount: globalAnalysis.suggestions?.length 
    })

    // Enhance suggestion prompts with full markdown templates
    if (globalAnalysis.suggestions && Array.isArray(globalAnalysis.suggestions)) {
      logger?.info('💡 Enhancing suggestions with detailed prompts')
      globalAnalysis.suggestions = globalAnalysis.suggestions.map((suggestion: any, index: number) => {
        // Generate unique ID if not present
        suggestion.id = suggestion.id || `suggestion-${date.getTime()}-${index}`
        
        // Get relevant commits for this suggestion
        const relevantCommits = commitAnalyses
          .filter(c => suggestion.relatedCommits?.includes(c.sha.substring(0, 7)))
          .map(c => `- ${c.sha.substring(0, 7)}: ${c.analysis.summary}`)
        
        // Generate full prompt if not detailed enough
        if (!suggestion.prompt || !suggestion.prompt.includes('## Objective')) {
          suggestion.prompt = generateSuggestionPrompt(
            suggestion,
            repoAnalyses[0],
            relevantCommits
          )
        }
        
        return suggestion
      })
      logger?.info(`✅ Enhanced ${globalAnalysis.suggestions.length} suggestions`)
    }

    logger?.info('🎉 Global analysis complete')
    return { globalAnalysis }
  },
})