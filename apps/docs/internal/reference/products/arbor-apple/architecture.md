# Arbor Apple Architecture

## Overview

The Arbor Apple client is built using modern iOS development practices with SwiftUI and integrates with the Arbor platform's API services.

## Technology Stack

- **UI Framework**: SwiftUI (iOS 18.1+)
- **Authentication**: Clerk iOS SDK
- **Networking**: URLSession with async/await
- **State Management**: ObservableObject + @Published
- **Data Persistence**: SwiftData (experimental)
- **Icons**: Phosphor Icons Swift

## Architecture Patterns

### MVVM Pattern
The app follows Model-View-ViewModel architecture:
- **Models**: Data structures matching API responses
- **Views**: SwiftUI views for UI
- **ViewModels**: ObservableObject classes managing state

### Key Components

#### Authentication Flow
```
ClerkManager
├── SignInView
├── VerificationView
└── MainTabView (authenticated)
```

#### Chat System
```
ChatViewModel
├── Message streaming
├── Tool calling
└── Error handling

ChatsListViewModel
├── Chat CRUD operations
├── Project organization
└── Navigation state
```

#### API Layer
```
APIManager
├── JWT extraction from Clerk
├── Request building
├── Response parsing
└── Error handling
```

## Data Models

### Core Entities
- **User**: Clerk user with email, name, avatar
- **Project**: Container for chats with metadata
- **Chat**: Conversation with agent mode and messages
- **Message**: Content with role, tools, and metadata
- **SharedLink**: Public chat sharing (not implemented)

### Agent Modes
- `main`: Default conversational mode
- `spin`: Creative/experimental mode
- `think`: Analytical/reasoning mode

## Network Architecture

### API Integration
- Base URL configuration (currently ngrok)
- Bearer token authentication via Clerk JWT
- Structured error responses
- Streaming support for AI responses

### Endpoints
- `/api/auth/*` - Authentication flows
- `/api/projects/*` - Project management
- `/api/chats/*` - Chat operations
- `/api/chats/[id]/messages` - Message streaming

## State Management

### Global State
- `ClerkManager`: Authentication state
- `ChatsListViewModel`: Chat/project lists
- `NetworkMonitor`: Connectivity status

### Local State
- View-specific `@State` properties
- `@StateObject` for view lifecycle
- `@EnvironmentObject` for shared state

## UI Architecture

### Navigation
- `NavigationStack` for iOS 16+ navigation
- `NavigationLink` with value-based routing
- Tab-based main navigation

### Theming
- System-aware color scheme
- Custom color definitions
- SF Symbols and Phosphor icons
- Iosevka custom font

## Security

### Authentication
- Clerk handles OAuth flows
- JWT tokens for API access
- Secure session management
- Biometric authentication ready

### Data Protection
- HTTPS for all API calls
- No local credential storage
- Clerk SDK security features

## Performance Considerations

- Lazy loading for chat lists
- Debounced message sending
- Efficient scroll performance
- Background task management

## Platform Considerations

### iOS Specific
- Keyboard avoidance
- Safe area handling
- Haptic feedback
- Dynamic type support

### macOS (Planned)
- Window management
- Menu bar integration
- Keyboard shortcuts
- Multi-window support

## Known Limitations

1. **Hardcoded URLs**: API endpoints use development URLs
2. **Missing Tests**: No unit or UI tests present
3. **Limited Offline**: Basic offline detection only
4. **No Caching**: Messages fetched fresh each time
5. **Memory Management**: Large chats may cause issues

## Future Architecture Improvements

1. **Dependency Injection**: Proper DI container
2. **Modularization**: Split into feature modules
3. **Testing**: Comprehensive test coverage
4. **Caching Layer**: Offline message persistence
5. **Performance**: Message virtualization
6. **Error Recovery**: Robust retry mechanisms