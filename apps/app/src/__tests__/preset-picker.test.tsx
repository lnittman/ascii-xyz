import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import './setup';

// Mock the preset hooks
const mockUseSystemPresets = vi.fn();
const mockUseUserPresets = vi.fn();
const mockUsePresetManagement = vi.fn();

vi.mock('@/hooks/use-ascii', () => ({
  useSystemPresets: () => mockUseSystemPresets(),
  useUserPresets: () => mockUseUserPresets(),
  usePresetManagement: () => mockUsePresetManagement(),
}));

// Mock Clerk hook
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { id: 'user_test123' },
    isLoaded: true,
    isSignedIn: true,
  }),
}));

// Import after mocking
import { PresetPicker } from '@/components/preset-picker';

// Test preset data
const systemPresets = [
  {
    _id: 'preset1' as any,
    name: 'Minimal',
    description: 'Clean, minimal ASCII art',
    type: 'system' as const,
    settings: { style: 'minimal', width: 60, height: 20, fps: 8 },
    isEnabled: true,
    sortOrder: 1,
  },
  {
    _id: 'preset2' as any,
    name: 'Cinematic',
    description: 'Wide format, smooth animation',
    type: 'system' as const,
    settings: { style: 'cinematic', width: 120, height: 40, fps: 24 },
    isEnabled: true,
    sortOrder: 2,
  },
];

const userPresets = [
  {
    _id: 'preset3' as any,
    name: 'My Style',
    description: 'Custom preset',
    type: 'user' as const,
    userId: 'user1' as any,
    settings: { style: 'custom', width: 80, height: 30, fps: 12 },
    isEnabled: true,
    sortOrder: 1,
  },
];

describe('PresetPicker', () => {
  const mockOnSelect = vi.fn();
  const mockCreatePreset = vi.fn();
  const mockDeletePreset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSystemPresets.mockReturnValue({ status: 'ready', data: systemPresets });
    mockUseUserPresets.mockReturnValue({ status: 'ready', data: userPresets });
    mockUsePresetManagement.mockReturnValue({
      createPreset: mockCreatePreset,
      deletePreset: mockDeletePreset,
    });
  });

  describe('rendering', () => {
    it('renders the preset picker button', () => {
      render(<PresetPicker onSelect={mockOnSelect} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows placeholder text when no preset selected', () => {
      render(<PresetPicker onSelect={mockOnSelect} />);

      expect(screen.getByRole('button')).toHaveTextContent(/preset|select/i);
    });

    it('shows selected preset name', () => {
      render(
        <PresetPicker
          onSelect={mockOnSelect}
          selectedPresetId={'preset1' as any}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Minimal');
    });

    it('shows selected user preset name', () => {
      render(
        <PresetPicker
          onSelect={mockOnSelect}
          selectedPresetId={'preset3' as any}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('My Style');
    });

    it('renders as dropdown trigger', () => {
      render(<PresetPicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'menu');
    });
  });

  describe('loading state', () => {
    it('shows button while loading', () => {
      mockUseSystemPresets.mockReturnValue({ status: 'loading', data: undefined });
      mockUseUserPresets.mockReturnValue({ status: 'loading', data: undefined });

      render(<PresetPicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('falls back to placeholder when loading', () => {
      mockUseSystemPresets.mockReturnValue({ status: 'loading', data: undefined });
      mockUseUserPresets.mockReturnValue({ status: 'loading', data: undefined });

      render(<PresetPicker onSelect={mockOnSelect} selectedPresetId={'preset1' as any} />);

      // Can't show the preset name if data isn't loaded
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(/select preset/i);
    });
  });

  describe('disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(<PresetPicker onSelect={mockOnSelect} disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies disabled styling', () => {
      render(<PresetPicker onSelect={mockOnSelect} disabled />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-50');
    });

    it('is interactive when not disabled', () => {
      render(<PresetPicker onSelect={mockOnSelect} disabled={false} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('styling', () => {
    it('has correct base classes', () => {
      render(<PresetPicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('font-mono');
    });

    it('applies custom className', () => {
      render(<PresetPicker onSelect={mockOnSelect} className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('has correct width class', () => {
      render(<PresetPicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-48');
    });

    it('uses uppercase tracking styling', () => {
      render(<PresetPicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('uppercase');
      expect(button).toHaveClass('tracking-wider');
    });
  });

  describe('preset selection', () => {
    it('shows different preset when selection changes', () => {
      const { rerender } = render(
        <PresetPicker onSelect={mockOnSelect} selectedPresetId={'preset1' as any} />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Minimal');

      rerender(
        <PresetPicker onSelect={mockOnSelect} selectedPresetId={'preset2' as any} />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Cinematic');
    });

    it('falls back to placeholder when preset not found', () => {
      render(
        <PresetPicker onSelect={mockOnSelect} selectedPresetId={'nonexistent' as any} />
      );

      expect(screen.getByRole('button')).toHaveTextContent(/select preset/i);
    });
  });

  describe('data loading', () => {
    it('uses system presets from hook', () => {
      render(
        <PresetPicker onSelect={mockOnSelect} selectedPresetId={'preset1' as any} />
      );

      expect(mockUseSystemPresets).toHaveBeenCalled();
      expect(screen.getByRole('button')).toHaveTextContent('Minimal');
    });

    it('uses user presets from hook with userId', () => {
      render(
        <PresetPicker
          onSelect={mockOnSelect}
          userId={'user123' as any}
        />
      );

      expect(mockUseUserPresets).toHaveBeenCalled();
    });

    it('handles empty presets gracefully', () => {
      mockUseSystemPresets.mockReturnValue({ status: 'empty', data: [] });
      mockUseUserPresets.mockReturnValue({ status: 'empty', data: [] });

      render(<PresetPicker onSelect={mockOnSelect} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(/select preset/i);
    });
  });
});
