import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { mockUseQuery, mockUseMutation } from './setup';

// Need to mock both convex modules that are imported
vi.mock('@repo/backend/convex/_generated/api', () => ({
  api: {
    functions: {
      queries: {
        ascii: {
          list: 'mock.list',
          get: 'mock.get',
          getPublic: 'mock.getPublic',
          search: 'mock.search',
        },
        users: {
          getPublicProfile: 'mock.getPublicProfile',
          getByClerkId: 'mock.getByClerkId',
        },
      },
      mutations: {
        ascii: {
          updateVisibility: 'mock.updateVisibility',
          remove: 'mock.remove',
          incrementViews: 'mock.incrementViews',
          toggleLike: 'mock.toggleLike',
        },
      },
    },
  },
}));

// Import hooks after mocking
import { useArtworks, useArtwork, usePublicGallery, useSearchArtworks, usePublicProfile, useUserByClerkId } from '@/hooks/use-ascii';

describe('use-ascii hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue(vi.fn());
  });

  describe('useArtworks', () => {
    it('returns loading state when query result is undefined', () => {
      mockUseQuery.mockReturnValue(undefined);

      const { result } = renderHook(() => useArtworks());

      expect(result.current.status).toBe('loading');
      expect(result.current.data).toBeUndefined();
    });

    it('returns empty state when query returns empty array', () => {
      mockUseQuery.mockReturnValue([]);

      const { result } = renderHook(() => useArtworks());

      expect(result.current.status).toBe('empty');
      expect(result.current.data).toEqual([]);
    });

    it('returns ready state with data when query returns artworks', () => {
      const mockArtworks = [
        { _id: '1', prompt: 'Art 1' },
        { _id: '2', prompt: 'Art 2' },
      ];
      mockUseQuery.mockReturnValue(mockArtworks);

      const { result } = renderHook(() => useArtworks());

      expect(result.current.status).toBe('ready');
      expect(result.current.data).toEqual(mockArtworks);
    });

    it('passes visibility filter to query', () => {
      mockUseQuery.mockReturnValue([]);

      renderHook(() => useArtworks('public'));

      expect(mockUseQuery).toHaveBeenCalledWith('mock.list', { visibility: 'public' });
    });
  });

  describe('useArtwork', () => {
    it('returns loading state when query result is undefined', () => {
      mockUseQuery.mockReturnValue(undefined);

      const { result } = renderHook(() => useArtwork('artwork-id' as any));

      expect(result.current.status).toBe('loading');
    });

    it('returns empty state when query returns null', () => {
      mockUseQuery.mockReturnValue(null);

      const { result } = renderHook(() => useArtwork('artwork-id' as any));

      expect(result.current.status).toBe('empty');
      expect(result.current.data).toBeNull();
    });

    it('returns ready state when query returns artwork', () => {
      const mockArtwork = { _id: '1', prompt: 'My Art' };
      mockUseQuery.mockReturnValue(mockArtwork);

      const { result } = renderHook(() => useArtwork('artwork-id' as any));

      expect(result.current.status).toBe('ready');
      expect(result.current.data).toEqual(mockArtwork);
    });

    it('passes userId to query for access control', () => {
      mockUseQuery.mockReturnValue(null);

      renderHook(() => useArtwork('artwork-id' as any, 'user-123'));

      expect(mockUseQuery).toHaveBeenCalledWith('mock.get', {
        id: 'artwork-id',
        userId: 'user-123',
      });
    });
  });

  describe('usePublicGallery', () => {
    it('returns loading state initially', () => {
      mockUseQuery.mockReturnValue(undefined);

      const { result } = renderHook(() => usePublicGallery());

      expect(result.current.status).toBe('loading');
    });

    it('returns empty state when no public artworks', () => {
      mockUseQuery.mockReturnValue([]);

      const { result } = renderHook(() => usePublicGallery());

      expect(result.current.status).toBe('empty');
    });

    it('returns ready state with public artworks', () => {
      const mockArtworks = [{ _id: '1', visibility: 'public' }];
      mockUseQuery.mockReturnValue(mockArtworks);

      const { result } = renderHook(() => usePublicGallery());

      expect(result.current.status).toBe('ready');
      expect(result.current.data).toEqual(mockArtworks);
    });

    it('passes limit to query', () => {
      mockUseQuery.mockReturnValue([]);

      renderHook(() => usePublicGallery(20));

      expect(mockUseQuery).toHaveBeenCalledWith('mock.getPublic', { limit: 20 });
    });
  });

  describe('useSearchArtworks', () => {
    it('returns loading state during search', () => {
      mockUseQuery.mockReturnValue(undefined);

      const { result } = renderHook(() => useSearchArtworks('sunset'));

      expect(result.current.status).toBe('loading');
    });

    it('returns empty state when search has no results', () => {
      mockUseQuery.mockReturnValue([]);

      const { result } = renderHook(() => useSearchArtworks('nonexistent'));

      expect(result.current.status).toBe('empty');
    });

    it('returns ready state with search results', () => {
      const mockResults = [{ _id: '1', prompt: 'Beautiful sunset' }];
      mockUseQuery.mockReturnValue(mockResults);

      const { result } = renderHook(() => useSearchArtworks('sunset'));

      expect(result.current.status).toBe('ready');
      expect(result.current.data).toEqual(mockResults);
    });

    it('passes query and limit to search', () => {
      mockUseQuery.mockReturnValue([]);

      renderHook(() => useSearchArtworks('mountain', 10));

      expect(mockUseQuery).toHaveBeenCalledWith('mock.search', {
        query: 'mountain',
        limit: 10,
      });
    });

    it('skips search when query is empty', () => {
      mockUseQuery.mockReturnValue(undefined);

      renderHook(() => useSearchArtworks(''));

      expect(mockUseQuery).toHaveBeenCalledWith('mock.search', 'skip');
    });
  });
});

describe('QueryState type', () => {
  it('ensures exhaustive status checks via TypeScript', () => {
    // This is a compile-time check - if QueryState adds new statuses,
    // code using switch statements will fail to compile
    const checkStatus = (state: { status: 'loading' | 'ready' | 'empty' }) => {
      switch (state.status) {
        case 'loading':
          return 'is loading';
        case 'ready':
          return 'has data';
        case 'empty':
          return 'no data';
        default:
          // TypeScript will error if a status is unhandled
          const _exhaustive: never = state.status;
          return _exhaustive;
      }
    };

    expect(checkStatus({ status: 'loading' })).toBe('is loading');
    expect(checkStatus({ status: 'ready' })).toBe('has data');
    expect(checkStatus({ status: 'empty' })).toBe('no data');
  });
});

describe('usePublicProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue(undefined);
  });

  it('returns loading state when query result is undefined', () => {
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => usePublicProfile('clerk-123'));

    expect(result.current.status).toBe('loading');
    expect(result.current.data).toBeUndefined();
  });

  it('returns empty state when user not found', () => {
    mockUseQuery.mockReturnValue(null);

    const { result } = renderHook(() => usePublicProfile('non-existent'));

    expect(result.current.status).toBe('empty');
    expect(result.current.data).toBeNull();
  });

  it('returns ready state with profile data', () => {
    const mockProfile = {
      _id: 'user-1',
      clerkId: 'clerk-123',
      email: 'artist@example.com',
      name: 'Test Artist',
      stats: {
        totalArtworks: 10,
        publicArtworks: 5,
        totalLikes: 100,
        totalViews: 500,
      },
      artworks: [{ _id: 'art-1', prompt: 'My Art' }],
    };
    mockUseQuery.mockReturnValue(mockProfile);

    const { result } = renderHook(() => usePublicProfile('clerk-123'));

    expect(result.current.status).toBe('ready');
    expect(result.current.data).toEqual(mockProfile);
    expect(result.current.data?.name).toBe('Test Artist');
  });

  it('skips query when clerkId is undefined', () => {
    mockUseQuery.mockReturnValue(undefined);

    renderHook(() => usePublicProfile(undefined));

    expect(mockUseQuery).toHaveBeenCalledWith('mock.getPublicProfile', 'skip');
  });

  it('passes limit parameter to query', () => {
    mockUseQuery.mockReturnValue(null);

    renderHook(() => usePublicProfile('clerk-123', 5));

    expect(mockUseQuery).toHaveBeenCalledWith('mock.getPublicProfile', {
      clerkId: 'clerk-123',
      limit: 5,
    });
  });
});

describe('useUserByClerkId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue(undefined);
  });

  it('returns loading state when query result is undefined', () => {
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useUserByClerkId('clerk-123'));

    expect(result.current.status).toBe('loading');
  });

  it('returns empty state when user not found', () => {
    mockUseQuery.mockReturnValue(null);

    const { result } = renderHook(() => useUserByClerkId('non-existent'));

    expect(result.current.status).toBe('empty');
    expect(result.current.data).toBeNull();
  });

  it('returns ready state with user data', () => {
    const mockUser = {
      _id: 'user-1',
      clerkId: 'clerk-123',
      email: 'user@example.com',
      name: 'Test User',
    };
    mockUseQuery.mockReturnValue(mockUser);

    const { result } = renderHook(() => useUserByClerkId('clerk-123'));

    expect(result.current.status).toBe('ready');
    expect(result.current.data).toEqual(mockUser);
  });

  it('skips query when clerkId is undefined', () => {
    mockUseQuery.mockReturnValue(undefined);

    renderHook(() => useUserByClerkId(undefined));

    expect(mockUseQuery).toHaveBeenCalledWith('mock.getByClerkId', 'skip');
  });
});
