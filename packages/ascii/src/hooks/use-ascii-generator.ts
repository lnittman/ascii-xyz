import { useState, useCallback } from 'react';
import { generateFrame, generateAnimation } from '../utils/generators';
import type { AsciiGeneratorOptions, AnimationStyle } from '../types';

/**
 * Hook for generating ASCII art and animations
 * 
 * @example
 * ```tsx
 * const generator = useAsciiGenerator();
 * 
 * // Generate single frame
 * const frame = await generator.generateFrame({
 *   width: 40,
 *   height: 20,
 *   characterSet: 'box-drawing'
 * });
 * 
 * // Generate animation
 * const animation = await generator.generateAnimation({
 *   width: 40,
 *   height: 20,
 *   frameCount: 8,
 *   style: 'morph'
 * });
 * ```
 */
export function useAsciiGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFrameAsync = useCallback(async (options: AsciiGeneratorOptions): Promise<string> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const frame = await generateFrame(options);
      return frame;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateAnimationAsync = useCallback(async (
    options: AsciiGeneratorOptions & { 
      frameCount: number;
      style?: AnimationStyle;
    }
  ): Promise<string[]> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const frames = await generateAnimation(options);
      return frames;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateFrame: generateFrameAsync,
    generateAnimation: generateAnimationAsync,
    isGenerating,
    error
  };
}