import type { AsciiGeneratorOptions, CharacterSet, AnimationStyle } from '../types';
import { CHARACTER_SETS } from './character-sets';

/**
 * Generate a single ASCII art frame
 */
export async function generateFrame(options: AsciiGeneratorOptions): Promise<string> {
  const { width, height, characterSet, density = 0.3, seed } = options;
  const chars = CHARACTER_SETS[characterSet] || CHARACTER_SETS['box-drawing'];
  
  // Use seed for reproducible generation
  const random = seed ? seedRandom(seed) : Math.random;
  
  const lines: string[] = [];
  
  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      if (random() < density) {
        const charIndex = Math.floor(random() * chars.length);
        line += chars[charIndex];
      } else {
        line += ' ';
      }
    }
    lines.push(line);
  }
  
  return lines.join('\n');
}

/**
 * Generate an ASCII animation sequence
 */
export async function generateAnimation(
  options: AsciiGeneratorOptions & { 
    frameCount: number;
    style?: AnimationStyle;
  }
): Promise<string[]> {
  const { frameCount, style = 'morph', ...frameOptions } = options;
  const frames: string[] = [];
  
  switch (style) {
    case 'morph':
      frames.push(...await generateMorphAnimation(frameOptions, frameCount));
      break;
    
    case 'particle':
      frames.push(...await generateParticleAnimation(frameOptions, frameCount));
      break;
    
    case 'wave':
      frames.push(...await generateWaveAnimation(frameOptions, frameCount));
      break;
    
    case 'matrix':
      frames.push(...await generateMatrixAnimation(frameOptions, frameCount));
      break;
    
    case 'fire':
      frames.push(...await generateFireAnimation(frameOptions, frameCount));
      break;
    
    case 'geometric':
      frames.push(...await generateGeometricAnimation(frameOptions, frameCount));
      break;
    
    default:
      // Default to simple morph
      for (let i = 0; i < frameCount; i++) {
        frames.push(await generateFrame({
          ...frameOptions,
          seed: frameOptions.seed ? `${frameOptions.seed}-${i}` : undefined
        }));
      }
  }
  
  return frames;
}

/**
 * Generate morphing animation between shapes
 */
async function generateMorphAnimation(
  options: AsciiGeneratorOptions,
  frameCount: number
): Promise<string[]> {
  const frames: string[] = [];
  const { width, height, characterSet } = options;
  const chars = CHARACTER_SETS[characterSet] || CHARACTER_SETS['box-drawing'];
  
  // Start with a simple box
  for (let frame = 0; frame < frameCount; frame++) {
    const progress = frame / (frameCount - 1);
    const lines: string[] = [];
    
    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        const normalizedX = x / width;
        const normalizedY = y / height;
        
        // Create morphing pattern
        const isEdge = 
          normalizedX < 0.1 || normalizedX > 0.9 ||
          normalizedY < 0.1 || normalizedY > 0.9;
        
        const isInner = 
          normalizedX > 0.3 * (1 - progress) && normalizedX < 1 - 0.3 * (1 - progress) &&
          normalizedY > 0.3 * (1 - progress) && normalizedY < 1 - 0.3 * (1 - progress);
        
        if (isEdge) {
          line += chars[0]; // Border character
        } else if (isInner && progress > 0.5) {
          line += chars[Math.floor(progress * chars.length)];
        } else {
          line += ' ';
        }
      }
      lines.push(line);
    }
    
    frames.push(lines.join('\n'));
  }
  
  return frames;
}

/**
 * Generate particle system animation
 */
async function generateParticleAnimation(
  options: AsciiGeneratorOptions,
  frameCount: number
): Promise<string[]> {
  const frames: string[] = [];
  const { width, height } = options;
  const particleChars = ['·', '∘', '○', '◯', '◉', '●'];
  
  // Initialize particles
  const particles = Array.from({ length: 20 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    life: Math.random()
  }));
  
  for (let frame = 0; frame < frameCount; frame++) {
    const grid = Array(height).fill(null).map(() => Array(width).fill(' '));
    
    // Update and render particles
    particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.02;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = width - 1;
      if (particle.x >= width) particle.x = 0;
      if (particle.y < 0) particle.y = height - 1;
      if (particle.y >= height) particle.y = 0;
      
      // Reset dead particles
      if (particle.life <= 0) {
        particle.x = Math.random() * width;
        particle.y = Math.random() * height;
        particle.life = 1;
      }
      
      // Render particle
      const x = Math.floor(particle.x);
      const y = Math.floor(particle.y);
      const charIndex = Math.floor(particle.life * particleChars.length);
      
      if (x >= 0 && x < width && y >= 0 && y < height) {
        grid[y][x] = particleChars[charIndex] || '·';
      }
    });
    
    frames.push(grid.map(row => row.join('')).join('\n'));
  }
  
  return frames;
}

/**
 * Generate wave animation
 */
async function generateWaveAnimation(
  options: AsciiGeneratorOptions,
  frameCount: number
): Promise<string[]> {
  const frames: string[] = [];
  const { width, height } = options;
  const waveChars = ['～', '∿', '≈', '≋', '~'];
  
  for (let frame = 0; frame < frameCount; frame++) {
    const lines: string[] = [];
    const offset = (frame / frameCount) * Math.PI * 2;
    
    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        const wave = Math.sin((x / width) * Math.PI * 4 + offset) * 0.5 + 0.5;
        const waveY = Math.floor(wave * height);
        
        if (Math.abs(y - waveY) < 2) {
          const charIndex = Math.floor(wave * waveChars.length);
          line += waveChars[charIndex];
        } else {
          line += ' ';
        }
      }
      lines.push(line);
    }
    
    frames.push(lines.join('\n'));
  }
  
  return frames;
}

/**
 * Generate Matrix rain animation
 */
async function generateMatrixAnimation(
  options: AsciiGeneratorOptions,
  frameCount: number
): Promise<string[]> {
  const frames: string[] = [];
  const { width, height } = options;
  const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'.split('');
  
  // Initialize columns
  const columns = Array(width).fill(0).map(() => ({
    y: Math.floor(Math.random() * height),
    speed: 0.5 + Math.random() * 0.5,
    chars: Array(height).fill(' ')
  }));
  
  for (let frame = 0; frame < frameCount; frame++) {
    const grid = Array(height).fill(null).map(() => Array(width).fill(' '));
    
    columns.forEach((col, x) => {
      // Update column
      col.y += col.speed;
      if (col.y >= height) {
        col.y = 0;
        col.speed = 0.5 + Math.random() * 0.5;
      }
      
      // Render column trail
      for (let y = 0; y < height; y++) {
        const distance = col.y - y;
        if (distance > 0 && distance < 10) {
          const intensity = 1 - (distance / 10);
          if (intensity > 0.3) {
            grid[y][x] = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          }
        }
      }
    });
    
    frames.push(grid.map(row => row.join('')).join('\n'));
  }
  
  return frames;
}

/**
 * Generate fire animation
 */
async function generateFireAnimation(
  options: AsciiGeneratorOptions,
  frameCount: number
): Promise<string[]> {
  const frames: string[] = [];
  const { width, height } = options;
  const fireChars = [' ', '·', '∘', '○', '◉', '●', '█'];
  
  for (let frame = 0; frame < frameCount; frame++) {
    const grid = Array(height).fill(null).map(() => Array(width).fill(0));
    
    // Generate base heat
    for (let x = 0; x < width; x++) {
      if (Math.random() > 0.3) {
        grid[height - 1][x] = 6; // Max heat at bottom
      }
    }
    
    // Propagate heat upward
    for (let y = height - 2; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const below = grid[y + 1][x];
        const left = x > 0 ? grid[y + 1][x - 1] : 0;
        const right = x < width - 1 ? grid[y + 1][x + 1] : 0;
        
        const heat = (below + left + right) / 3.2; // Cooling factor
        grid[y][x] = Math.floor(heat);
      }
    }
    
    // Convert heat to characters
    const charFrame = grid.map(row => 
      row.map(heat => fireChars[Math.min(heat, fireChars.length - 1)]).join('')
    ).join('\n');
    
    frames.push(charFrame);
  }
  
  return frames;
}

/**
 * Generate geometric pattern animation
 */
async function generateGeometricAnimation(
  options: AsciiGeneratorOptions,
  frameCount: number
): Promise<string[]> {
  const frames: string[] = [];
  const { width, height, characterSet } = options;
  const chars = CHARACTER_SETS[characterSet] || CHARACTER_SETS['geometric'];
  
  for (let frame = 0; frame < frameCount; frame++) {
    const angle = (frame / frameCount) * Math.PI * 2;
    const lines: string[] = [];
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Rotating geometric pattern
        const angleToCenter = Math.atan2(dy, dx);
        const rotatedAngle = angleToCenter + angle;
        
        const pattern = 
          Math.sin(rotatedAngle * 3) * Math.cos(distance / radius * Math.PI);
        
        if (Math.abs(pattern) > 0.5) {
          const charIndex = Math.floor(Math.abs(pattern) * chars.length);
          line += chars[charIndex % chars.length];
        } else {
          line += ' ';
        }
      }
      lines.push(line);
    }
    
    frames.push(lines.join('\n'));
  }
  
  return frames;
}

/**
 * Seeded random number generator for reproducible results
 */
function seedRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}