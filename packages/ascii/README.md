# @repo/ascii

Comprehensive ASCII art generation and animation package with data.json-driven animations and full creative control.

## Features

- 🎨 **AsciiMorph Component** - High-performance morphing animations
- 🖱️ **Interactive Effects** - Mouse tracking with ripple effects
- 🎬 **Animation Hooks** - Full programmatic control
- 🔧 **Generator Utilities** - Create custom ASCII art
- 📦 **Pre-built Animations** - Ready-to-use data.json files
- 🤖 **LLM Integration** - Instructions for AI generation

## Installation

```bash
# In your turborepo workspace
pnpm add @repo/ascii
```

## Quick Start

```tsx
import { AsciiMorph } from '@repo/ascii';
import { geometricMorphData } from '@repo/ascii/data';

function App() {
  return (
    <AsciiMorph 
      frames={geometricMorphData}
      speed={150}
      interactive={true}
      className="absolute inset-0"
    />
  );
}
```

## Components

### AsciiMorph

The main component for displaying ASCII animations with interactive features.

```tsx
<AsciiMorph
  frames={frames}           // Array of ASCII frames
  speed={150}               // Animation speed (ms)
  interactive={true}        // Enable mouse interaction
  loop={true}              // Loop animation
  autoPlay={true}          // Auto-start
  rippleConfig={{          // Ripple effect settings
    enabled: true,
    radius: 0.1,
    characters: ['◦', '○', '◯', '◉', '●']
  }}
  onFrameChange={(index, content) => {}}
  onComplete={() => {}}
/>
```

## Hooks

### useAsciiAnimation

Control animations programmatically:

```tsx
const animation = useAsciiAnimation(frames, {
  speed: 200,
  autoPlay: true,
  loop: true
});

// Control methods
animation.controls.play();
animation.controls.pause();
animation.controls.reset();
animation.controls.goToFrame(5);
animation.controls.setSpeed(100);

// State
console.log(animation.currentFrame);
console.log(animation.isPlaying);
```

### useAsciiGenerator

Generate ASCII art dynamically:

```tsx
const generator = useAsciiGenerator();

// Generate single frame
const frame = await generator.generateFrame({
  width: 40,
  height: 20,
  characterSet: 'box-drawing',
  density: 0.3
});

// Generate animation
const frames = await generator.generateAnimation({
  width: 40,
  height: 20,
  frameCount: 8,
  style: 'morph',
  characterSet: 'geometric'
});
```

## Character Sets

Pre-defined character sets for different styles:

- **box-drawing**: `┌ ┐ └ ┘ ─ │ ┼ ╔ ╗ ╚ ╝ ═ ║ ╬`
- **blocks**: `█ ▄ ▀ ░ ▒ ▓`
- **geometric**: `◆ ◇ ○ ● □ ■ △ ▽`
- **mathematical**: `∞ ∑ ∏ ∫ √ ∂ ∇`
- **arrows**: `← → ↑ ↓ ↖ ↗ ↘ ↙`
- **dots**: `· ∘ ◦ ○ ◯ ◉ ●`

## Animation Styles

Available animation generation styles:

- **morph** - Smooth shape transitions
- **particle** - Particle system effects
- **wave** - Wave motion patterns
- **matrix** - Matrix rain effect
- **fire** - Fire/flame animation
- **geometric** - Geometric transformations

## Data Format

ASCII animations use a simple JSON array format:

```json
[
  "Frame 1 ASCII art\nwith multiple lines",
  "Frame 2 ASCII art\nwith multiple lines",
  "Frame 3 ASCII art\nwith multiple lines"
]
```

## LLM Integration

See [LLM-INSTRUCTIONS.md](./LLM-INSTRUCTIONS.md) for detailed instructions on generating ASCII art with AI/LLM systems.

Example prompt:
```
Generate 8 frames of ASCII animation showing a box morphing into a complex grid.
Use box-drawing characters (╔═╗║╚╝├┤┬┴┼).
Each frame: 40 chars wide, 20 lines tall.
Return as JSON array.
```

## Advanced Usage

### Custom Ripple Effects

```tsx
<AsciiMorph
  frames={frames}
  rippleConfig={{
    enabled: true,
    radius: 0.15,  // 15% of viewport
    characters: ['⚬', '◯', '◉', '◎', '◈']
  }}
/>
```

### Frame Validation

```tsx
import { validateFrame } from '@repo/ascii/utils';

const result = validateFrame(frameString);
if (!result.valid) {
  console.error(result.errors);
}
```

### Combining Animations

```tsx
const combined = [
  ...animation1.frames,
  ...animation2.frames,
  ...animation3.frames
];

<AsciiMorph frames={combined} />
```

## Performance Tips

1. **Frame Count**: Keep under 16 frames for smooth looping
2. **Dimensions**: Optimize width/height for your use case
3. **Character Density**: 20-40% density for best readability
4. **Speed**: 150-200ms per frame for comfortable viewing
5. **Interactive**: Disable if not needed to save CPU

## Examples

### Loading Animation
```tsx
const loadingFrames = [
  "[    ]",
  "[■   ]",
  "[■■  ]",
  "[■■■ ]",
  "[■■■■]"
];
```

### Logo Morph
```tsx
import { generateAnimation } from '@repo/ascii/utils';

const logoFrames = await generateAnimation({
  width: 30,
  height: 10,
  frameCount: 8,
  style: 'geometric',
  characterSet: 'geometric'
});
```

## Contributing

See the main repository's contribution guidelines.

## License

MIT