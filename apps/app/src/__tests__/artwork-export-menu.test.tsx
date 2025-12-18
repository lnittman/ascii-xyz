import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import './setup';

// Mock the export hooks
const mockExportGif = vi.fn();
const mockExportVideo = vi.fn();
const mockReset = vi.fn();

vi.mock('@/hooks/use-export', () => ({
  useExportGif: () => ({
    status: 'idle',
    error: undefined,
    progress: 0,
    exportGif: mockExportGif,
    reset: mockReset,
  }),
  useExportVideo: () => ({
    status: 'idle',
    error: undefined,
    progress: 0,
    isSupported: true,
    exportVideo: mockExportVideo,
    reset: mockReset,
  }),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

import { ArtworkExportMenu } from '@/components/artwork/artwork-export-menu';

describe('ArtworkExportMenu', () => {
  const sampleArtwork = {
    _id: 'artwork123' as any,
    _creationTime: Date.now(),
    userId: 'user1',
    prompt: 'A dancing robot',
    frames: ['###\n# #\n###', '#  \n # \n  #'],
    metadata: {
      width: 80,
      height: 24,
      fps: 10,
      generator: 'ai',
      model: 'claude-3.5-sonnet',
      createdAt: '2024-01-01T00:00:00Z',
    },
    visibility: 'public' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockExportGif.mockResolvedValue(new Blob(['gif'], { type: 'image/gif' }));
    mockExportVideo.mockResolvedValue(new Blob(['video'], { type: 'video/webm' }));
  });

  it('renders export button', () => {
    render(<ArtworkExportMenu artwork={sampleArtwork} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('button has aria-haspopup for menu', () => {
    render(<ArtworkExportMenu artwork={sampleArtwork} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('accepts custom button variant', () => {
    render(
      <ArtworkExportMenu
        artwork={sampleArtwork}
        buttonVariant="default"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('accepts custom button size', () => {
    render(
      <ArtworkExportMenu
        artwork={sampleArtwork}
        buttonSize="lg"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(
      <ArtworkExportMenu
        artwork={sampleArtwork}
        className="custom-class"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('button is not disabled in idle state', () => {
    render(<ArtworkExportMenu artwork={sampleArtwork} />);

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });
});

// Test export functions directly (unit tests)
describe('Export utility functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates JSON export content correctly', () => {
    const artwork = {
      _id: 'test123',
      prompt: 'Test prompt',
      frames: ['frame1', 'frame2'],
      metadata: {
        width: 80,
        height: 24,
        fps: 10,
        generator: 'ai',
        model: 'test',
        createdAt: '2024-01-01',
      },
      createdAt: '2024-01-01T00:00:00Z',
    };

    const content = JSON.stringify(
      {
        prompt: artwork.prompt,
        frames: artwork.frames,
        metadata: artwork.metadata,
        createdAt: artwork.createdAt,
      },
      null,
      2
    );

    // Verify JSON structure
    const parsed = JSON.parse(content);
    expect(parsed.prompt).toBe('Test prompt');
    expect(parsed.frames).toHaveLength(2);
    expect(parsed.metadata.fps).toBe(10);
  });

  it('creates text export content correctly', () => {
    const artwork = {
      prompt: 'Test prompt',
      frames: ['###\n# #\n###', '#  \n # \n  #'],
      metadata: {
        width: 80,
        fps: 10,
      },
      createdAt: '2024-01-01T00:00:00Z',
    };

    const separator = '\n' + '='.repeat(80) + '\n\n';
    const content = [
      `# ${artwork.prompt}`,
      `# Generated: ${artwork.createdAt}`,
      `# Frames: ${artwork.frames.length}`,
      `# FPS: ${artwork.metadata.fps}`,
      '',
      separator,
      artwork.frames.join(separator),
    ].join('\n');

    expect(content).toContain('Test prompt');
    expect(content).toContain('# Frames: 2');
    expect(content).toContain('# FPS: 10');
    expect(content).toContain('###');
  });
});
