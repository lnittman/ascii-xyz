# UI-First Development Guide

## Overview

Kumori follows a UI-first development approach, building the complete user interface with mock data before integrating with the backend API. This ensures a smooth, polished user experience and allows for rapid iteration on design and interactions.

## Development Philosophy

### Why UI-First?

1. **Validate UX Early**: Test user flows and interactions without waiting for backend
2. **Rapid Iteration**: Make design changes quickly without API constraints
3. **Parallel Development**: Frontend and backend teams can work simultaneously
4. **Better Mocking**: Define API contracts based on actual UI needs
5. **Smoother Integration**: Replace mock services with real ones seamlessly

## Screen Architecture

### Core Screens

```
App Navigation Flow:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Launch    │────▶│    Login    │────▶│    Home     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┴───────┐
                    │                                  │
                    ▼                                  ▼
            ┌─────────────┐                   ┌─────────────┐
            │    Chat     │                   │  Settings   │
            │   (MVP)     │                   │   Sheet     │
            └─────────────┘                   └─────────────┘
```

### View Organization

```
kumori-ios/
├── Views/
│   ├── Login/
│   │   ├── LoginView.swift
│   │   ├── EmailVerificationView.swift
│   │   └── Components/
│   │       ├── LoginButton.swift
│   │       └── VerificationCodeInput.swift
│   ├── Home/
│   │   ├── HomeView.swift
│   │   ├── Components/
│   │   │   ├── DailyGoalCard.swift
│   │   │   ├── StreakWidget.swift
│   │   │   └── QuickActionButtons.swift
│   │   └── Widgets/
│   │       └── TranslationHistoryWidget.swift
│   ├── Chat/
│   │   ├── ChatView.swift
│   │   ├── MessageBubble.swift
│   │   ├── MessageInput.swift
│   │   ├── TypingIndicator.swift
│   │   └── TranslationActions.swift
│   └── Settings/
│       ├── SettingsSheet.swift
│       ├── PreferencesView.swift
│       ├── AccountView.swift
│       └── AboutView.swift
├── ViewModels/
│   ├── AuthViewModel.swift
│   ├── HomeViewModel.swift
│   ├── ChatViewModel.swift
│   └── SettingsViewModel.swift
├── Models/
│   ├── User.swift
│   ├── Message.swift
│   ├── Translation.swift
│   └── UserPreferences.swift
└── Services/
    ├── Mock/
    │   ├── MockAuthService.swift
    │   ├── MockTranslationService.swift
    │   └── MockStorageService.swift
    └── Protocol/
        ├── AuthServiceProtocol.swift
        ├── TranslationServiceProtocol.swift
        └── StorageServiceProtocol.swift
```

## Mock Data Implementation

### Service Protocols

Define protocols that both mock and real services implement:

```swift
// TranslationServiceProtocol.swift
protocol TranslationServiceProtocol {
    func translate(_ text: String) async throws -> Translation
    func saveTranslation(_ translation: Translation) async throws
    func getHistory() async throws -> [Translation]
}

// MockTranslationService.swift
class MockTranslationService: TranslationServiceProtocol {
    func translate(_ text: String) async throws -> Translation {
        // Simulate network delay
        try await Task.sleep(nanoseconds: 1_000_000_000)
        
        // Return mock translation
        return Translation(
            id: UUID(),
            sourceText: text,
            translatedText: mockTranslations[text] ?? "こんにちは",
            romaji: "konnichiwa",
            context: TranslationContext(
                grammarNotes: ["Mock grammar note"],
                culturalNotes: ["Mock cultural note"],
                difficulty: .beginner
            )
        )
    }
}
```

### ViewModel Pattern

ViewModels use protocol-based services for easy swapping:

```swift
@MainActor
class ChatViewModel: ObservableObject {
    @Published var messages: [Message] = []
    @Published var isTranslating = false
    
    private let translationService: TranslationServiceProtocol
    
    init(translationService: TranslationServiceProtocol = MockTranslationService()) {
        self.translationService = translationService
    }
    
    func sendMessage(_ text: String) async {
        // Add user message
        let userMessage = Message(text: text, isUser: true)
        messages.append(userMessage)
        
        // Get translation
        isTranslating = true
        do {
            let translation = try await translationService.translate(text)
            let aiMessage = Message(
                text: translation.translatedText,
                translation: translation,
                isUser: false
            )
            messages.append(aiMessage)
        } catch {
            // Handle error
        }
        isTranslating = false
    }
}
```

## Design System Integration

### Using @Design Package

Every view should leverage the Design package components:

```swift
import SwiftUI
import Design

struct ChatView: View {
    @StateObject private var viewModel = ChatViewModel()
    
    var body: some View {
        KumoriContainer {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: KumoriSpacing.md) {
                        ForEach(viewModel.messages) { message in
                            MessageBubble(message: message)
                                .id(message.id)
                                .transition(.asymmetric(
                                    insertion: .push(from: .bottom),
                                    removal: .opacity
                                ))
                        }
                        
                        if viewModel.isTranslating {
                            TypingIndicator()
                                .id("typing")
                        }
                    }
                    .padding(.horizontal, KumoriSpacing.md)
                }
                .onChange(of: viewModel.messages.count) { _ in
                    withAnimation {
                        proxy.scrollTo("typing", anchor: .bottom)
                    }
                }
            }
            .safeAreaInset(edge: .bottom) {
                MessageInput()
                    .padding(.horizontal, KumoriSpacing.md)
                    .padding(.bottom, KumoriSpacing.sm)
            }
        }
        .navigationTitle("Chat")
        .kumoriNavigationStyle()
    }
}
```

### Component Patterns

```swift
// Reusable message bubble using Design system
struct MessageBubble: View {
    let message: Message
    
    var body: some View {
        HStack {
            if message.isUser { Spacer(minLength: 60) }
            
            VStack(alignment: message.isUser ? .trailing : .leading, spacing: KumoriSpacing.xs) {
                Text(message.text)
                    .font(.kumoriBody)
                    .foregroundColor(message.isUser ? .white : .kumoriPrimary)
                    .padding(.horizontal, KumoriSpacing.md)
                    .padding(.vertical, KumoriSpacing.sm)
                    .background(
                        RoundedRectangle(cornerRadius: 18)
                            .fill(message.isUser ? Color.kumoriAccent : Color.kumoriQuaternary)
                    )
                
                if let translation = message.translation {
                    HStack(spacing: KumoriSpacing.sm) {
                        KumoriButton(title: "Save", style: .ghost, size: .small) {
                            // Save action
                        }
                        KumoriButton(title: "Copy", style: .ghost, size: .small) {
                            // Copy action
                        }
                    }
                }
            }
            
            if !message.isUser { Spacer(minLength: 60) }
        }
        .animation(KumoriAnimation.smooth, value: message.id)
    }
}
```

## Navigation Architecture

### NavigationStack Setup

```swift
@main
struct KumoriApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    
    var body: some Scene {
        WindowGroup {
            NavigationStack {
                if authViewModel.isAuthenticated {
                    HomeView()
                } else {
                    LoginView()
                }
            }
            .environmentObject(authViewModel)
            .kumoriTheme()
        }
    }
}
```

### Sheet Presentations

```swift
struct HomeView: View {
    @State private var showSettings = false
    
    var body: some View {
        KumoriContainer {
            // Home content
        }
        .navigationTitle("Kumori")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    showSettings = true
                } label: {
                    Image(systemName: "gearshape")
                        .foregroundColor(.kumoriPrimary)
                }
            }
        }
        .sheet(isPresented: $showSettings) {
            SettingsSheet()
        }
    }
}
```

## Animation Guidelines

### Smooth Transitions

```swift
// Message appearance
.transition(.asymmetric(
    insertion: .push(from: .bottom).combined(with: .opacity),
    removal: .scale.combined(with: .opacity)
))
.animation(KumoriAnimation.smooth, value: messages.count)

// Typing indicator
.transition(.scale.combined(with: .opacity))
.animation(KumoriAnimation.bounce, value: isTyping)

// Navigation transitions
.navigationTransition(.slide)
```

### Micro-interactions

```swift
// Button press feedback
.scaleEffect(isPressed ? 0.95 : 1.0)
.animation(KumoriAnimation.quick, value: isPressed)

// Haptic feedback
.onTapGesture {
    HapticManager.impact(.light)
    action()
}
```

## Testing Mock Scenarios

### Error States

```swift
class MockTranslationService: TranslationServiceProtocol {
    var shouldFail = false
    
    func translate(_ text: String) async throws -> Translation {
        if shouldFail {
            throw APIError.networkError
        }
        // Normal mock response
    }
}
```

### Loading States

```swift
// Simulate various network speeds
enum NetworkSpeed {
    case instant
    case fast // 0.5s
    case normal // 1s
    case slow // 3s
    
    var delay: UInt64 {
        switch self {
        case .instant: return 0
        case .fast: return 500_000_000
        case .normal: return 1_000_000_000
        case .slow: return 3_000_000_000
        }
    }
}
```

## Transition to Real API

When ready to integrate:

1. **Keep the same protocols**: Real services implement same protocols
2. **Dependency injection**: Pass real services instead of mocks
3. **Environment-based**: Use mock in preview/debug, real in production

```swift
// In App or DI container
let translationService: TranslationServiceProtocol = {
    #if DEBUG
    return MockTranslationService()
    #else
    return RealTranslationService(apiClient: APIClient.shared)
    #endif
}()
```

---

*This UI-first approach ensures we deliver a polished, user-tested experience before connecting to the backend.* 