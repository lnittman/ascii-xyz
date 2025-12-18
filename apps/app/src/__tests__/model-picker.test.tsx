import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mockUseQuery, mockUseAtom } from './setup';

// Mock the use-ascii hooks
const mockUseModels = vi.fn();
const mockUseDefaultModel = vi.fn();

vi.mock('@/hooks/use-ascii', () => ({
  useModels: () => mockUseModels(),
  useDefaultModel: () => mockUseDefaultModel(),
}));

// Import after mocking
import { ModelPicker } from '@/components/model-picker';

// Test model data
const testModels = [
  {
    _id: 'model1' as any,
    modelId: 'openrouter/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Best for creative ASCII art',
    isDefault: true,
    isEnabled: true,
    sortOrder: 0,
  },
  {
    _id: 'model2' as any,
    modelId: 'openrouter/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Latest multimodal model',
    isDefault: false,
    isEnabled: true,
    sortOrder: 1,
  },
];

describe('ModelPicker', () => {
  const mockSetSelectedModelId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAtom.mockReturnValue(['openrouter/claude-3.5-sonnet', mockSetSelectedModelId]);
    // Default: models loaded
    mockUseModels.mockReturnValue({ status: 'ready', data: testModels });
    mockUseDefaultModel.mockReturnValue({ status: 'ready', data: testModels[0] });
  });

  describe('with no API key configured', () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue({
        openrouterApiKey: null,
        enabledModels: { openrouter: [] },
      });
    });

    it('renders default model when no API key', () => {
      render(<ModelPicker />);

      expect(screen.getByRole('button')).toHaveTextContent('Claude 3.5 Sonnet');
    });

    it('renders as a dropdown trigger button', () => {
      render(<ModelPicker />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'menu');
    });
  });

  describe('with API key and enabled models', () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue({
        openrouterApiKey: 'sk-or-v1-test',
        enabledModels: { openrouter: ['openrouter/claude-3.5-sonnet', 'openrouter/gpt-4o'] },
      });
    });

    it('renders selected model name', () => {
      render(<ModelPicker />);

      expect(screen.getByRole('button')).toHaveTextContent('Claude 3.5 Sonnet');
    });

    it('shows different selected model when jotai atom changes', () => {
      mockUseAtom.mockReturnValue(['openrouter/gpt-4o', mockSetSelectedModelId]);
      render(<ModelPicker />);

      expect(screen.getByRole('button')).toHaveTextContent('GPT-4o');
    });

    it('falls back to first available model if selected not found', () => {
      mockUseAtom.mockReturnValue(['nonexistent-model', mockSetSelectedModelId]);
      render(<ModelPicker />);

      // Should fall back to first available model
      expect(screen.getByRole('button')).toHaveTextContent('Claude 3.5 Sonnet');
    });
  });

  describe('loading state', () => {
    it('shows empty button while loading', () => {
      mockUseModels.mockReturnValue({ status: 'loading', data: undefined });
      mockUseDefaultModel.mockReturnValue({ status: 'loading', data: undefined });
      mockUseQuery.mockReturnValue({
        openrouterApiKey: 'sk-or-v1-test',
        enabledModels: { openrouter: ['openrouter/claude-3.5-sonnet'] },
      });

      render(<ModelPicker />);

      // Button should exist but may show "select model" placeholder
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue({
        openrouterApiKey: 'sk-or-v1-test',
        enabledModels: { openrouter: ['openrouter/claude-3.5-sonnet'] },
      });
    });

    it('applies disabled styling when disabled prop is true', () => {
      render(<ModelPicker disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50');
    });

    it('is interactive when not disabled', () => {
      render(<ModelPicker disabled={false} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('styling and structure', () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue({
        openrouterApiKey: 'sk-or-v1-test',
        enabledModels: { openrouter: ['openrouter/claude-3.5-sonnet'] },
      });
    });

    it('has correct width class', () => {
      render(<ModelPicker />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-48');
    });

    it('uses monospace font', () => {
      render(<ModelPicker />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('font-mono');
    });

    it('has uppercase tracking styling', () => {
      render(<ModelPicker />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('uppercase');
      expect(button).toHaveClass('tracking-wider');
    });
  });
});
