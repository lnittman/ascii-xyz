# Package Documentation: design

## Overview
- **Purpose**: Provides shared React UI components, hooks, and styling utilities for Arbor-XYZ apps.
- **Type**: UI component library and design system.
- **Development Status**: Actively used and evolving with the app.
- **Responsible Team/Owner**: Frontend Design Team.

## API Documentation

### Primary Exports

#### `DesignSystemProvider`
- **Purpose**: Wraps the application with theme and auth providers plus UI utilities.
- **Usage Pattern**:
  ```tsx
  import { DesignSystemProvider } from '@repo/design';
  <DesignSystemProvider attribute="class">{children}</DesignSystemProvider>
  ```
- **Implementation Notes**: Combines ThemeProvider, AuthProvider, TooltipProvider, and Sonner toaster.

### Secondary Exports/Utilities
- Various UI components (buttons, dialogs, inputs) re-exported from subfolders in `components/`.

## Internal Architecture

### Core Modules
1. **components/**
   - Collection of UI elements built using Radix UI primitives and Tailwind CSS.
2. **hooks/**
   - Custom React hooks for UI interactions.
3. **providers/**
   - Theme and context providers used by apps.
4. **styles/**
   - Global styles, fonts, and Tailwind configuration.

### Implementation Patterns
- Leverages class-variance-authority for styling variants.
- Uses Next.js theme detection for dark/light mode.
- Organizes components by function with index exports for easy consumption.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| @radix-ui/react-dialog | ^1.1.11 | Accessible UI primitives | |
| lucide-react | ^0.503.0 | Icon library | |
| tailwindcss | ^4.1.4 | Styling framework | Dev dependency |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|---------|---------------|-------|
| @repo/auth | Provides AuthProvider | Ensures auth context |

## Consumption Patterns

### Current App Usage
- Extensively used by the `app` application for all UI components and layouts.
- Also imported by the email templates for consistent styling.

### Integration Best Practices
- Import individual components when possible to optimize bundle size.
- Wrap application with `DesignSystemProvider` at the top level.

## Testing Strategy
- Unit tests cover basic utility helpers. Run `pnpm --filter @repo/design test`.

## Known Issues & Limitations
- Large dependency set increases bundle size.
- Tailwind configuration may require maintenance with Next.js upgrades.

## Recent Developments
- Theme provider integrated with auth package for dark/light mode aware styling.

