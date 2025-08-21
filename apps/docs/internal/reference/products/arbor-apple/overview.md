# Arbor Apple Client Overview

The Arbor Apple client provides native iOS support for the Arbor platform, with planned macOS support.

## Current Status

**Platform Support:**
- ✅ iOS (iPhone and iPad) - iOS 18.1+
- ❌ macOS - Not yet implemented

**Architecture:**
- SwiftUI for all UI components
- Clerk authentication integration
- Custom API client with streaming support
- Network state monitoring for offline support

## Features

### Implemented ✅

**Authentication:**
- Apple Sign In
- Google OAuth  
- Email verification with 6-digit codes
- Session persistence
- Clerk JWT integration

**Chat System:**
- Real-time message streaming
- Multiple agent modes (main, spin, think)
- Tool calling support
- Chat history and navigation
- Error handling and retry logic

**Project Management:**
- Create and manage projects
- Organize chats by project
- Project switching

**UI/UX:**
- Light/dark theme support
- Custom Iosevka font
- Haptic feedback
- Toast notifications
- Keyboard management
- Offline state handling

### Not Yet Implemented ❌

**Core Features:**
- File attachments and uploads
- Shared links functionality
- Chat archiving
- Output panel for code execution
- Export functionality

**Settings:**
- Profile management
- Appearance customization
- Model configuration
- Billing/subscription

**Advanced Features:**
- Workspace/daemon support
- GitHub integration
- Custom instructions/rules
- Global search/command menu

## Technical Details

**API Integration:**
- Currently uses ngrok URLs for development
- JWT extraction from Clerk cookies
- Full REST API client implementation
- WebSocket-style streaming for AI responses

**State Management:**
- ObservableObject view models
- Published properties for reactive UI
- Network monitoring with NWPathMonitor

## Development Status

The project is currently in a transitional state with two app entry points:
1. `webs_iosApp.swift` - Full featured app with Clerk auth
2. `arbor_iosApp.swift` - Minimal SwiftData experiment

The main chat view has been simplified, suggesting active refactoring.

## Next Steps

1. Resolve dual app configuration
2. Implement file attachment support
3. Complete settings implementation
4. Add macOS target and adapt UI
5. Update API URLs from ngrok to production
6. Add comprehensive documentation