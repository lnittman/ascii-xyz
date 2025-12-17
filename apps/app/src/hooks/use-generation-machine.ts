import { useReducer, useCallback } from 'react'
import { Id } from '@repo/backend/convex/_generated/dataModel'

/**
 * Generation State Machine
 *
 * Explicit states for the ASCII art generation flow.
 * Uses discriminated unions for type-safe state handling.
 *
 * State transitions:
 *   idle → initializing → planning → generating → completed
 *                      ↘          ↘            ↘
 *                        error ←────────────────┘
 *                          ↓
 *                        idle (on reset)
 */

// ThinkingTrace type matching the component's expectations
export interface ThinkingTrace {
  trace: string
  type: 'system' | 'planning' | 'frame'
  metadata?: unknown
  timestamp: number
}

// State types - discriminated union
export type GenerationState =
  | { status: 'idle' }
  | { status: 'initializing'; prompt: string }
  | { status: 'planning'; prompt: string; generationId: Id<'artworkGenerations'>; thinkingTraces?: ThinkingTrace[] }
  | {
      status: 'generating'
      prompt: string
      generationId: Id<'artworkGenerations'>
      currentFrame: number
      totalFrames: number
      frames: string[]
      plan?: { fps?: number }
      thinkingTraces?: ThinkingTrace[]
    }
  | {
      status: 'completed'
      prompt: string
      generationId: Id<'artworkGenerations'>
      frames: string[]
      artworkId?: string
      plan?: { fps?: number }
    }
  | { status: 'error'; prompt: string; error: string; generationId?: Id<'artworkGenerations'> }

// Action types
export type GenerationAction =
  | { type: 'START'; prompt: string }
  | { type: 'GENERATION_CREATED'; generationId: Id<'artworkGenerations'> }
  | { type: 'PLAN_READY'; plan: { fps?: number }; totalFrames: number; thinkingTraces?: ThinkingTrace[] }
  | { type: 'FRAME_RECEIVED'; frame: string; currentFrame: number; frames: string[] }
  | { type: 'COMPLETE'; artworkId?: string }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' }

// Initial state
const initialState: GenerationState = { status: 'idle' }

// Reducer with explicit transitions
function generationReducer(state: GenerationState, action: GenerationAction): GenerationState {
  switch (action.type) {
    case 'START':
      // Can only start from idle or error
      if (state.status !== 'idle' && state.status !== 'error' && state.status !== 'completed') {
        console.warn(`Cannot START from status: ${state.status}`)
        return state
      }
      return { status: 'initializing', prompt: action.prompt }

    case 'GENERATION_CREATED':
      // Must be initializing to receive generation ID
      if (state.status !== 'initializing') {
        console.warn(`Cannot GENERATION_CREATED from status: ${state.status}`)
        return state
      }
      return {
        status: 'planning',
        prompt: state.prompt,
        generationId: action.generationId,
      }

    case 'PLAN_READY':
      // Must be planning to receive plan
      if (state.status !== 'planning') {
        console.warn(`Cannot PLAN_READY from status: ${state.status}`)
        return state
      }
      return {
        status: 'generating',
        prompt: state.prompt,
        generationId: state.generationId,
        currentFrame: 0,
        totalFrames: action.totalFrames,
        frames: [],
        plan: action.plan,
        thinkingTraces: action.thinkingTraces,
      }

    case 'FRAME_RECEIVED':
      // Must be generating to receive frames
      if (state.status !== 'generating') {
        console.warn(`Cannot FRAME_RECEIVED from status: ${state.status}`)
        return state
      }
      return {
        ...state,
        currentFrame: action.currentFrame,
        frames: action.frames,
      }

    case 'COMPLETE':
      // Must be generating to complete
      if (state.status !== 'generating') {
        console.warn(`Cannot COMPLETE from status: ${state.status}`)
        return state
      }
      return {
        status: 'completed',
        prompt: state.prompt,
        generationId: state.generationId,
        frames: state.frames,
        artworkId: action.artworkId,
        plan: state.plan,
      }

    case 'ERROR':
      // Can error from any active state
      if (state.status === 'idle' || state.status === 'completed') {
        console.warn(`Cannot ERROR from status: ${state.status}`)
        return state
      }
      return {
        status: 'error',
        prompt: 'prompt' in state ? state.prompt : '',
        error: action.error,
        generationId: 'generationId' in state ? state.generationId : undefined,
      }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

// Hook return type
export interface UseGenerationMachine {
  state: GenerationState
  // Actions
  start: (prompt: string) => void
  setGenerationId: (id: Id<'artworkGenerations'>) => void
  setPlanReady: (plan: { fps?: number }, totalFrames: number, thinkingTraces?: ThinkingTrace[]) => void
  updateFrames: (frame: string, currentFrame: number, frames: string[]) => void
  complete: (artworkId?: string) => void
  setError: (error: string) => void
  reset: () => void
  // Computed helpers
  isActive: boolean
  canStart: boolean
  progress: number | null
}

/**
 * useGenerationMachine
 *
 * State machine hook for ASCII art generation flow.
 * Provides type-safe state transitions and computed helpers.
 */
export function useGenerationMachine(): UseGenerationMachine {
  const [state, dispatch] = useReducer(generationReducer, initialState)

  const start = useCallback((prompt: string) => {
    dispatch({ type: 'START', prompt })
  }, [])

  const setGenerationId = useCallback((generationId: Id<'artworkGenerations'>) => {
    dispatch({ type: 'GENERATION_CREATED', generationId })
  }, [])

  const setPlanReady = useCallback(
    (plan: { fps?: number }, totalFrames: number, thinkingTraces?: ThinkingTrace[]) => {
      dispatch({ type: 'PLAN_READY', plan, totalFrames, thinkingTraces })
    },
    []
  )

  const updateFrames = useCallback((frame: string, currentFrame: number, frames: string[]) => {
    dispatch({ type: 'FRAME_RECEIVED', frame, currentFrame, frames })
  }, [])

  const complete = useCallback((artworkId?: string) => {
    dispatch({ type: 'COMPLETE', artworkId })
  }, [])

  const setError = useCallback((error: string) => {
    dispatch({ type: 'ERROR', error })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  // Computed helpers
  const isActive =
    state.status === 'initializing' || state.status === 'planning' || state.status === 'generating'

  const canStart = state.status === 'idle' || state.status === 'error' || state.status === 'completed'

  const progress =
    state.status === 'generating' && state.totalFrames > 0
      ? (state.currentFrame / state.totalFrames) * 100
      : null

  return {
    state,
    start,
    setGenerationId,
    setPlanReady,
    updateFrames,
    complete,
    setError,
    reset,
    isActive,
    canStart,
    progress,
  }
}
