# AI Agent Instructions for @repo/ascii

## Package Purpose
This package provides beautiful, performant ASCII art animations for web applications, with a focus on nature-inspired themes like forests, trees, and logs.

## Core Responsibilities

### 1. ASCII Art Generation
- Create procedural ASCII animations
- Generate frame sequences for smooth animations
- Optimize character selection for visual appeal
- Balance detail with performance

### 2. Animation Engine
- Manage frame rendering and timing
- Handle play/pause/reset controls
- Optimize for visibility (pause when off-screen)
- Support various animation modes (loop, reverse, ping-pong)

### 3. React Integration
- Provide React components for easy usage
- Create custom hooks for animation control
- Ensure proper cleanup on unmount
- Support server-side rendering where appropriate

## Technical Guidelines

### Performance
- Keep frame rates between 12-24 fps
- Limit frame count to 30-60 for most animations
- Use visibility observers to pause off-screen animations
- Cache generated frames when possible

### Code Style
- NO COMMENTS in code
- Use TypeScript for all files
- Export types alongside implementations
- Follow existing patterns in the codebase

### ASCII Character Selection
```typescript
// Good: Varied, visually interesting
const trees = ['▲', '△', '╱╲', '◣◢']

// Bad: Too similar, lacks variety  
const trees = ['|', 'l', 'I', '1']
```

### Animation Principles
1. **Subtlety**: Small movements are more realistic
2. **Rhythm**: Natural timing, not mechanical
3. **Layers**: Combine multiple elements for depth
4. **Interaction**: Respond to user input when appropriate

## Common Tasks

### Adding a New Generator
1. Create generator function in `src/generators/`
2. Export from `src/generators/index.ts`
3. Create preset in `src/presets/`
4. Add usage example to CLAUDE.md

### Creating a Component
1. Build component in `src/components/`
2. Use the ASCII engine for rendering
3. Export from `src/components/index.tsx`
4. Add TypeScript props interface

### Implementing a Hook
1. Create hook in `src/hooks/`
2. Ensure proper cleanup in useEffect
3. Export from `src/hooks/index.ts`
4. Document usage pattern

## Forest/Logs Specific Instructions

### Tree Generation
- Vary tree heights for natural look
- Add subtle wind sway animation
- Include ground cover and undergrowth
- Use perspective for depth

### Logs Animation
- Show realistic stacking patterns
- Add floating motion for water scenes
- Include moss and weathering details
- Rotate logs over time for movement

### Character Palette
```typescript
const FOREST = {
  pine: '▲△◣◢╱╲',
  oak: '◯◉●○⬤',
  trunk: '│║|╎┃',
  branches: '╱╲/\\╳',
  leaves: '▓▒░⣿⣷',
  ground: '_▁▂─═',
  logs: '═━─█▬',
  moss: '·∘°•◦'
}
```

## Error Handling

### Generator Errors
- Return empty frames array on invalid input
- Clamp dimensions to reasonable limits
- Provide fallback for missing options

### Animation Errors
- Handle missing frames gracefully
- Stop animation on frame array change
- Clear intervals on component unmount

## Testing Approach

### Visual Testing
- Create Storybook stories for components
- Test at various sizes and frame rates
- Verify on different backgrounds

### Performance Testing
- Measure frame drop with DevTools
- Test with multiple animations running
- Verify memory cleanup on unmount

## Integration Points

### With logs-xyz
- Replace ArborAsciiLogo component
- Add to signin/signup pages
- Use in loading states
- Background for hero sections

### With Other Packages
- Import from @repo/design for utilities
- Use consistent theming approach
- Follow monorepo conventions

## Optimization Strategies

1. **Lazy Generation**: Generate frames on-demand
2. **Frame Pooling**: Reuse frame strings
3. **Character Maps**: Pre-compute character positions
4. **RAF Timing**: Use requestAnimationFrame
5. **CSS Animations**: Offload simple transforms to CSS

Remember: The goal is to create atmospheric, beautiful ASCII animations that enhance the user experience without impacting performance.