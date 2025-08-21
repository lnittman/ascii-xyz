# Claude Guide for Arbor Apple Development

This guide helps AI assistants understand and work with the Arbor iOS/macOS codebase.

## Quick Start

The Arbor Apple client is a native iOS app built with SwiftUI that provides mobile access to the Arbor AI platform.

### Key Files to Understand
1. **App Entry**: `webs_iosApp.swift` - Main app with Clerk auth
2. **Auth**: `ClerkManager.swift` - Authentication state management  
3. **Chat**: `ChatViewModel.swift` - Message streaming and chat logic
4. **API**: `APIManager.swift` - Network requests and JWT handling
5. **Models**: `Models.swift` - Data structures matching API

## Current State (Important!)

⚠️ The project is in a transitional state with uncommitted changes:
- Two app entry points exist (webs_iosApp and arbor_iosApp)
- ContentView was recently simplified from 361 to 60 lines
- Some files are deleted (Info.plist, fonts README)
- New files added but not committed (Item.swift, arbor_iosApp.swift)

**Before making changes**: Understand which configuration should be used.

## Architecture Overview

```
Arbor-iOS/
├── App/
│   ├── webs_iosApp.swift      # Main app entry (with auth)
│   ├── arbor_iosApp.swift     # Alternative entry (SwiftData)
│   └── ContentView.swift      # Root view
├── Views/
│   ├── Auth/                  # Sign in, verification
│   ├── Chat/                  # Chat UI components
│   ├── Projects/              # Project management
│   └── Settings/              # User settings
├── ViewModels/
│   ├── ChatViewModel.swift    # Chat state management
│   ├── ChatsListViewModel.swift # Chat list/projects
│   └── ClerkManager.swift     # Auth state
├── Models/
│   └── Models.swift           # Data structures
├── Services/
│   ├── APIManager.swift       # Network layer
│   └── NetworkMonitor.swift   # Connectivity
└── Resources/
    └── Fonts/                 # Iosevka fonts
```

## Working with the Code

### Authentication Flow
```swift
// The app uses Clerk for auth
// Flow: SignInView -> VerificationView -> MainTabView
// JWT is extracted from Clerk's auth token
```

### API Integration
```swift
// Currently uses ngrok URLs - need to update for production
let baseURL = "https://relieved-lenient-anchovy.ngrok-free.app"
// JWT extracted from Clerk and used as Bearer token
```

### Chat Implementation
```swift
// Streaming responses handled via AsyncThrowingStream
// Agent modes: .main, .spin, .think
// Tool calling support built-in
```

## Common Tasks

### Adding a New Feature
1. Check if web app has the feature
2. Match the API endpoint structure
3. Follow existing ViewModel patterns
4. Update both iOS and future macOS targets

### Debugging Chat Issues
1. Check `ChatViewModel.sendMessage()`
2. Verify API response parsing in `APIManager`
3. Look for streaming errors in console
4. Check network state in `NetworkMonitor`

### Updating UI Components
1. Follow SwiftUI best practices
2. Use existing color scheme
3. Maintain Phosphor icons consistency
4. Test on both iPhone and iPad

## Feature Implementation Status

### ✅ Working Features
- Clerk authentication (Apple, Google, Email)
- Chat with streaming responses
- Project management
- Basic settings UI
- Theme support
- Network monitoring

### 🚧 Partially Working
- Settings (UI only, not wired up)
- Archive (placeholder)
- Agent mode selection

### ❌ Not Implemented
- File attachments
- Shared links
- Export functionality
- Workspace/daemon support
- Command menu (⌘K)
- Billing/subscription
- macOS support

## API Endpoints Used

```
POST /api/auth/sign-in
POST /api/auth/verify
GET  /api/auth/me
GET  /api/projects
POST /api/projects
GET  /api/chats
POST /api/chats
POST /api/chats/[id]/messages
```

## Development Considerations

### iOS Version
- Deployment target: iOS 18.1 (very new!)
- Consider lowering to iOS 17.0 for wider support

### Dependencies
- Clerk iOS SDK
- PhosphorSwift
- No package manager (all manual)

### Performance
- Large chat histories need optimization
- No message virtualization yet
- Memory usage needs monitoring

## Testing Approach

Currently no tests! When adding:
1. Unit test ViewModels first
2. Integration test API calls
3. UI test critical auth flows
4. Snapshot test complex views

## Deployment Checklist

Before deploying:
- [ ] Update API URLs from ngrok
- [ ] Add proper Info.plist
- [ ] Configure app capabilities
- [ ] Set up push notifications
- [ ] Add analytics
- [ ] Configure crash reporting

## Common Issues and Solutions

### "Cannot find ClerkManager"
- Clerk SDK may need manual integration
- Check if import statements are correct

### Chat messages not loading
- Verify JWT extraction in APIManager
- Check if chat ID is valid
- Look for API errors in console

### UI not updating
- Check @Published properties
- Verify ObservableObject conformance
- Look for missing @StateObject

## Next Steps Priority

1. **Resolve app entry point confusion**
2. **Implement file attachments** (critical for parity)
3. **Complete settings functionality**
4. **Add macOS target**
5. **Update documentation**

## Questions to Clarify

When working on this codebase, clarify:
1. Should we use `webs_iosApp` or `arbor_iosApp`?
2. Is iOS 18.1 requirement intentional?
3. Are ngrok URLs temporary or misconfigured?
4. Is SwiftData integration wanted?
5. Should we add package management (SPM)?

Remember: This is a native iOS app that should feel native while maintaining feature parity with the web application.