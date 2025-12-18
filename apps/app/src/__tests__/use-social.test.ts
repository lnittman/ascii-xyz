import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { mockUseQuery, mockUseMutation } from './setup';
import './setup';

// Import after mocking
import {
  useFeatured,
  useTrending,
  useSetFeatured,
  useTopByLikes,
  useToggleLike,
  useHasLiked,
  useLikes,
  useIncrementView,
  useUserStats,
} from '@/hooks/use-social';

// Test artwork data factory
const createArtwork = (overrides: Partial<{
  _id: string;
  prompt: string;
  frames: string[];
  likes: number;
  views: number;
  createdAt: string;
  visibility: 'public' | 'private' | 'unlisted';
  featured: boolean;
}> = {}) => ({
  _id: overrides._id ?? 'art_123',
  prompt: overrides.prompt ?? 'Test artwork',
  frames: overrides.frames ?? ['frame1'],
  likes: overrides.likes ?? 0,
  views: overrides.views ?? 0,
  createdAt: overrides.createdAt ?? '2024-01-15T10:30:00Z',
  visibility: overrides.visibility ?? 'public',
  metadata: {
    width: 80,
    height: 24,
    fps: 1,
    generator: 'test',
    model: 'test-model',
    createdAt: overrides.createdAt ?? '2024-01-15T10:30:00Z',
  },
  ...(overrides.featured !== undefined && { featured: overrides.featured }),
});

describe('useFeatured', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state when data is undefined', () => {
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useFeatured());

    expect(result.current.status).toBe('loading');
    expect(result.current.data).toBeUndefined();
  });

  it('returns empty state when no featured artworks', () => {
    mockUseQuery.mockReturnValue([]);

    const { result } = renderHook(() => useFeatured());

    expect(result.current.status).toBe('empty');
    expect(result.current.data).toEqual([]);
  });

  it('returns ready state with featured artworks', () => {
    const featured = [
      createArtwork({ _id: 'art_1', prompt: 'Featured 1', featured: true }),
      createArtwork({ _id: 'art_2', prompt: 'Featured 2', featured: true }),
    ];
    mockUseQuery.mockReturnValue(featured);

    const { result } = renderHook(() => useFeatured());

    expect(result.current.status).toBe('ready');
    expect(result.current.data).toEqual(featured);
    expect(result.current.data?.length).toBe(2);
  });

  it('passes limit parameter to query', () => {
    mockUseQuery.mockReturnValue([]);

    renderHook(() => useFeatured(5));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      { limit: 5 }
    );
  });

  it('uses default limit of 10', () => {
    mockUseQuery.mockReturnValue([]);

    renderHook(() => useFeatured());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      { limit: 10 }
    );
  });
});

describe('useTrending', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state when data is undefined', () => {
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useTrending());

    expect(result.current.status).toBe('loading');
  });

  it('returns empty state when no trending artworks', () => {
    mockUseQuery.mockReturnValue([]);

    const { result } = renderHook(() => useTrending());

    expect(result.current.status).toBe('empty');
    expect(result.current.data).toEqual([]);
  });

  it('returns ready state with trending artworks', () => {
    const trending = [
      createArtwork({ _id: 'art_1', likes: 100, views: 500 }),
      createArtwork({ _id: 'art_2', likes: 50, views: 200 }),
    ];
    mockUseQuery.mockReturnValue(trending);

    const { result } = renderHook(() => useTrending());

    expect(result.current.status).toBe('ready');
    expect(result.current.data?.length).toBe(2);
  });

  it('passes limit parameter', () => {
    mockUseQuery.mockReturnValue([]);

    renderHook(() => useTrending(20));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      { limit: 20 }
    );
  });
});

describe('useSetFeatured', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mutation function', () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue(mockMutate);

    const { result } = renderHook(() => useSetFeatured());

    expect(result.current).toBe(mockMutate);
  });
});

describe('useTopByLikes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state when data is undefined', () => {
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useTopByLikes());

    expect(result.current.status).toBe('loading');
  });

  it('returns ready state with sorted artworks', () => {
    const topArtworks = [
      createArtwork({ _id: 'art_1', likes: 100 }),
      createArtwork({ _id: 'art_2', likes: 50 }),
    ];
    mockUseQuery.mockReturnValue(topArtworks);

    const { result } = renderHook(() => useTopByLikes());

    expect(result.current.status).toBe('ready');
    expect(result.current.data?.[0].likes).toBe(100);
  });
});

describe('useToggleLike', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mutation function', () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue(mockMutate);

    const { result } = renderHook(() => useToggleLike());

    expect(result.current).toBe(mockMutate);
  });
});

describe('useHasLiked', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue(undefined);
  });

  it('returns false when artworkId is undefined', () => {
    // When artworkId is undefined, the hook uses "skip" and should return false
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useHasLiked(undefined));

    expect(result.current).toBe(false);
  });

  it('returns true when user has liked', () => {
    mockUseQuery.mockReturnValue(true);

    const { result } = renderHook(() => useHasLiked('art_123' as any));

    expect(result.current).toBe(true);
  });

  it('returns false when user has not liked', () => {
    mockUseQuery.mockReturnValue(false);

    const { result } = renderHook(() => useHasLiked('art_123' as any));

    expect(result.current).toBe(false);
  });
});

describe('useLikes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue(undefined);
  });

  it('returns default values when artworkId is undefined', () => {
    // When artworkId is undefined, the hook uses "skip" and returns defaults
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useLikes(undefined));

    expect(result.current).toEqual({ count: 0, recentLikers: [] });
  });

  it('returns default values when query is loading', () => {
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useLikes('art_123' as any));

    expect(result.current).toEqual({ count: 0, recentLikers: [] });
  });

  it('returns likes data when available', () => {
    mockUseQuery.mockReturnValue({ count: 5, recentLikers: ['user1', 'user2'] });

    const { result } = renderHook(() => useLikes('art_123' as any));

    expect(result.current.count).toBe(5);
    expect(result.current.recentLikers).toHaveLength(2);
  });
});

describe('useIncrementView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mutation function', () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue(mockMutate);

    const { result } = renderHook(() => useIncrementView());

    expect(result.current).toBe(mockMutate);
  });
});

describe('useUserStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state when data is undefined', () => {
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useUserStats());

    expect(result.current.status).toBe('loading');
  });

  it('returns empty state when user not found', () => {
    mockUseQuery.mockReturnValue(null);

    const { result } = renderHook(() => useUserStats());

    expect(result.current.status).toBe('empty');
    expect(result.current.data).toBeNull();
  });

  it('returns ready state with user stats', () => {
    const stats = {
      userId: 'user_123',
      totalArtworks: 10,
      publicArtworks: 5,
      totalLikes: 100,
      totalViews: 500,
      collectionsCount: 2,
    };
    mockUseQuery.mockReturnValue(stats);

    const { result } = renderHook(() => useUserStats());

    expect(result.current.status).toBe('ready');
    expect(result.current.data).toEqual(stats);
  });

  it('passes userId parameter when provided', () => {
    mockUseQuery.mockReturnValue(null);

    renderHook(() => useUserStats('user_456'));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      { userId: 'user_456' }
    );
  });
});
