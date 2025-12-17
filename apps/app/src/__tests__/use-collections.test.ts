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
        collections: {
          list: 'collections.list',
          get: 'collections.get',
        },
      },
    },
  },
}))

import { useQuery } from 'convex/react'
import {
  useCollections,
  useCollection,
} from '../hooks/use-collections'
import { Id } from '@repo/backend/convex/_generated/dataModel'

const mockUseQuery = vi.mocked(useQuery)

describe('useCollections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('returns loading status when query is undefined', () => {
      mockUseQuery.mockReturnValue(undefined)

      const { result } = renderHook(() => useCollections())

      expect(result.current.status).toBe('loading')
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('ready state', () => {
    it('returns ready status with data when collections exist', () => {
      const mockCollections = [
        { _id: 'col1' as Id<'collections'>, name: 'Favorites', artworkIds: [] },
        { _id: 'col2' as Id<'collections'>, name: 'Work', artworkIds: [] },
      ]
      mockUseQuery.mockReturnValue(mockCollections)

      const { result } = renderHook(() => useCollections())

      expect(result.current.status).toBe('ready')
      expect(result.current.data).toEqual(mockCollections)
    })
  })

  describe('empty state', () => {
    it('returns empty status when collections array is empty', () => {
      mockUseQuery.mockReturnValue([])

      const { result } = renderHook(() => useCollections())

      expect(result.current.status).toBe('empty')
      expect(result.current.data).toEqual([])
    })
  })
})

describe('useCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('returns loading status when query is undefined', () => {
      mockUseQuery.mockReturnValue(undefined)

      const { result } = renderHook(() =>
        useCollection('test-id' as Id<'collections'>)
      )

      expect(result.current.status).toBe('loading')
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('ready state', () => {
    it('returns ready status with data when collection exists', () => {
      const mockCollection = {
        _id: 'col1' as Id<'collections'>,
        name: 'My Collection',
        artworkIds: ['art1', 'art2'],
        artworks: [{ _id: 'art1' }, { _id: 'art2' }],
      }
      mockUseQuery.mockReturnValue(mockCollection)

      const { result } = renderHook(() =>
        useCollection('col1' as Id<'collections'>)
      )

      expect(result.current.status).toBe('ready')
      expect(result.current.data).toEqual(mockCollection)
    })
  })

  describe('empty state', () => {
    it('returns empty status when collection is null (not found)', () => {
      mockUseQuery.mockReturnValue(null)

      const { result } = renderHook(() =>
        useCollection('nonexistent' as Id<'collections'>)
      )

      expect(result.current.status).toBe('empty')
      expect(result.current.data).toBeNull()
    })
  })
})
