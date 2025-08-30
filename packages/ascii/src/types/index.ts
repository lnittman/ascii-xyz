/**
 * ASCII Package Type Definitions
 * Comprehensive types for ASCII art generation and animation
 */

// Core component props
export interface AsciiMorphProps {
  /** Array of ASCII art frames to morph between */
  frames: string[];
  /** Additional CSS classes */
  className?: string;
  /** Animation speed in milliseconds between frames (default: 150) */
  speed?: number;
  /** Enable mouse interaction (default: true) */
  interactive?: boolean;
  /** Ripple effect configuration */
  rippleConfig?: RippleConfig;
  /** Loop animation (default: true) */
  loop?: boolean;
  /** Auto-start animation (default: true) */
  autoPlay?: boolean;
  /** Callback when frame changes */
  onFrameChange?: (frameIndex: number, frameContent: string) => void;
  /** Callback when animation completes (only if loop is false) */
  onComplete?: () => void;
}

export interface RippleConfig {
  /** Enable ripple effect on mouse interaction */
  enabled: boolean;
  /** Radius of effect as percentage of viewport (0-1) */
  radius: number;
  /** Characters to use for ripple animation */
  characters: string[];
}

export interface MousePosition {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
}

// ASCII generation types
export interface AsciiGeneratorOptions {
  /** Width in characters */
  width: number;
  /** Height in lines */
  height: number;
  /** Character set to use */
  characterSet: CharacterSet;
  /** Density of characters (0-1) */
  density?: number;
  /** Seed for reproducible generation */
  seed?: string;
}

export type CharacterSet = 
  | 'box-drawing'      // ┌ ┐ └ ┘ ─ │ ┼ ╔ ╗ ╚ ╝ ═ ║ ╬
  | 'blocks'          // █ ▄ ▀ ░ ▒ ▓
  | 'geometric'       // ◆ ◇ ○ ● □ ■ △ ▽
  | 'mathematical'    // ∞ ∑ ∏ ∫ √ ∂ ∇
  | 'arrows'          // ← → ↑ ↓ ↖ ↗ ↘ ↙
  | 'dots'            // · ∘ ◦ ○ ◯ ◉ ●
  | 'custom';         // User-provided character array

// Animation types
export interface AnimationSequence {
  frames: string[];
  metadata: AnimationMetadata;
}

export interface AnimationMetadata {
  /** Animation name */
  name: string;
  /** Frame rate in FPS */
  fps: number;
  /** Total duration in ms */
  duration: number;
  /** Animation style */
  style: AnimationStyle;
  /** Generator used */
  generator?: string;
  /** AI model used if applicable */
  model?: string;
  /** Creation timestamp */
  createdAt: Date;
}

export type AnimationStyle = 
  | 'morph'           // Smooth morphing between shapes
  | 'particle'        // Particle system effects
  | 'wave'            // Wave motion
  | 'glitch'          // Glitch/distortion effects
  | 'matrix'          // Matrix rain style
  | 'fire'            // Fire/flame animation
  | 'water'           // Water/liquid flow
  | 'geometric'       // Geometric transformations
  | 'organic';        // Organic/natural movement

// Hook return types
export interface UseAsciiAnimation {
  /** Current frame index */
  currentFrame: number;
  /** Total number of frames */
  totalFrames: number;
  /** Is animation playing */
  isPlaying: boolean;
  /** Control functions */
  controls: AnimationControls;
  /** Current frame content */
  frameContent: string;
}

export interface AnimationControls {
  play: () => void;
  pause: () => void;
  reset: () => void;
  goToFrame: (frame: number) => void;
  setSpeed: (speed: number) => void;
}

// Data format types
export interface AsciiDataFormat {
  /** Version of the data format */
  version: '1.0.0';
  /** Animation sequences */
  animations: Record<string, AnimationSequence>;
  /** Global metadata */
  metadata?: {
    author?: string;
    license?: string;
    description?: string;
    tags?: string[];
  };
}

// Generator function types
export type AsciiGenerator = (options: AsciiGeneratorOptions) => string;
export type AnimationGenerator = (options: AsciiGeneratorOptions & { frameCount: number }) => string[];

// Preset types
export interface AsciiPreset {
  name: string;
  description: string;
  frames: string[];
  config: {
    speed: number;
    interactive: boolean;
    rippleConfig: RippleConfig;
  };
}

// Utility types
export interface CharacterMap {
  [key: string]: string[];
}

export interface FrameValidator {
  (frame: string): ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  stats?: {
    width: number;
    height: number;
    characterCount: number;
    density: number;
  };
}