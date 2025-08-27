# ASCII Art Generator Platform

AI-powered ASCII art generation platform with collaborative features and persistence.

## <� Project Overview

ASCII is a modern web platform for creating, saving, and sharing AI-generated ASCII artwork. Users can prompt an AI to generate ASCII art animations from text descriptions, save their creations, and build a personal gallery.

## <� Architecture

### Applications

- **apps/app**: Next.js 15 web application (Vercel)

### Core Packages

- **@repo/backend**: Convex backend with AI-powered ASCII generation
- **@repo/auth**: Clerk authentication with elements
- **@repo/design**: Linear-inspired UI components

## <� Core Features

### ASCII Generation

- Text prompt to ASCII art conversion via AI
- Frame-based animation system (data.json format)
- Multiple animation styles and presets
- Real-time preview and editing

### User Experience

- Gallery of saved ASCII creations
- Public/private artwork toggle
- Download as JSON or text file
- Share via unique URLs

### Technical Features

- BYOK (Bring Your Own Key) AI model support
- Persistent storage in Neon database
- Real-time updates via oRPC subscriptions
- Progressive enhancement with server components

## =� Data Structure

### ASCII Artwork Schema

```typescript
interface AsciiArtwork {
  id: string;
  userId: string;
  prompt: string;
  frames: string[]; // JSON array of ASCII frames
  metadata: {
    width: number;
    height: number;
    fps: number;
    generator: string;
    model: string;
  };
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
}
```

### Animation Format

ASCII animations are stored as JSON arrays where each element is a string representing one frame of ASCII art. This allows for complex, multi-frame animations that can be played back at specified frame rates.

## =� Development Workflow

```bash
# Install dependencies
bun install

# Start development
bun dev

# Type checking
bun typecheck

# Build for production
bun build

# Deploy
bun deploy
```

## <� Design System

Following Linear's aesthetic:

- Clean, minimal interface
- Subtle animations and transitions
- Focus on content over chrome
- Monospace typography for ASCII display
- Dark mode by default with light mode option

## = Authentication Flow

Using Clerk Elements for seamless auth:

1. Sign up/in with email or OAuth
2. User profile with API key management
3. Gallery access tied to user account
4. Public sharing with anonymous viewing

## > AI Integration

Mastra-powered generation with:

- Multiple model support (OpenAI, Anthropic, etc.)
- Custom prompting for ASCII-specific output
- Style transfer and animation capabilities
- Batch generation for animation frames

## =� Database Schema

```sql
-- Users extended from Clerk
users: id, email, apiKeys, preferences

-- ASCII artworks
artworks: id, userId, prompt, frames, metadata, visibility

-- Collections
collections: id, userId, name, artworkIds

-- Shares
shares: id, artworkId, shareUrl, expiresAt
```

## < API Endpoints

### oRPC Procedures

- `artwork.create` - Generate new ASCII art
- `artwork.list` - Get user's artworks
- `artwork.get` - Get specific artwork
- `artwork.update` - Update visibility/metadata
- `artwork.delete` - Remove artwork
- `share.create` - Generate share URL
- `collection.manage` - CRUD for collections

## <� User Stories

1. **Creator**: "I want to generate ASCII art from text prompts"
2. **Collector**: "I want to save and organize my ASCII creations"
3. **Sharer**: "I want to share my ASCII art with others"
4. **Developer**: "I want to embed ASCII animations in my projects"

## = State Management

- **UI State**: Jotai atoms for local state
- **Server State**: SWR for data fetching
- **Form State**: React Hook Form
- **Animation State**: Custom hooks in @repo/ascii

## =� Deployment

- **Web App**: Vercel (apps/app)
- **Backend**: Convex (packages/backend)
- **Database**: Neon PostgreSQL (user data)
- **Storage**: Convex for ASCII artworks

## =� Environment Variables

```env
# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=

# AI
OPENAI_API_KEY=

# Convex
NEXT_PUBLIC_CONVEX_URL=
```

## <� Interactive Features

- Live preview during generation
- Frame-by-frame editor
- Animation timeline scrubber
- Export to various formats
- Embed code generator

Remember: This is about democratizing ASCII art creation through AI, making it accessible and fun for everyone while maintaining the nostalgic charm of text-based graphics.

