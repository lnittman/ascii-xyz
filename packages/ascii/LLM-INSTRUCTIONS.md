# LLM Instructions for ASCII Art Generation

This document provides instructions for AI/LLM systems to generate high-quality ASCII art animations compatible with the @repo/ascii package.

## Core Principles

1. **Frame-based Animation**: All animations are arrays of string frames
2. **Consistent Dimensions**: Each frame must have identical width and height
3. **Character Sets**: Use specific character sets for different styles
4. **Smooth Transitions**: Ensure gradual changes between frames for fluid animation

## Generation Templates

### Basic ASCII Frame Generation

```
Generate an ASCII art frame with the following specifications:
- Width: {width} characters
- Height: {height} lines
- Character set: {characterSet}
- Density: {density} (0-1, where 0 is empty and 1 is full)
- Style: {style}

Return ONLY the ASCII art, no explanations or markdown.
```

### Animation Sequence Generation

```
Generate {frameCount} frames of ASCII animation that {description}.

Requirements:
- Each frame: {width} characters wide, {height} lines tall
- Character set: {characterSet}
- Animation style: {style}
- Smooth transitions between frames
- Progressive complexity/movement

Return as a JSON array where each element is a frame string.
```

## Character Set Guidelines

### Box Drawing (Technical/Architectural)
```
Use these characters: ┌ ┐ └ ┘ ─ │ ┼ ├ ┤ ┬ ┴ ╔ ╗ ╚ ╝ ═ ║ ╬ ╠ ╣ ╦ ╩
Best for: Technical diagrams, UI mockups, structured patterns
```

### Blocks (Solid/Dense)
```
Use these characters: █ ▄ ▀ ░ ▒ ▓ ▌ ▐
Best for: Solid shapes, gradients, fill patterns
```

### Geometric (Abstract/Modern)
```
Use these characters: ◆ ◇ ○ ● □ ■ △ ▽
Best for: Abstract art, modern patterns, logos
```

### Dots (Particles/Organic)
```
Use these characters: · ∘ ◦ ○ ◯ ◉ ●
Best for: Particle effects, organic growth, ripples
```

## Animation Styles

### 1. Morph Animation
```
Start with a simple shape and progressively transform it into a complex pattern.
Frame 1: Basic outline
Frame 2-N: Gradual addition of internal structure
Final Frame: Complete complex pattern

Example progression:
□ → ◽ → ▢ → ⬜ → complex grid
```

### 2. Particle System
```
Simulate particles with physics:
- Initialize random positions
- Apply velocity and gravity
- Handle collisions/boundaries
- Vary particle intensity over lifetime

Use dots character set with size progression:
· → ∘ → ○ → ◯ → ● (growth)
● → ◯ → ○ → ∘ → · (decay)
```

### 3. Wave Motion
```
Create flowing wave patterns:
- Use sine/cosine functions for smooth motion
- Offset phase per frame for animation
- Characters: ~ ≈ ∿ ≋

Wave amplitude and frequency should remain consistent.
```

### 4. Fire Effect
```
Bottom-up heat propagation:
- Maximum heat at base
- Dissipate upward with turbulence
- Character intensity map:
  ' ' (cold) → '.' → ':' → '!' → '|' → '#' (hot)
```

### 5. Matrix Rain
```
Vertical cascading characters:
- Random starting positions
- Variable fall speeds
- Fading trail effect
- Mix alphanumeric and special characters
```

## Quality Criteria

### Frame Validation
- **Consistent dimensions**: All frames exact same width/height
- **No overflow**: Content stays within bounds
- **Smooth transitions**: <15% character changes between frames
- **Character validity**: Only use specified character set

### Animation Flow
- **Natural progression**: Logical sequence of transformations
- **Loop compatibility**: Last frame should transition to first
- **Timing consideration**: Assume 150ms per frame default

## Example Prompts

### Simple Box Morph
```
Generate 8 frames of ASCII animation showing a box morphing into a complex grid.
Use box-drawing characters (╔═╗║╚╝├┤┬┴┼).
Each frame: 40 chars wide, 20 lines tall.
Progress from empty box to fully subdivided grid.
```

### Organic Growth
```
Create 12 frames showing organic growth pattern.
Start with single dot (·) in center.
Expand outward using dots of increasing size (·∘○◯●).
Final frame: 30x15 characters, circular pattern.
Simulate plant/crystal growth.
```

### Technical Transition
```
Generate 10 frames transitioning from horizontal lines to vertical lines.
Use only ─ and │ characters.
40x20 dimensions.
Smooth rotation effect through intermediate diagonal states.
```

## Output Format

### Single Frame
```
╔════════════════╗
║                ║
║   ASCII ART    ║
║                ║
╚════════════════╝
```

### Animation Array (JSON)
```json
[
  "╔═══╗\n║   ║\n╚═══╝",
  "╔═╦═╗\n╠═╬═╣\n╚═╩═╝",
  "╔╦╦╦╗\n╠╬╬╬╣\n╚╩╩╩╝"
]
```

### Data Structure
```typescript
interface AsciiAnimation {
  frames: string[];
  metadata: {
    width: number;
    height: number;
    fps: number;
    characterSet: string;
    style: string;
  };
}
```

## Common Patterns

### Border Patterns
```
Simple:  ┌─┐
         │ │
         └─┘

Double:  ╔═╗
         ║ ║
         ╚═╝

Rounded: ╭─╮
         │ │
         ╰─╯
```

### Fill Patterns
```
Gradient: ░░▒▒▓▓██
Dotted:   ·:·:·:·:
Lined:    ─┼─┼─┼─
Hashed:   #=#=#=#=
```

### Movement Patterns
```
Rotation:  | / - \
Pulse:     · ○ ● ○ ·
Wave:      ~ ≈ ≋ ≈ ~
Spiral:    ◜◝◞◟
```

## Integration Code

When generating for @repo/ascii package:

```typescript
// Expected format
const animationData = {
  frames: [/* generated frames */],
  config: {
    speed: 150,
    interactive: true,
    rippleConfig: {
      enabled: true,
      radius: 0.1,
      characters: ['◦', '○', '◯', '◉', '●']
    }
  }
};

// Usage
import { AsciiMorph } from '@repo/ascii';

<AsciiMorph 
  frames={animationData.frames}
  {...animationData.config}
/>
```

## Tips for Best Results

1. **Test dimensions**: Always verify frame dimensions match requirements
2. **Preview animation**: Mentally step through frames for smooth flow
3. **Character consistency**: Don't mix incompatible character sets
4. **Density balance**: Aim for 20-40% character density for readability
5. **Edge handling**: Ensure patterns don't cut off at boundaries
6. **Performance**: Limit to 16 frames for smooth looping
7. **Accessibility**: Maintain sufficient contrast and spacing

Remember: The goal is creating visually engaging, technically precise ASCII animations that enhance user experience while maintaining performance.