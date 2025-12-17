import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock convex/react before importing hooks
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
}))

// Mock the api
vi.mock('@repo/backend/convex/_generated/api', () => ({
  api: {
    functions: {
      queries: {
        shares: {
          list: 'shares.list',
          getByCode: 'shares.getByCode',
          create: 'shares.create',
          revoke: 'shares.revoke',
        },
      },
    },
  },
}))

import { useQuery } from 'convex/react'
import { useShares, useSharedArtwork } from '../hooks/use-shares'
import { Id } from '@repo/backend/convex/_generated/dataModel'

const mockUseQuery = vi.mocked(useQuery)

describe('useShares', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('returns loading status when query is undefined', () => {
      mockUseQuery.mockReturnValue(undefined)

      const { result } = renderHook(() => useShares())

      expect(result.current.status).toBe('loading')
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('ready state', () => {
    it('returns ready status with data when shares exist', () => {
      const mockShares = [
        {
          _id: 'share1' as Id<'shares'>,
          shareCode: 'abc123',
          viewCount: 5,
          artworkId: 'art1' as Id<'artworks'>,
        },
        {
          _id: 'share2' as Id<'shares'>,
          shareCode: 'def456',
          viewCount: 10,
          artworkId: 'art2' as Id<'artworks'>,
        },
      ]
      mockUseQuery.mockReturnValue(mockShares)

      const { result } = renderHook(() => useShares())

      expect(result.current.status).toBe('ready')
      expect(result.current.data).toEqual(mockShares)
    })
  })

  describe('empty state', () => {
    it('returns empty status when shares array is empty', () => {
      mockUseQuery.mockReturnValue([])

      const { result } = renderHook(() => useShares())

      expect(result.current.status).toBe('empty')
      expect(result.current.data).toEqual([])
    })
  })
})

describe('useSharedArtwork', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('returns loading status when query is undefined', () => {
      mockUseQuery.mockReturnValue(undefined)

      const { result } = renderHook(() => useSharedArtwork('abc123'))

      expect(result.current.status).toBe('loading')
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('ready state', () => {
    it('returns ready status when artwork is found', () => {
      const mockArtwork = {
        _id: 'art1' as Id<'artworks'>,
        prompt: 'A cat',
        frames: ['frame1'],
      }
      mockUseQuery.mockReturnValue(mockArtwork)

      const { result } = renderHook(() => useSharedArtwork('abc123'))

      expect(result.current.status).toBe('ready')
      expect(result.current.data).toEqual(mockArtwork)
    })
  })

  describe('empty state', () => {
    it('returns empty status when share code not found (null)', () => {
      mockUseQuery.mockReturnValue(null)

      const { result } = renderHook(() => useSharedArtwork('invalid'))

      expect(result.current.status).toBe('empty')
      expect(result.current.data).toBeNull()
    })
  })

  describe('skipped query', () => {
    it('returns loading status when share code is empty', () => {
      mockUseQuery.mockReturnValue(undefined)

      const { result } = renderHook(() => useSharedArtwork(''))

      expect(result.current.status).toBe('loading')
    })
  })
})
