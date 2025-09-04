# Claude Guide to @repo/design

This package contains the shared design system and UI components for Arbor.

## 📦 Package Overview

**@repo/design** provides:
- Reusable React components
- shadcn/ui component library
- Tailwind configuration
- Design tokens and utilities

## 🎨 Design Philosophy

Arbor follows an engineering-first aesthetic:
- **Minimalist**: Clean, focused interfaces
- **Monochrome**: Black, white, and grays
- **Typography**: Single typeface (system font)
- **Lowercase**: Everything except acronyms
- **Functional**: Form follows function

## 🧩 Component Structure

```
components/
├── ui/                 # shadcn/ui base components
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
├── layout/             # Layout components
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── container.tsx
├── chat/               # Chat-specific components
│   ├── message.tsx
│   ├── input.tsx
│   └── toolbar.tsx
└── shared/             # Shared utilities
    ├── icons.tsx
    ├── loading.tsx
    └── error.tsx
```

## 🔧 Component Patterns

### Base Component Structure
```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

### Using Components
```typescript
import { Button } from '@repo/design/components/ui/button';
import { Card } from '@repo/design/components/ui/card';

export function MyComponent() {
  return (
    <Card>
      <Button variant="outline" size="sm">
        click me
      </Button>
    </Card>
  );
}
```

## 🎯 Component Guidelines

### 1. Keep It Simple
- Single responsibility
- Minimal props
- Clear naming

### 2. Composition Over Configuration
```typescript
// Bad: Too many props
<Message 
  showAvatar 
  showTimestamp 
  showActions 
  variant="user" 
  color="blue"
/>

// Good: Compose components
<Message>
  <MessageAvatar />
  <MessageContent />
  <MessageTimestamp />
</Message>
```

### 3. Accessibility First
- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

### 4. Performance
- Use React.memo sparingly
- Avoid inline functions in renders
- Lazy load heavy components

## 🎨 Styling Patterns

### Tailwind Classes
```typescript
// Use cn() for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  isDisabled && 'disabled-classes'
)} />
```

### Design Tokens
```css
/* Defined in tailwind.config.js */
--background: 0 0% 100%;
--foreground: 0 0% 3.9%;
--muted: 0 0% 96.1%;
--muted-foreground: 0 0% 45.1%;
--border: 0 0% 89.8%;
--input: 0 0% 89.8%;
```

### Responsive Design
```typescript
<div className="
  w-full 
  md:w-1/2 
  lg:w-1/3
  p-4 
  md:p-6 
  lg:p-8
">
```

## 📝 Adding New Components

1. Create in appropriate directory
2. Follow existing patterns
3. Export from barrel file
4. Add Storybook story (if applicable)
5. Document props with JSDoc

## 🚨 Common Pitfalls

1. **Don't hardcode colors** - Use CSS variables
2. **Avoid inline styles** - Use Tailwind classes
3. **Keep components pure** - No business logic
4. **Test accessibility** - Use keyboard/screen reader

## 🔍 Component Examples

### Chat Message
```typescript
<Message role="assistant" isStreaming>
  <MessageContent>
    {content}
  </MessageContent>
  {toolCalls && <MessageToolCalls tools={toolCalls} />}
</Message>
```

### Loading States
```typescript
<Card>
  <Skeleton className="h-4 w-[200px]" />
  <Skeleton className="h-4 w-[150px] mt-2" />
</Card>
```

Remember: Components should be reusable, accessible, and follow Arbor's minimalist design philosophy. When in doubt, keep it simple.

## ⚡ Motion Checklist (Linear-style)

- Timing policy: 0ms in / 150ms out for general UI; menu-like items are 0ms/0ms.
- Use utilities from `packages/design/styles/transitions.css`:
  - `hover-transition`, `hover-bg`, `hover-transform`, `hover-all` (general UI)
  - `menu-item`, `hover-instant` (menus, command palettes)
- Animate cheap properties only: `transform`, `opacity` (optional subtle `filter`).
- Reduced motion: support `prefers-reduced-motion` with opacity-only or instant paths.
- Dropdowns with Radix: keep `Content` mounted (`forceMount`), animate a nested Motion panel; set `transform-origin` to Radix var for origin-true motion.
- `will-change`: set during motion; revert to `auto` afterwards to avoid long-lived costs.
- Reference: `docs/linear-ux.md` for patterns and code snippets.
