import type { CharacterSet, CharacterMap } from '../types';

/**
 * Predefined character sets for ASCII art generation
 */
export const CHARACTER_SETS: Record<CharacterSet, string[]> = {
  'box-drawing': [
    '┌', '┐', '└', '┘', '─', '│', '┼', 
    '├', '┤', '┬', '┴',
    '╔', '╗', '╚', '╝', '═', '║', '╬',
    '╠', '╣', '╦', '╩'
  ],
  
  'blocks': [
    '█', '▄', '▀', '░', '▒', '▓',
    '▌', '▐', '▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟'
  ],
  
  'geometric': [
    '◆', '◇', '○', '●', '□', '■', '△', '▽',
    '◈', '◊', '◌', '◍', '◎', '◐', '◑', '◒', '◓',
    '▲', '▼', '◀', '▶', '◢', '◣', '◤', '◥'
  ],
  
  'mathematical': [
    '∞', '∑', '∏', '∫', '√', '∂', '∇',
    '±', '×', '÷', '≈', '≠', '≤', '≥',
    '∈', '∉', '⊂', '⊃', '∪', '∩', '∅'
  ],
  
  'arrows': [
    '←', '→', '↑', '↓', '↖', '↗', '↘', '↙',
    '⇐', '⇒', '⇑', '⇓', '⇔', '⇕', '⇖', '⇗', '⇘', '⇙',
    '↰', '↱', '↲', '↳', '↴', '↵'
  ],
  
  'dots': [
    '·', '∘', '◦', '○', '◯', '◉', '●',
    '⊙', '⊚', '⊛', '⊜', '⊝'
  ],
  
  'custom': [] // User will provide their own
};

/**
 * Get character set by name or return custom array
 */
export function getCharacterSet(
  characterSet: CharacterSet | string[],
): string[] {
  if (Array.isArray(characterSet)) {
    return characterSet;
  }
  return CHARACTER_SETS[characterSet] || CHARACTER_SETS['box-drawing'];
}

/**
 * Create gradient of characters from light to dark
 */
export function createDensityGradient(): string[] {
  return [' ', '.', '·', '∘', '○', '◐', '◑', '◒', '◓', '●', '█'];
}

/**
 * Common ASCII art characters for different styles
 */
export const STYLE_CHARACTERS = {
  retro: ['#', '@', '%', '&', '*', '+', '=', '-', ':', '.', ' '],
  modern: ['█', '▓', '▒', '░', '▄', '▀', '▌', '▐', ' '],
  minimal: ['│', '─', '┼', '·', ' '],
  dotted: ['·', ':', '∘', '○', '●', ' '],
  organic: ['~', '≈', '∿', '〜', '∼', '∽', ' '],
} as const;

/**
 * Character maps for specific effects
 */
export const EFFECT_CHARACTERS: CharacterMap = {
  ripple: ['◦', '○', '◯', '◉', '●', '◐', '◑', '◒', '◓'],
  fade: [' ', '·', '∘', '○', '◯', '●'],
  glitch: ['▓', '▒', '░', '█', '▄', '▀', '▌', '▐'],
  matrix: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'.split(''),
  fire: [' ', '.', ':', ';', '!', '|', '/', '\\', '(', ')', '[', ']', '{', '}', '#', '%', '&', '*', '@'],
  water: ['~', '≈', '∿', '〜', '∼', '∽', '≋', '≌'],
  electric: ['/', '\\', '|', '-', '+', 'X', 'Z', 'N', 'M'],
};

/**
 * Get random character from set
 */
export function getRandomCharacter(set: string[]): string {
  return set[Math.floor(Math.random() * set.length)];
}

/**
 * Interpolate between two characters based on value (0-1)
 */
export function interpolateCharacter(
  set: string[],
  value: number
): string {
  const index = Math.floor(value * (set.length - 1));
  return set[Math.max(0, Math.min(index, set.length - 1))];
}