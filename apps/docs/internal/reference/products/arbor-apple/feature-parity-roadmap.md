# Arbor Apple Feature Parity Roadmap

This document outlines the path to achieve feature parity between the Arbor iOS/macOS client and the web application.

## Current Feature Gap Analysis

### ✅ Already Implemented
- **Core Chat**: Basic chat functionality with streaming
- **Authentication**: Full Clerk integration 
- **Projects**: Basic project management
- **UI Foundation**: Theme support, custom fonts, navigation

### 🚧 Partially Implemented
- **Settings**: UI exists but not fully functional
- **Agent Modes**: Backend support but limited UI
- **Error Handling**: Basic implementation needs expansion

### ❌ Not Implemented
- **File Attachments**: Complete attachment system
- **Workspace/Daemon**: Local development features
- **Export/Import**: Chat and output export
- **Search**: Global command menu
- **Sharing**: Public link generation
- **Billing**: Subscription management

## Phase 1: Core Feature Completion (Week 1-2)

### File Attachment System
1. Implement `DocumentPicker` for file selection
2. Add attachment preview UI in chat
3. Create upload progress indicators
4. Integrate with backend attachment API
5. Support image, PDF, and text files

### Settings Implementation
1. Complete profile settings tab
2. Implement appearance customization
3. Add model selection and configuration
4. Create data management section
5. Wire up all settings to UserDefaults/API

### Message Enhancement
1. Add message editing capability
2. Implement message deletion
3. Create message search within chat
4. Add message timestamps and metadata
5. Implement message reactions/feedback

## Phase 2: Platform Expansion (Week 3-4)

### macOS Support
1. Add macOS target to Xcode project
2. Adapt navigation for macOS idioms
3. Implement keyboard shortcuts
4. Create menu bar commands
5. Optimize for larger screens

### iPad Optimization
1. Implement split view for chat list/detail
2. Add keyboard shortcuts for iPad
3. Optimize layout for larger screens
4. Support drag and drop
5. Enable multi-window support

## Phase 3: Advanced Features (Week 5-6)

### Workspace Integration
1. Design daemon communication protocol
2. Implement local file system access
3. Create workspace project browser
4. Add terminal/output viewing
5. Enable code execution features

### Export and Sharing
1. Implement chat export (markdown, PDF)
2. Create shareable public links
3. Add social sharing options
4. Enable chat templates
5. Build import functionality

### Search and Navigation
1. Implement global command menu (⌘K)
2. Add fuzzy search for chats/messages
3. Create quick actions
4. Implement jump to chat
5. Add recent items

## Phase 4: Production Ready (Week 7-8)

### Performance and Polish
1. Implement message virtualization
2. Add offline message queue
3. Create smooth animations
4. Optimize memory usage
5. Add loading states

### Testing and Quality
1. Write unit tests for ViewModels
2. Create UI tests for critical flows
3. Implement crash reporting
4. Add analytics
5. Performance profiling

### Production Configuration
1. Replace ngrok URLs with production
2. Implement proper config management
3. Add environment switching
4. Create build configurations
5. Setup CI/CD pipeline

## Technical Improvements

### Architecture Refactoring
```swift
// Current: Monolithic ViewModels
class ChatViewModel: ObservableObject {
    // Everything in one place
}

// Target: Feature modules
protocol ChatServiceProtocol { }
protocol MessageRepositoryProtocol { }
protocol AttachmentManagerProtocol { }
```

### Dependency Injection
```swift
// Current: Direct instantiation
let api = APIManager()

// Target: Injected dependencies
@Injected var api: APIServiceProtocol
```

### Error Handling
```swift
// Current: Basic errors
catch { print(error) }

// Target: Typed errors with recovery
catch let error as APIError {
    errorHandler.handle(error, recovery: retryAction)
}
```

## Success Metrics

### Feature Parity Checklist
- [ ] All web features available on iOS
- [ ] macOS version launched
- [ ] Performance parity with web
- [ ] Offline capabilities
- [ ] Native platform features utilized

### Quality Metrics
- [ ] <1% crash rate
- [ ] <2s cold launch time
- [ ] 60fps scrolling performance
- [ ] <100MB memory usage
- [ ] 4.5+ App Store rating

## Risk Mitigation

### Technical Risks
- **SwiftData Stability**: Have CoreData fallback
- **Clerk SDK Limitations**: Build custom auth if needed
- **API Changes**: Version the API properly
- **iOS Version Requirements**: Consider iOS 17.0 minimum

### Timeline Risks
- **Scope Creep**: Stick to MVP for each phase
- **Platform Differences**: Share code where possible
- **Testing Time**: Automate early and often
- **App Review**: Prepare for Apple's requirements

## Conclusion

Achieving feature parity will take approximately 8 weeks with focused development. The phased approach ensures we deliver value incrementally while building toward a fully-featured native experience that leverages platform-specific capabilities.