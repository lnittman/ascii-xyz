import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGenerationMachine, type ThinkingTrace } from '../hooks/use-generation-machine'
import { Id } from '@repo/backend/convex/_generated/dataModel'

// Mock ID for tests
const mockGenerationId = 'test-generation-id' as Id<'artworkGenerations'>

// Helper to create mock thinking traces
const createMockTrace = (text: string): ThinkingTrace => ({
  trace: text,
  type: 'planning',
  timestamp: Date.now(),
})

describe('useGenerationMachine', () => {
  describe('initial state', () => {
    it('starts in idle state', () => {
      const { result } = renderHook(() => useGenerationMachine())
      expect(result.current.state.status).toBe('idle')
    })

    it('canStart is true when idle', () => {
      const { result } = renderHook(() => useGenerationMachine())
      expect(result.current.canStart).toBe(true)
    })

    it('isActive is false when idle', () => {
      const { result } = renderHook(() => useGenerationMachine())
      expect(result.current.isActive).toBe(false)
    })

    it('progress is null when idle', () => {
      const { result } = renderHook(() => useGenerationMachine())
      expect(result.current.progress).toBeNull()
    })
  })

  describe('state transitions', () => {
    it('transitions from idle to initializing on start', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => {
        result.current.start('A cat on a boat')
      })

      expect(result.current.state.status).toBe('initializing')
      if (result.current.state.status === 'initializing') {
        expect(result.current.state.prompt).toBe('A cat on a boat')
      }
    })

    it('transitions from initializing to planning on generation created', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => {
        result.current.start('A cat on a boat')
      })
      act(() => {
        result.current.setGenerationId(mockGenerationId)
      })

      expect(result.current.state.status).toBe('planning')
      if (result.current.state.status === 'planning') {
        expect(result.current.state.generationId).toBe(mockGenerationId)
        expect(result.current.state.prompt).toBe('A cat on a boat')
      }
    })

    it('transitions from planning to generating on plan ready', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('A cat on a boat'))
      act(() => result.current.setGenerationId(mockGenerationId))
      act(() => result.current.setPlanReady({ fps: 12 }, 10))

      expect(result.current.state.status).toBe('generating')
      if (result.current.state.status === 'generating') {
        expect(result.current.state.totalFrames).toBe(10)
        expect(result.current.state.currentFrame).toBe(0)
        expect(result.current.state.frames).toEqual([])
        expect(result.current.state.plan?.fps).toBe(12)
      }
    })

    it('updates frames during generation', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('A cat on a boat'))
      act(() => result.current.setGenerationId(mockGenerationId))
      act(() => result.current.setPlanReady({ fps: 12 }, 3))
      act(() => result.current.updateFrames('frame1', 1, ['frame1']))

      expect(result.current.state.status).toBe('generating')
      if (result.current.state.status === 'generating') {
        expect(result.current.state.currentFrame).toBe(1)
        expect(result.current.state.frames).toEqual(['frame1'])
      }
    })

    it('transitions from generating to completed', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('A cat on a boat'))
      act(() => result.current.setGenerationId(mockGenerationId))
      act(() => result.current.setPlanReady({ fps: 12 }, 2))
      act(() => result.current.updateFrames('f1', 1, ['f1']))
      act(() => result.current.updateFrames('f2', 2, ['f1', 'f2']))
      act(() => result.current.complete('artwork-123'))

      expect(result.current.state.status).toBe('completed')
      if (result.current.state.status === 'completed') {
        expect(result.current.state.frames).toEqual(['f1', 'f2'])
        expect(result.current.state.artworkId).toBe('artwork-123')
      }
    })

    it('transitions to error from active states', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('A cat on a boat'))
      act(() => result.current.setError('Generation failed'))

      expect(result.current.state.status).toBe('error')
      if (result.current.state.status === 'error') {
        expect(result.current.state.error).toBe('Generation failed')
        expect(result.current.state.prompt).toBe('A cat on a boat')
      }
    })

    it('resets to idle state', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('A cat on a boat'))
      act(() => result.current.setGenerationId(mockGenerationId))
      act(() => result.current.reset())

      expect(result.current.state.status).toBe('idle')
    })
  })

  describe('computed helpers', () => {
    it('isActive is true during initializing', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('test'))

      expect(result.current.isActive).toBe(true)
    })

    it('isActive is true during planning', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('test'))
      act(() => result.current.setGenerationId(mockGenerationId))

      expect(result.current.isActive).toBe(true)
    })

    it('isActive is true during generating', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('test'))
      act(() => result.current.setGenerationId(mockGenerationId))
      act(() => result.current.setPlanReady({}, 10))

      expect(result.current.isActive).toBe(true)
    })

    it('isActive is false after completion', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('test'))
      act(() => result.current.setGenerationId(mockGenerationId))
      act(() => result.current.setPlanReady({}, 2))
      act(() => result.current.updateFrames('f', 2, ['f', 'f']))
      act(() => result.current.complete())

      expect(result.current.isActive).toBe(false)
    })

    it('canStart is true after completion', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('test'))
      act(() => result.current.setGenerationId(mockGenerationId))
      act(() => result.current.setPlanReady({}, 1))
      act(() => result.current.updateFrames('f', 1, ['f']))
      act(() => result.current.complete())

      expect(result.current.canStart).toBe(true)
    })

    it('canStart is true after error', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('test'))
      act(() => result.current.setError('error'))

      expect(result.current.canStart).toBe(true)
    })

    it('calculates progress correctly', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('test'))
      act(() => result.current.setGenerationId(mockGenerationId))
      act(() => result.current.setPlanReady({}, 10))

      expect(result.current.progress).toBe(0)

      act(() => result.current.updateFrames('f', 5, ['f']))

      expect(result.current.progress).toBe(50)
    })

    it('calculates progress at 100% when complete', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('test'))
      act(() => result.current.setGenerationId(mockGenerationId))
      act(() => result.current.setPlanReady({}, 4))
      act(() => result.current.updateFrames('f4', 4, ['f1', 'f2', 'f3', 'f4']))

      expect(result.current.progress).toBe(100)
    })

    it('progress is null when totalFrames is 0', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('test'))
      act(() => result.current.setGenerationId(mockGenerationId))
      act(() => result.current.setPlanReady({}, 0))

      // Should be null to avoid divide by zero
      expect(result.current.progress).toBeNull()
    })

    it('progress is null after completion (not generating)', () => {
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('test'))
      act(() => result.current.setGenerationId(mockGenerationId))
      act(() => result.current.setPlanReady({}, 2))
      act(() => result.current.updateFrames('f2', 2, ['f1', 'f2']))
      act(() => result.current.complete())

      // After completion, progress should be null (not in generating state)
      expect(result.current.progress).toBeNull()
    })
  })

  describe('invalid transitions', () => {
    it('ignores start when already generating', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { result } = renderHook(() => useGenerationMachine())

      act(() => result.current.start('first'))
      act(() => result.current.setGenerationId(mockGenerationId))

      // Try to start again while generating
      act(() => result.current.start('second'))

      // Should still be in planning state
      expect(result.current.state.status).toBe('planning')
      if (result.current.state.status === 'planning') {
        expect(result.current.state.prompt).toBe('first')
      }

      consoleWarn.mockRestore()
    })

    it('ignores setGenerationId from wrong state', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { result } = renderHook(() => useGenerationMachine())

      // Try to set generation ID from idle
      act(() => result.current.setGenerationId(mockGenerationId))

      expect(result.current.state.status).toBe('idle')

      consoleWarn.mockRestore()
    })
  })
})
