import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock the export library
vi.mock('@/lib/export/gif', () => ({
  createGifFromFrames: vi.fn(),
  downloadGif: vi.fn(),
}));

import { useExportGif } from '@/hooks/use-export';
import { createGifFromFrames, downloadGif } from '@/lib/export/gif';

const mockCreateGif = createGifFromFrames as ReturnType<typeof vi.fn>;
const mockDownloadGif = downloadGif as ReturnType<typeof vi.fn>;

describe('useExportGif', () => {
  const sampleArtwork = {
    _id: 'artwork123' as any,
    prompt: 'A dancing robot',
    frames: ['###\n# #\n###', '#  \n # \n  #', '###\n# #\n###'],
    metadata: {
      width: 80,
      height: 24,
      fps: 10,
      generator: 'ai',
      model: 'claude-3.5-sonnet',
      createdAt: '2024-01-01T00:00:00Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateGif.mockResolvedValue(new Blob(['gif'], { type: 'image/gif' }));
  });

  it('returns initial state with idle status', () => {
    const { result } = renderHook(() => useExportGif());

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeUndefined();
    expect(result.current.progress).toBe(0);
  });

  it('exports GIF successfully', async () => {
    const { result } = renderHook(() => useExportGif());

    await act(async () => {
      await result.current.exportGif(sampleArtwork);
    });

    expect(mockCreateGif).toHaveBeenCalledWith(
      expect.objectContaining({
        frames: sampleArtwork.frames,
        fps: sampleArtwork.metadata.fps,
      })
    );
    expect(mockDownloadGif).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringContaining('artwork123')
    );
    expect(result.current.status).toBe('success');
  });

  it('handles export error', async () => {
    mockCreateGif.mockRejectedValue(new Error('Export failed'));

    const { result } = renderHook(() => useExportGif());

    await act(async () => {
      await result.current.exportGif(sampleArtwork);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Export failed');
  });

  it('uses custom filename when provided', async () => {
    const { result } = renderHook(() => useExportGif());

    await act(async () => {
      await result.current.exportGif(sampleArtwork, { filename: 'custom.gif' });
    });

    expect(mockDownloadGif).toHaveBeenCalledWith(expect.any(Blob), 'custom.gif');
  });

  it('allows custom styling options', async () => {
    const { result } = renderHook(() => useExportGif());

    await act(async () => {
      await result.current.exportGif(sampleArtwork, {
        backgroundColor: '#1a1a1a',
        textColor: '#ff0000',
        fontSize: 16,
      });
    });

    expect(mockCreateGif).toHaveBeenCalledWith(
      expect.objectContaining({
        backgroundColor: '#1a1a1a',
        textColor: '#ff0000',
        fontSize: 16,
      })
    );
  });

  it('shows loading state during export', async () => {
    let resolveExport: (value: Blob) => void;
    mockCreateGif.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveExport = resolve;
        })
    );

    const { result } = renderHook(() => useExportGif());

    // Start export without awaiting
    act(() => {
      result.current.exportGif(sampleArtwork);
    });

    expect(result.current.status).toBe('loading');

    // Resolve the export
    await act(async () => {
      resolveExport!(new Blob(['gif'], { type: 'image/gif' }));
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
  });

  it('resets state with reset function', async () => {
    mockCreateGif.mockRejectedValue(new Error('Export failed'));

    const { result } = renderHook(() => useExportGif());

    await act(async () => {
      await result.current.exportGif(sampleArtwork);
    });

    expect(result.current.status).toBe('error');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeUndefined();
  });

  it('returns blob for direct use', async () => {
    const testBlob = new Blob(['test'], { type: 'image/gif' });
    mockCreateGif.mockResolvedValue(testBlob);

    const { result } = renderHook(() => useExportGif());

    let returnedBlob: Blob | undefined;
    await act(async () => {
      returnedBlob = await result.current.exportGif(sampleArtwork, {
        download: false,
      });
    });

    expect(returnedBlob).toBe(testBlob);
    expect(mockDownloadGif).not.toHaveBeenCalled();
  });
});
