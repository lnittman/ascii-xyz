# Cursor Rules for @repo/ascii

## DO NOT ADD COMMENTS
No comments in code unless explicitly requested by the user.

## Package Structure
This is the ASCII art animation package. All code should be:
- TypeScript only
- React 19+ compatible
- Performant and optimized
- Beautiful and atmospheric

## File Organization
```
src/
├── engine/       # Core animation engine
├── generators/   # ASCII art generators
├── components/   # React components
├── hooks/        # Custom React hooks
├── presets/      # Pre-built animations
└── data/         # Static ASCII data
```

## Code Patterns

### Generators
```typescript
export function generateXFrames(
  width: number,
  height: number,
  frameCount: number,
  options?: XOptions
): string[] {
  const frames: string[] = []
  for (let f = 0; f < frameCount; f++) {
    // Generate frame
  }
  return frames
}
```

### Components
```typescript
export function XAnimation({
  width = 80,
  height = 30,
  ...props
}: XAnimationProps) {
  const frames = useMemo(
    () => generateXFrames(width, height, 30),
    [width, height]
  )
  return <AsciiEngine frames={frames} {...props} />
}
```

### Hooks
```typescript
export function useX(options: XOptions) {
  const [state, setState] = useState()
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    }
  }, [])
  return state
}
```

## ASCII Art Guidelines

### Character Selection
- Use visually distinct characters
- Maintain consistent density
- Consider both light and dark themes
- Test character rendering in target fonts

### Animation Principles
- 12-24 fps for smooth motion
- 30-60 frames per animation cycle
- Subtle movements over dramatic ones
- Natural, organic timing

### Performance Rules
- Pause animations when off-screen
- Cache generated frames
- Limit active animations
- Use CSS for colors/shadows

## Forest/Logs Specific

### Trees
```
    ▲          ◯         ╱╲
   ▲▲▲        ◉◉◉       ╱╱╲╲
  ▲▲▲▲▲      ●●●●●     ╱╱╱╲╲╲
    │          ║         │
```

### Logs
```
═══════════  ━━━━━━━━━  ▬▬▬▬▬▬▬
█████████    ▓▓▓▓▓▓▓    ░░░░░░░
```

## Testing
- Visual inspection in Storybook
- Performance profiling in DevTools
- Memory leak detection
- Cross-browser compatibility

## Common Issues

### Stuttering
- Lower FPS
- Reduce complexity
- Enable visibility optimization

### Memory Leaks
- Clear intervals on unmount
- Remove event listeners
- Dispose of cached data

### Rendering Issues
- Check font loading
- Verify monospace font
- Set proper line-height

## Integration
When integrating with apps:
1. Import from @repo/ascii
2. Use appropriate preset or component
3. Apply consistent theming
4. Test performance impact

Remember: Create atmospheric ASCII art that enhances the experience without sacrificing performance.