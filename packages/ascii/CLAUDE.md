# Claude Guide to @repo/ascii

**Welcome, Claude!** You're working on the ASCII art animation package - a beautiful, reusable library for creating stunning ASCII animations in web applications.

## 🎨 Package Overview

This package provides a complete ASCII art animation system with:
- **ASCII Engine**: Core animation engine with frame control
- **Generators**: Procedural ASCII art generators (forest, water, fire, etc.)
- **Components**: React components for rendering animations
- **Hooks**: Custom hooks for animation control
- **Presets**: Pre-built animations ready to use

## 🏗️ Architecture

```
packages/ascii/
├── src/
│   ├── engine/           # Core animation engine
│   │   ├── index.tsx     # Main AsciiEngine component
│   │   ├── types.ts      # TypeScript interfaces
│   │   └── utils.ts      # Helper utilities
│   ├── generators/       # ASCII art generators
│   │   ├── forest.ts     # Forest/trees/logs animations
│   │   ├── water.ts      # Water/ocean/rain effects
│   │   ├── fire.ts       # Fire/flame animations
│   │   ├── matrix.ts     # Matrix rain effect
│   │   ├── wave.ts       # Wave patterns
│   │   └── index.ts      # Export all generators
│   ├── components/       # React components
│   │   ├── AsciiAnimation.tsx    # Main animation component
│   │   ├── ForestScene.tsx       # Forest scene component
│   │   ├── LogsAnimation.tsx     # Logs-specific animation
│   │   └── index.tsx              # Export all components
│   ├── hooks/            # Custom React hooks
│   │   ├── useAsciiEngine.ts     # Engine control hook
│   │   ├── useAsciiGenerator.ts  # Generator hook
│   │   ├── useAsciiFrame.ts      # Frame control hook
│   │   └── index.ts               # Export all hooks
│   ├── presets/          # Pre-built animations
│   │   ├── forest.ts     # Forest presets
│   │   ├── logos.ts      # Logo animations
│   │   └── index.ts      # Export all presets
│   ├── data/             # Static ASCII art data
│   │   ├── frames/       # Pre-rendered frames
│   │   └── patterns.ts   # ASCII patterns
│   └── index.ts          # Main package export
├── .cursor/
│   └── rules/
│       └── ascii.md      # Cursor-specific rules
├── CLAUDE.md             # This file
├── AGENTS.md             # Symlink to agent instructions
└── package.json
```

## 🎭 Core Components

### ASCII Engine

The core animation engine that handles frame rendering and timing:

```typescript
interface AsciiEngineProps {
  frames: string[]           // Array of ASCII frames
  fps?: number               // Frames per second (default: 12)
  loop?: boolean            // Loop animation (default: true)
  reverse?: boolean         // Play in reverse
  pingPong?: boolean        // Ping-pong animation
  delay?: number            // Start delay in ms
  autoPlay?: boolean        // Auto-start (default: true)
  visibilityOptimized?: boolean  // Pause when off-screen
  className?: string
  style?: React.CSSProperties
  onFrame?: (index: number) => void
  onComplete?: () => void
  onClick?: () => void
}
```

### Generators

Procedural ASCII art generators that create animation frames:

#### Forest Generator
```typescript
generateForestFrames(
  width: number,
  height: number,
  frameCount: number,
  options?: {
    treeTypes?: TreeType[]
    windSpeed?: number
    density?: number
    perspective?: boolean
  }
): string[]
```

#### Logs Generator
```typescript
generateLogsFrames(
  width: number,
  height: number,
  frameCount: number,
  options?: {
    logCount?: number
    floating?: boolean
    stacked?: boolean
    rotation?: boolean
  }
): string[]
```

## 🌲 Forest/Logs Animation System

### Tree Types
```typescript
enum TreeType {
  PINE = 'pine',        // ▲ shaped trees
  OAK = 'oak',         // Round canopy
  BIRCH = 'birch',     // Tall and thin
  WILLOW = 'willow',   // Drooping branches
  LOGS = 'logs'        // Stacked/floating logs
}
```

### ASCII Characters
```typescript
const FOREST_CHARS = {
  trunk: ['│', '║', '|', '╎', '┃'],
  branches: ['╱', '╲', '/', '\\', '╳'],
  leaves: ['▓', '▒', '░', '⣿', '⣷'],
  ground: ['_', '▁', '▂', '─', '═'],
  logs: ['═', '━', '─', '█', '▬'],
  moss: ['·', '∘', '°', '•', '◦']
}
```

## 🎯 Usage Examples

### Basic Forest Animation
```typescript
import { ForestScene } from '@repo/ascii/components'

export function Hero() {
  return (
    <ForestScene
      width={120}
      height={40}
      animated
      windEffect
      perspective="3d"
    />
  )
}
```

### Custom Logs Animation
```typescript
import { AsciiEngine } from '@repo/ascii/engine'
import { generateLogsFrames } from '@repo/ascii/generators'

export function LogsHero() {
  const frames = generateLogsFrames(100, 30, 60, {
    logCount: 12,
    floating: true,
    rotation: true
  })
  
  return (
    <AsciiEngine
      frames={frames}
      fps={24}
      className="text-amber-900/20"
    />
  )
}
```

### Using Hooks
```typescript
import { useAsciiEngine, useForestGenerator } from '@repo/ascii/hooks'

export function InteractiveForest() {
  const frames = useForestGenerator({ 
    width: 80, 
    height: 30,
    treeTypes: ['pine', 'oak']
  })
  
  const { play, pause, reset, currentFrame } = useAsciiEngine({
    frames,
    autoPlay: false
  })
  
  return (
    <div>
      <AsciiEngine frames={frames} />
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <button onClick={reset}>Reset</button>
      <span>Frame: {currentFrame}</span>
    </div>
  )
}
```

## 🎨 Styling Guidelines

### Default Styles
```css
.ascii-animation {
  font-family: 'IosevkaTerm-Regular', monospace;
  white-space: pre;
  user-select: none;
  line-height: 1.2;
  letter-spacing: 0.05em;
}

/* Forest theme */
.ascii-forest {
  color: rgb(34 197 94 / 0.2);  /* green-500/20 */
  text-shadow: 0 0 10px rgb(34 197 94 / 0.1);
}

/* Logs theme */
.ascii-logs {
  color: rgb(180 83 9 / 0.2);   /* amber-700/20 */
  text-shadow: 0 0 8px rgb(180 83 9 / 0.1);
}
```

### Dark Mode Support
```typescript
// Automatically adjusts opacity based on theme
<ForestScene 
  className="text-green-900/20 dark:text-green-500/10"
/>
```

## 🚀 Performance Optimization

### Visibility Observer
The engine automatically pauses animations when off-screen:
```typescript
visibilityOptimized={true} // Default
```

### Frame Caching
Generators can cache frames for repeated use:
```typescript
const cachedFrames = useMemo(
  () => generateForestFrames(width, height, frameCount),
  [width, height, frameCount]
)
```

### Lazy Loading
```typescript
const ForestScene = dynamic(
  () => import('@repo/ascii/components').then(mod => mod.ForestScene),
  { ssr: false }
)
```

## 🎮 Interactive Features

### Mouse Interaction
```typescript
<ForestScene
  onMouseMove={(x, y) => {
    // Wind follows mouse
  }}
  onClick={() => {
    // Drop a log
  }}
/>
```

### Responsive Sizing
```typescript
const { width, height } = useWindowSize()
const frames = generateForestFrames(
  Math.floor(width / 10),  // Character width
  Math.floor(height / 20), // Character height
  30
)
```

## 🔧 Advanced Features

### 3D Perspective
```typescript
generate3DForestFrames({
  width: 120,
  height: 40,
  depth: 20,
  vanishingPoint: { x: 60, y: 10 },
  rotation: time => time * 0.01
})
```

### Particle Effects
```typescript
// Add falling leaves, snow, or fireflies
addParticles(frames, {
  type: 'leaves',
  count: 50,
  gravity: 0.1,
  wind: { x: 0.5, y: 0 }
})
```

### Parallax Layers
```typescript
<ParallaxForest
  layers={[
    { frames: backgroundTrees, speed: 0.5 },
    { frames: midgroundTrees, speed: 1.0 },
    { frames: foregroundLogs, speed: 1.5 }
  ]}
/>
```

## 📝 Generator Templates

### Creating Custom Generators
```typescript
export function generateCustomFrames(
  width: number,
  height: number,
  frameCount: number,
  options?: CustomOptions
): string[] {
  const frames: string[] = []
  
  for (let f = 0; f < frameCount; f++) {
    const time = (f / frameCount) * Math.PI * 2
    const grid = createGrid(width, height)
    
    // Your generation logic here
    // Use time for animation
    // Fill grid with ASCII characters
    
    frames.push(gridToString(grid))
  }
  
  return frames
}
```

## 🎯 Best Practices

1. **Use appropriate frame rates**: 12-24 fps for smooth animations
2. **Optimize character density**: Balance detail with performance
3. **Consider mobile**: Reduce size/complexity on small screens
4. **Cache static frames**: Don't regenerate unchanged animations
5. **Use CSS for colors**: Keep frames as pure ASCII text
6. **Test visibility**: Ensure animations pause when hidden

## 🐛 Troubleshooting

### Animation stuttering
- Lower FPS or reduce frame complexity
- Enable `visibilityOptimized`
- Use `requestAnimationFrame` for smooth rendering

### Memory issues
- Limit frame count (30-60 is usually enough)
- Use smaller dimensions on mobile
- Clear cached frames when unmounting

### Character rendering
- Ensure monospace font is loaded
- Set appropriate `line-height` and `letter-spacing`
- Use `white-space: pre` to preserve formatting

## 🚦 Development Workflow

```bash
# Install dependencies
bun install

# Type checking
bun run typecheck

# Linting
bun run lint

# Format code
bun run lint:fix
```

Remember: ASCII art is about creating beauty from simplicity. Keep animations subtle, meaningful, and performant. The forest doesn't need to be photorealistic - it needs to evoke the feeling of a forest.