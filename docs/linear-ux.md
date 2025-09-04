# Linear UX in ascii-xyz

## Purpose
- Establish a clean, minimal, “Linear-like” interaction style.
- Keep motion performant and accessible by default; add polish only where it adds clarity.
- Encode choices as Tailwind v4 utilities + a few motion tokens so the whole app stays consistent.

## Core Principles
- Minimal chrome: borders over shadows; subtle contrast; generous whitespace.
- Predictable motion: small offsets, origin-aware transforms, tight durations.
- Performance first: opacity/transform only; will-change only during motion; early network preconnects.
- Accessibility: respect `prefers-reduced-motion`; reduce simultaneous, multi-axis moves.

## Timing Policy
- Menu-like items (lists, dropdown rows, command palette options): 0ms in, 0ms out.
- General UI hover/focus: 0ms in, 150ms out.
- Panels/menus that “grow from trigger”: short open (≈160ms), slightly faster close (≈140–150ms), origin-aware.
- Reduced motion: fall back to opacity-only or instant state changes.

These policies are implemented in `packages/design/styles/transitions.css` (already imported by `globals.css`).

Key utilities you can use immediately:
- `hover-transition`: 0ms in / 150ms out on hover/focus.
- `hover-bg`, `hover-transform`, `hover-all`: scoped variants of the above.
- `hover-instant` and `menu-item`: 0ms in / 0ms out for true menu-like interactions.
- `duration-out-150`: helper that snaps in instantly and eases out at 150ms.

Global tokens (from `transitions.css`):
- `--motion-in: 0ms`, `--motion-out: 150ms` and linear timing by default. Components can override with Tailwind arbitrary properties where needed.

## Tailwind v4 Best Practices Used Here
- Tokens via CSS variables and `@theme inline` in `packages/design/styles/globals.css`.
- Prefer Tailwind utilities to encode intent, fall back to arbitrary properties when needed:
  - Example: `[transition-duration:var(--motion-out)]` for a specific surface.
  - Example: `data-[state=open]:[transform-origin:var(--radix-dropdown-menu-content-transform-origin)]` to align with Radix.
- Keep transitions limited to the properties that change: `transition-none` or `transition-colors`, `transition-opacity`, `transition-transform`.

## Patterns We Apply

1) Menu Items (instant interactions)
- Where: User menu items, list rows inside dropdowns, command palettes.
- How: Use `menu-item` or `transition-none`. Keep hover/focus feedback via color only.
- Why: Menus should feel snappy with no perceived inertia.

Example:
```tsx
<button className="menu-item mx-1 px-2 py-1.5 rounded-[8px] hover:bg-muted/30">
  <Icon className="w-4 h-4 mr-2 text-muted-foreground" />
  <span className="flex-1 text-sm">Settings</span>
 </button>
```

2) Origin-aware Dropdown Panels (Linear-like)
- Where: Header user menu.
- How: Framer Motion variants with Radix transform origin; small x/y offset, tiny scale, subtle blur on open; mirror on close. `will-change` only during the animation.
- Files: `apps/app/src/components/shared/menu/user/user-menu.tsx`.

Snippet (abridged):
```tsx
<motion.div
  style={{ transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)' }}
  variants={{
    open:  { opacity: 1, x: 0, y: 0, scale: 1,   filter: 'blur(0px)',  transition: { duration: 0.16, ease: [0.2, 0.8, 0.2, 1] } },
    closed:{ opacity: 0, x: 2, y: -4, scale: 0.98, filter: 'blur(6px)', transition: { duration: 0.14, ease: [0.4, 0, 0.2, 1] } },
  }}
  animate={menuOpen ? 'open' : 'closed'}
  onAnimationStart={() => setWillChange('transform, opacity, filter')}
  onAnimationComplete={() => setWillChange('auto')}
/>
```

Reduced Motion:
```tsx
const prefersReduced = useReducedMotion();
// If reduced, use opacity-only and zero duration
variants={prefersReduced ? { open: { opacity: 1, transition: { duration: 0 } }, closed: { opacity: 0, transition: { duration: 0 } } } : variants }
```

3) Segmented Controls
- Minimal container with hairline border; small internal gap; tiles use consistent radius (8px) and uniform padding.
- Active tile: `bg-background text-foreground`; inactive: subtle `hover:bg-background/40`.
- Files: `apps/app/src/components/shared/layout/navigation-header.tsx`, `apps/app/src/app/(authenticated)/(main)/page.tsx`.

4) Search Field “esc” Keycap
- Shows only when there is text; right-aligned tile with radius matching container; zero animation.
- Esc clears the field, resets view to `my-art`, and blurs instantly.
- File: `apps/app/src/app/(authenticated)/(main)/page.tsx`.

## Implementation Checklist
- Use `hover-transition` for general interactive elements.
- Use `menu-item` or `transition-none` inside menus, dropdowns, and command surfaces.
- For Radix dropdowns, disable built-in animations on the container and animate an inner Motion panel. Keep the Content mounted (`forceMount`) so close plays in reverse.
- Apply `transformOrigin: var(--radix-*-transform-origin)` for origin-true motion.
- Limit animated properties to `opacity`, `transform`, and occasionally `filter`.
- Add `will-change` only during animation; reset to `auto` afterward.
- Respect `prefers-reduced-motion` with opacity-only or instant transitions.

## Performance Notes
- Preconnect critical domains (Clerk, Convex, PostHog) to reduce TTI and input delay.
- Avoid long-lived `will-change`; avoid animating layout-affecting properties.
- Keep motion cheap: translate/scale/opacity; minimal blur; short durations.

## References
- Linear: How we redesigned the Linear UI (Part II): https://linear.app/now/how-we-redesigned-the-linear-ui
- Linear Changelog (FTUE, keyboard, loading): https://linear.app/changelog/2019-05-09-first-time-user-experience
- Accessible Motion (timing, properties, reduced motion): https://stephaniewalter.design/blog/enhancing-user-experience-with-css-animations/

## Where This Lives
- Tokens and motion utilities: `packages/design/styles/globals.css`, `packages/design/styles/transitions.css`
- App-specific usage: see files referenced above in `apps/app/src/...`

