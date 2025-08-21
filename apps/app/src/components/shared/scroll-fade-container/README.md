# Scroll Fade Container Components

This directory contains two different scroll fade container implementations for different use cases:

## ScrollFadeContainer vs RelativeScrollFadeContainer

### When to use ScrollFadeContainer
Use `ScrollFadeContainer` for full-page scroll areas where the fade gradients should be positioned relative to the viewport:
- Main content areas
- Full-height sidebars (like the main app sidebar)
- Chat message containers
- Any scrollable area that spans most of the viewport

**Key characteristic**: Uses `fixed` positioning for fade overlays

### When to use RelativeScrollFadeContainer
Use `RelativeScrollFadeContainer` for contained scroll areas where the fade gradients should be positioned relative to the container:
- Modal content areas
- Dropdown menus
- Nested scrollable regions
- Popover content
- Any scrollable area inside a positioned container

**Key characteristic**: Uses `absolute` positioning for fade overlays

## Usage Examples

### ScrollFadeContainer (Full Page)
```tsx
// Sidebar with viewport-relative fades
<ScrollFadeContainer
  showTop
  showBottom
  fadeSize={24}
  fadeColor="var(--sidebar)"
  className="flex-grow"
  scrollableClassName="overflow-y-auto"
>
  <ProjectsSection />
  <ChatsSection />
</ScrollFadeContainer>
```

### RelativeScrollFadeContainer (Contained)
```tsx
// Modal with container-relative fades
<div className="modal-content">
  <RelativeScrollFadeContainer className="flex-1">
    <div className="p-4">
      {models.map(model => (
        <ModelItem key={model.id} {...model} />
      ))}
    </div>
  </RelativeScrollFadeContainer>
</div>
```

### StaticRelativeScrollFade (Always Visible)
```tsx
// Dropdown with always-visible fades
<StaticRelativeScrollFade className="h-64" fadeColor="var(--popover)">
  <div className="p-2">
    {options.map(option => (
      <Option key={option.id} {...option} />
    ))}
  </div>
</StaticRelativeScrollFade>
```

## Migration Guide

### From Manual Gradients
```tsx
// Before
<div className="relative overflow-hidden flex-1">
  <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
  <div className="overflow-y-auto h-full p-4">
    {content}
  </div>
  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
</div>

// After
<RelativeScrollFadeContainer className="flex-1">
  <div className="p-4">
    {content}
  </div>
</RelativeScrollFadeContainer>
```

### From ScrollFadeContainer in Modals
```tsx
// Before (broken in modals)
<ScrollFadeContainer showTop showBottom className="flex-1">
  {content}
</ScrollFadeContainer>

// After (works correctly)
<RelativeScrollFadeContainer className="flex-1">
  {content}
</RelativeScrollFadeContainer>
```

## CSS Variables
Both components respect the following CSS variables for theming:
- `--background`: Default fade color for main content
- `--sidebar`: Fade color for sidebar areas
- `--popover`: Fade color for popovers and dropdowns
- `--card`: Fade color for card components

## Performance Considerations
- `ScrollFadeContainer`: Uses ResizeObserver and scroll listeners with proper cleanup
- `RelativeScrollFadeContainer`: Lighter weight with simpler scroll detection
- `StaticRelativeScrollFade`: Most performant (no listeners), but always shows gradients