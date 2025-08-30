# ASCII Animation System - Technical Documentation

## Overview

The ASCII animation system uses a JSON-based frame storage format to create fluid, morphing text-based animations. This approach provides precise creative control over each frame while maintaining efficient storage and rendering.

## Core Architecture

### Data Structure

```typescript
// morph-data.json structure
type MorphData = string[]; // Array of ASCII art frames

// Each string represents one complete frame
// Frames are played sequentially at specified speed
```

### Frame Design Principles

1. **Progressive Complexity**: Start with simple patterns, build to complex designs
2. **Smooth Transitions**: Ensure visual continuity between frames
3. **Character Density**: Balance negative space with detailed areas
4. **Semantic Morphing**: Transform shapes with meaning (boxes → grids → patterns)

## Creative Control System

### 1. Frame Composition

Each frame is a multi-line string using box-drawing characters:

```
╔════════════════════════════════════════╗
║  ASCII characters create visual depth  ║
╚════════════════════════════════════════╝
```

Available character sets:
- **Box Drawing**: `┌ ┐ └ ┘ ─ │ ┼ ╔ ╗ ╚ ╝ ═ ║ ╬`
- **Blocks**: `█ ▄ ▀ ░ ▒ ▓`
- **Geometric**: `◆ ◇ ○ ● □ ■ △ ▽`
- **Mathematical**: `∞ ∑ ∏ ∫ √ ∂ ∇`

### 2. Animation Techniques

#### Morphing Pattern
Frames transition through related shapes:
```
Frame 1: Simple box
Frame 2: Box with internal divisions
Frame 3: Grid pattern
Frame 4: Complex nested structure
```

#### Layering Effect
Build complexity through progressive layers:
```javascript
// Frame progression
[
  "┌─┐\n│ │\n└─┘",           // Base
  "┌─┬─┐\n├─┼─┤\n└─┴─┘",     // Divided
  "╔═╦═╗\n╠═╬═╣\n╚═╩═╝",     // Enhanced
]
```

### 3. Interactive Enhancement

The `AsciiMorph` component adds real-time interactivity:

```typescript
interface InteractiveFeatures {
  mouseTracking: boolean;      // Follow cursor position
  rippleEffect: boolean;       // Create ripples near mouse
  distortionRadius: number;    // Area of effect (0.1 = 10% of viewport)
  rippleCharacters: string[];  // Characters for ripple animation
}
```

#### Ripple Character Progression
```javascript
const rippleChars = ['◦', '○', '◯', '◉', '●', '◐', '◑', '◒', '◓'];
// Intensity: 0 ────────────────────────────> 1
```

### 4. Performance Optimization

#### Frame Rate Control
```typescript
speed: 150  // Milliseconds between frames
// Lower = faster animation
// 150ms = ~6.7 FPS (smooth for text)
```

#### Rendering Strategy
- Use `requestAnimationFrame` for smooth updates
- Batch DOM updates through React state
- Apply CSS transforms for visual effects without reflow

## Implementation Guide

### Creating Custom Animations

1. **Design Frame Sequence**
```javascript
const frames = [
  // Frame 1: Establish base shape
  `╔══════╗
   ║      ║
   ╚══════╝`,
  
  // Frame 2: Add internal structure
  `╔══╦═══╗
   ╠══╬═══╣
   ╚══╩═══╝`,
  
  // Frame 3: Increase complexity
  `╔═╦═╦═╗
   ╠═╬═╬═╣
   ╠═╬═╬═╣
   ╚═╩═╩═╝`,
];
```

2. **Export as JSON**
```javascript
// morph-data.json
export default frames;
```

3. **Configure Animation Component**
```tsx
<AsciiMorph 
  speed={200}        // Animation speed
  interactive={true} // Enable mouse interaction
  className="..."    // Styling
/>
```

### Advanced Techniques

#### 1. Particle Systems
Create flowing particle effects:
```
Frame 1: · · · · ·
Frame 2: · ∘ · ∘ ·
Frame 3: ∘ ○ ∘ ○ ∘
Frame 4: ○ ◯ ○ ◯ ○
```

#### 2. Wave Patterns
Simulate wave motion:
```
Frame 1: ～～～～～
Frame 2: ∿∿∿∿∿
Frame 3: ≈≈≈≈≈
```

#### 3. 3D Illusions
Use perspective characters:
```
   ╱╲
  ╱  ╲
 ╱    ╲
╱      ╲
```

## AI/LLM Integration

### Prompt Engineering for ASCII Generation

To generate data.json content via AI:

```markdown
Generate 8 frames of ASCII art animation that morphs from a simple box 
to a complex geometric pattern. Use box-drawing characters (╔═╗║╚╝├┤┬┴┼). 
Each frame should be 40 characters wide and 20 lines tall. 
Ensure smooth transitions between frames.
```

### LLM Response Processing

```typescript
async function generateAsciiFrames(prompt: string): Promise<string[]> {
  const response = await ai.generate({
    prompt: `Create ASCII animation frames: ${prompt}`,
    constraints: {
      width: 40,
      height: 20,
      frameCount: 8,
      characterSet: 'box-drawing'
    }
  });
  
  return response.frames;
}
```

### Quality Validation

```typescript
function validateFrame(frame: string): boolean {
  const lines = frame.split('\n');
  return (
    lines.length <= 20 &&                    // Height constraint
    lines.every(line => line.length <= 40) && // Width constraint
    /^[┌┐└┘─│┼╔╗╚╝═║╬\s]+$/.test(frame)    // Valid characters
  );
}
```

## Visual Effects Library

### Shimmer Effect
```css
.ascii-shimmer {
  animation: shimmer 2s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.1) 50%,
    transparent 100%
  );
}
```

### Glow Effect
```css
.ascii-glow {
  text-shadow: 
    0 0 10px currentColor,
    0 0 20px currentColor,
    0 0 30px currentColor;
}
```

### Matrix Rain Effect
```typescript
// Vertical cascading characters
const matrixRain = (frame: string): string => {
  return frame.split('').map((char, i) => 
    Math.random() > 0.98 ? '█' : char
  ).join('');
};
```

## Best Practices

1. **Frame Consistency**: Maintain consistent dimensions across all frames
2. **Character Balance**: Use 20-30% filled characters for optimal visibility
3. **Transition Smoothness**: Limit character changes to 10-15% per frame
4. **Performance**: Keep frame count under 16 for smooth looping
5. **Accessibility**: Provide `prefers-reduced-motion` alternatives

## Example: Complete Animation Set

```javascript
// Fire animation example
const fireFrames = [
  // Frame 1: Ember
  `     ·     
    ·◦·    
   ·◦○◦·   
  ·◦○●○◦·  `,
  
  // Frame 2: Small flame
  `    ∧     
   ╱│╲    
  ╱◦│◦╲   
 ╱○●│●○╲  `,
  
  // Frame 3: Growing flame
  `   ∧∧∧    
  ╱║║║╲   
 ╱◉║║║◉╲  
╱●●║║║●●╲ `,
  
  // Frame 4: Full blaze
  `  ∧∧∧∧∧   
 ╱║║║║║╲  
╱◉║◉║◉║◉╲ 
●●●║║║●●● `
];
```

## Integration with ASCII Platform

The data.json system integrates seamlessly with the ASCII platform:

1. **Storage**: Frames stored in Convex as JSON arrays
2. **Generation**: AI creates frames based on user prompts
3. **Playback**: Client-side animation with AsciiMorph component
4. **Sharing**: Export animations as standalone JSON files
5. **Gallery**: Display static frame or animated preview

This architecture enables both creative freedom and technical precision in ASCII art animation.