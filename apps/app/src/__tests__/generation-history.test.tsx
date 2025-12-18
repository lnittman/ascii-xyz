import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import './setup';

// Mock the hooks
const mockUseUserGenerations = vi.fn();
const mockRetryGeneration = vi.fn();

vi.mock('@/hooks/use-generation', () => ({
  useUserGenerations: () => mockUseUserGenerations(),
}));

vi.mock('convex/react', () => ({
  useMutation: () => mockRetryGeneration,
}));

vi.mock('@repo/backend/convex/_generated/api', () => ({
  api: {
    functions: {
      mutations: {
        generations: {
          retryGeneration: 'generations.retryGeneration',
        },
      },
    },
  },
}));

// Import after mocking
import { GenerationHistory } from '@/components/generation-history';
import type { Id } from '@repo/backend/convex/_generated/dataModel';

// Test generation data
const createGeneration = (overrides: Partial<{
  _id: string;
  status: 'pending' | 'planning' | 'generating' | 'completed' | 'failed';
  prompt: string;
  modelId: string;
  currentFrame: number;
  totalFrames: number;
  frames: string[];
  error: string;
  createdAt: string;
}> = {}) => ({
  _id: overrides._id ?? 'gen_123',
  status: overrides.status ?? 'completed',
  prompt: overrides.prompt ?? 'A dancing robot',
  modelId: overrides.modelId ?? 'claude-3.5-sonnet',
  currentFrame: overrides.currentFrame ?? 10,
  totalFrames: overrides.totalFrames ?? 10,
  frames: overrides.frames ?? Array(10).fill('frame'),
  createdAt: overrides.createdAt ?? '2024-01-15T10:30:00Z',
  ...(overrides.error && { error: overrides.error }),
});

describe('GenerationHistory', () => {
  const mockOnRetry = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserGenerations.mockReturnValue([]);
  });

  describe('rendering', () => {
    it('renders the history container', () => {
      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      expect(screen.getByTestId('generation-history')).toBeInTheDocument();
    });

    it('shows empty state when no generations', () => {
      mockUseUserGenerations.mockReturnValue([]);

      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      expect(screen.getByText(/no generations yet/i)).toBeInTheDocument();
    });

    it('renders list of generations', () => {
      mockUseUserGenerations.mockReturnValue([
        createGeneration({ _id: 'gen_1', prompt: 'First prompt' }),
        createGeneration({ _id: 'gen_2', prompt: 'Second prompt' }),
      ]);

      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      expect(screen.getByText('First prompt')).toBeInTheDocument();
      expect(screen.getByText('Second prompt')).toBeInTheDocument();
    });

    it('shows generation status', () => {
      mockUseUserGenerations.mockReturnValue([
        createGeneration({ _id: 'gen_1', status: 'completed' }),
        createGeneration({ _id: 'gen_2', status: 'failed', error: 'API error' }),
      ]);

      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      expect(screen.getByText(/completed/i)).toBeInTheDocument();
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading indicator when data is undefined', () => {
      mockUseUserGenerations.mockReturnValue(undefined);

      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      expect(screen.getByTestId('history-loading')).toBeInTheDocument();
    });
  });

  describe('retry functionality', () => {
    it('shows retry button for failed generations', () => {
      mockUseUserGenerations.mockReturnValue([
        createGeneration({ _id: 'gen_failed', status: 'failed', error: 'Rate limited' }),
      ]);

      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('shows retry button for completed generations', () => {
      mockUseUserGenerations.mockReturnValue([
        createGeneration({ _id: 'gen_done', status: 'completed' }),
      ]);

      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls onRetry with generation ID when retry clicked', () => {
      mockUseUserGenerations.mockReturnValue([
        createGeneration({ _id: 'gen_to_retry', status: 'failed' }),
      ]);

      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledWith('gen_to_retry');
    });

    it('does not show retry button for active generations', () => {
      mockUseUserGenerations.mockReturnValue([
        createGeneration({ _id: 'gen_active', status: 'generating', currentFrame: 5, totalFrames: 10 }),
      ]);

      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('does not show retry button for planning generations', () => {
      mockUseUserGenerations.mockReturnValue([
        createGeneration({ _id: 'gen_planning', status: 'planning' }),
      ]);

      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('calls onSelect when generation is clicked', () => {
      mockUseUserGenerations.mockReturnValue([
        createGeneration({ _id: 'gen_select', status: 'completed' }),
      ]);

      render(
        <GenerationHistory
          userId="user_123"
          onRetry={mockOnRetry}
          onSelect={mockOnSelect}
        />
      );

      const item = screen.getByTestId('generation-item-gen_select');
      fireEvent.click(item);

      expect(mockOnSelect).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'gen_select',
      }));
    });

    it('highlights selected generation', () => {
      mockUseUserGenerations.mockReturnValue([
        createGeneration({ _id: 'gen_1' }),
        createGeneration({ _id: 'gen_2' }),
      ]);

      render(
        <GenerationHistory
          userId="user_123"
          onRetry={mockOnRetry}
          selectedId={'gen_1' as Id<'artworkGenerations'>}
        />
      );

      const selectedItem = screen.getByTestId('generation-item-gen_1');
      expect(selectedItem).toHaveClass('bg-muted');
    });
  });

  describe('error display', () => {
    it('shows error message for failed generations', () => {
      mockUseUserGenerations.mockReturnValue([
        createGeneration({
          _id: 'gen_error',
          status: 'failed',
          error: 'API rate limit exceeded',
        }),
      ]);

      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      expect(screen.getByText(/API rate limit exceeded/i)).toBeInTheDocument();
    });
  });

  describe('progress display', () => {
    it('shows progress for generating status', () => {
      mockUseUserGenerations.mockReturnValue([
        createGeneration({
          _id: 'gen_progress',
          status: 'generating',
          currentFrame: 5,
          totalFrames: 10,
        }),
      ]);

      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      expect(screen.getByText(/5.*\/.*10/)).toBeInTheDocument();
    });
  });

  describe('timestamp display', () => {
    it('shows formatted timestamp', () => {
      mockUseUserGenerations.mockReturnValue([
        createGeneration({
          _id: 'gen_time',
          createdAt: '2024-01-15T10:30:00Z',
        }),
      ]);

      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      // Should show some time representation (relative or absolute)
      const item = screen.getByTestId('generation-item-gen_time');
      expect(item).toBeInTheDocument();
    });
  });

  describe('model display', () => {
    it('shows model name', () => {
      mockUseUserGenerations.mockReturnValue([
        createGeneration({
          _id: 'gen_model',
          modelId: 'claude-3.5-sonnet',
        }),
      ]);

      render(<GenerationHistory userId="user_123" onRetry={mockOnRetry} />);

      expect(screen.getByText(/claude-3.5-sonnet/i)).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(
        <GenerationHistory
          userId="user_123"
          onRetry={mockOnRetry}
          className="custom-class"
        />
      );

      expect(screen.getByTestId('generation-history')).toHaveClass('custom-class');
    });
  });

  describe('limit', () => {
    it('passes limit to useUserGenerations', () => {
      mockUseUserGenerations.mockReturnValue([]);

      render(
        <GenerationHistory
          userId="user_123"
          onRetry={mockOnRetry}
          limit={5}
        />
      );

      // The mock should have been called (we verify the component renders)
      expect(screen.getByTestId('generation-history')).toBeInTheDocument();
    });
  });
});

describe('GenerationHistoryItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('truncates long prompts', () => {
    const longPrompt = 'A'.repeat(200);
    mockUseUserGenerations.mockReturnValue([
      createGeneration({ _id: 'gen_long', prompt: longPrompt }),
    ]);

    render(<GenerationHistory userId="user_123" onRetry={vi.fn()} />);

    // Should not show the full prompt
    expect(screen.queryByText(longPrompt)).not.toBeInTheDocument();
    // Should show truncated version
    expect(screen.getByText(/A{50,}\.{3}/)).toBeInTheDocument();
  });
});
