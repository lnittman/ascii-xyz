import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock convex/react before importing hooks
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}))

// Mock the api
vi.mock('@repo/backend/convex/_generated/api', () => ({
  api: {
    functions: {
      queries: {
        generations: {
          getGeneration: 'generations.getGeneration',
          getUserGenerations: 'generations.getUserGenerations',
          getActiveGenerations: 'generations.getActiveGenerations',
        },
      },
    },
  },
}))

import { useQuery } from 'convex/react'
import { useGeneration, useUserGenerations, useActiveGenerations } from '../hooks/use-generation'
import { Id } from '@repo/backend/convex/_generated/dataModel'

const mockUseQuery = vi.mocked(useQuery)
const mockGenerationId = 'gen123' as Id<'artworkGenerations'>

describe('useGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('returns undefined when query is loading', () => {
      mockUseQuery.mockReturnValue(undefined)

      const { result } = renderHook(() => useGeneration(mockGenerationId))

      expect(result.current).toBeUndefined()
    })
  })

  describe('ready state', () => {
    it('returns generation data with progress fields', () => {
      const mockGeneration = {
        _id: mockGenerationId,
        status: 'generating',
        currentFrame: 5,
        totalFrames: 10,
        frames: ['f1', 'f2', 'f3', 'f4', 'f5'],
        prompt: 'A cat',
        modelId: 'gpt-4',
      }
      mockUseQuery.mockReturnValue(mockGeneration)

      const { result } = renderHook(() => useGeneration(mockGenerationId))

      expect(result.current).toEqual(mockGeneration)
      expect(result.current?.currentFrame).toBe(5)
      expect(result.current?.totalFrames).toBe(10)
    })

    it('returns completed generation', () => {
      const mockGeneration = {
        _id: mockGenerationId,
        status: 'completed',
        currentFrame: 10,
        totalFrames: 10,
        frames: Array(10).fill('frame'),
        prompt: 'A cat',
        modelId: 'gpt-4',
        completedAt: '2024-01-01T00:00:00Z',
      }
      mockUseQuery.mockReturnValue(mockGeneration)

      const { result } = renderHook(() => useGeneration(mockGenerationId))

      expect(result.current?.status).toBe('completed')
      expect(result.current?.currentFrame).toBe(10)
    })
  })

  describe('empty state', () => {
    it('returns null when generation not found', () => {
      mockUseQuery.mockReturnValue(null)

      const { result } = renderHook(() => useGeneration(mockGenerationId))

      expect(result.current).toBeNull()
    })
  })

  describe('skipped query', () => {
    it('skips query when generationId is null', () => {
      mockUseQuery.mockReturnValue(undefined)

      renderHook(() => useGeneration(null))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'generations.getGeneration',
        'skip'
      )
    })
  })
})

describe('useUserGenerations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user generations', () => {
    const mockGenerations = [
      { _id: 'gen1' as Id<'artworkGenerations'>, status: 'completed' },
      { _id: 'gen2' as Id<'artworkGenerations'>, status: 'generating' },
    ]
    mockUseQuery.mockReturnValue(mockGenerations)

    const { result } = renderHook(() => useUserGenerations('user123', 10))

    expect(result.current).toEqual(mockGenerations)
  })

  it('skips query when userId is undefined', () => {
    mockUseQuery.mockReturnValue(undefined)

    renderHook(() => useUserGenerations(undefined))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'generations.getUserGenerations',
      'skip'
    )
  })
})

describe('useActiveGenerations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns active generations', () => {
    const mockGenerations = [
      { _id: 'gen1' as Id<'artworkGenerations'>, status: 'planning' },
      { _id: 'gen2' as Id<'artworkGenerations'>, status: 'generating' },
    ]
    mockUseQuery.mockReturnValue(mockGenerations)

    const { result } = renderHook(() => useActiveGenerations())

    expect(result.current).toEqual(mockGenerations)
  })
})
