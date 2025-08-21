# Troubleshooting Guide

This guide documents common issues encountered during Kumori iOS development and their solutions. Most of these issues have been resolved in the current codebase, but this guide serves as a reference for similar problems.

## Table of Contents
- [Clerk Authentication Issues](#clerk-authentication-issues)
- [Model and Type Conflicts](#model-and-type-conflicts)
- [UI and Navigation Issues](#ui-and-navigation-issues)
- [Compilation Errors](#compilation-errors)
- [Package Dependencies](#package-dependencies)
- [Runtime Issues](#runtime-issues)

## Clerk Authentication Issues

### Issue: Cannot access user from session
**Error**: `Value of type 'Session' has no member 'user'`

**Problem**: Trying to access user through `clerk.session?.user`

**Solution**:
```swift
// ❌ Wrong
let user = clerk.session?.user

// ✅ Correct
let user = clerk.user
```

The Clerk iOS SDK provides the user directly on the clerk instance, not through the session.

### Issue: Sign in/up not working
**Error**: Missing async/await or incorrect method signatures

**Solution**:
```swift
// ✅ Correct sign in implementation
func signIn(email: String, password: String) async throws {
    do {
        try await clerk.signIn(
            strategy: .identifier(email, password: password)
        )
        await updateAuthState()
    } catch {
        throw AuthError.signInFailed(error.localizedDescription)
    }
}

// ✅ Correct sign up implementation
func signUp(email: String, password: String) async throws {
    do {
        try await clerk.signUp(
            strategy: .standard(
                emailAddress: email,
                password: password
            )
        )
        await updateAuthState()
    } catch {
        throw AuthError.signUpFailed(error.localizedDescription)
    }
}
```

### Issue: Authentication state not persisting
**Problem**: User logged out after app restart

**Solution**: Load Clerk on app startup
```swift
// In App init or onAppear
.task {
    await authViewModel.loadClerk()
}

// In AuthViewModel
func loadClerk() async {
    await clerk.load()
    await updateAuthState()
}
```

## Model and Type Conflicts

### Issue: Duplicate model definitions
**Error**: `Ambiguous use of 'Translation'` or `Ambiguous use of 'TranslationContext'`

**Problem**: Multiple definitions of the same model in different files

**Solution**: 
1. Keep only one definition of each model
2. Remove duplicates from ViewModels or other files
3. Import models where needed

```swift
// ✅ Single source of truth in Models/Translation.swift
struct Translation: Identifiable, Codable {
    let id: UUID
    let sourceText: String
    let translatedText: String
    let romaji: String
    let context: TranslationContext?
}

// ❌ Don't redefine in ViewModels
// Remove any duplicate definitions
```

### Issue: Optional binding with non-optional types
**Error**: `Initializer for conditional binding must have Optional type, not 'String'`

**Problem**: Using `if let` with non-optional properties
```swift
// ❌ Wrong - romaji is not optional
if let romaji = translation.romaji {
    Text(romaji)
}

// ✅ Correct - direct access
Text(translation.romaji)
```

### Issue: TranslationRequest not Codable
**Error**: `Type 'TranslationRequest' does not conform to protocol 'Decodable'`

**Solution**: Add Codable conformance
```swift
struct TranslationRequest: Codable {
    let text: String
    let sourceLanguage: String
    let targetLanguage: String
}
```

## UI and Navigation Issues

### Issue: Double navigation dock/TabView
**Problem**: Two sets of navigation tabs appearing

**Solution**: Remove duplicate TabView from individual views
```swift
// ❌ Wrong - TabView in both RootView and HomeView
struct HomeView: View {
    var body: some View {
        TabView { // Remove this!
            // content
        }
    }
}

// ✅ Correct - TabView only in RootView
struct RootView: View {
    var body: some View {
        TabView(selection: $appState.selectedTab) {
            // All tabs defined here
        }
    }
}
```

### Issue: Missing UI components
**Error**: `Cannot find 'MessageBubble' in scope`

**Solution**: Create the missing components
```swift
// Create MessageBubble.swift
struct MessageBubble: View {
    let message: Message
    
    var body: some View {
        HStack {
            if message.isUser { Spacer() }
            
            Text(message.text)
                .padding()
                .background(message.isUser ? Color.blue : Color.gray.opacity(0.2))
                .cornerRadius(12)
            
            if !message.isUser { Spacer() }
        }
        .padding(.horizontal)
    }
}
```

### Issue: Sheet presentation not working
**Problem**: Settings sheet not appearing

**Solution**: Use proper sheet modifier
```swift
struct HomeView: View {
    @State private var showingSettings = false
    
    var body: some View {
        NavigationView {
            // content
        }
        .sheet(isPresented: $showingSettings) {
            SettingsView()
        }
    }
}
```

## Compilation Errors

### Issue: Syntax errors from copy-paste
**Error**: Random code appearing in unexpected places

**Example**: AuthViewModel had chat-related code accidentally pasted
```swift
// ❌ Wrong - unrelated code in AuthViewModel
@Published var messages: [Message] = []
var mockService = MockTranslationService()

// ✅ Correct - remove unrelated code
// Keep only auth-related properties
```

### Issue: Missing imports
**Error**: `Cannot find type 'X' in scope`

**Solution**: Add necessary imports
```swift
import SwiftUI
import ClerkSDK
import Design // If using Design package components
```

### Issue: Property wrapper syntax
**Error**: Issues with @Published, @State, etc.

**Solution**: Ensure correct syntax
```swift
// ✅ Correct
@Published var isAuthenticated = false
@State private var showingSettings = false
@StateObject private var viewModel = HomeViewModel()
@EnvironmentObject var appState: AppStateViewModel
```

## Package Dependencies

### Issue: Package resolution failures
**Problem**: Swift Package Manager can't resolve dependencies

**Solutions**:
1. File → Packages → Reset Package Caches
2. File → Packages → Update to Latest Package Versions
3. Clean build folder (Cmd+Shift+K)
4. Delete DerivedData if necessary

### Issue: Clerk SDK version conflicts
**Solution**: Use compatible version
```swift
// In Package.swift or Xcode package settings
.package(url: "https://github.com/clerk/clerk-ios", from: "0.1.0")
```

## Runtime Issues

### Issue: App crashes on launch
**Common causes and solutions**:

1. **Missing Clerk configuration**
   ```swift
   // Ensure Clerk is initialized
   Clerk.configure(publishableKey: "your-key")
   ```

2. **Force unwrapping nil values**
   ```swift
   // ❌ Avoid
   let user = clerk.user!
   
   // ✅ Safe
   if let user = clerk.user {
       // use user
   }
   ```

3. **Missing required assets**
   - Check all image assets exist
   - Verify Info.plist configurations

### Issue: Mock services not returning data
**Solution**: Ensure mock services are properly initialized
```swift
class HomeViewModel: ObservableObject {
    private let translationService: TranslationServiceProtocol
    
    init(translationService: TranslationServiceProtocol = MockTranslationService()) {
        self.translationService = translationService
    }
}
```

## Best Practices to Avoid Issues

### 1. Type Safety
- Define models once in a central location
- Use protocols for service interfaces
- Avoid force unwrapping

### 2. Navigation Architecture
- Keep navigation logic in one place (RootView)
- Use environment objects for shared state
- Avoid nested navigation views

### 3. Async/Await
- Mark async functions properly
- Use Task for async work in views
- Handle errors appropriately

### 4. State Management
- Use appropriate property wrappers (@State, @StateObject, @Published)
- Keep view models as @MainActor
- Initialize state objects correctly

## Debug Commands

### Useful Xcode shortcuts:
- Clean build: `Cmd+Shift+K`
- Build: `Cmd+B`
- Run: `Cmd+R`
- Stop: `Cmd+.`
- Show/hide navigator: `Cmd+0`
- Show/hide debug area: `Cmd+Shift+Y`

### Console debugging:
```swift
// Add to ViewModels or Views for debugging
print("=== Debug: \(self) ===")
print("Is authenticated: \(isAuthenticated)")
print("User: \(user?.emailAddress ?? "nil")")
dump(translation) // Detailed object inspection
```

### SwiftUI Preview debugging:
```swift
#if DEBUG
struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
            .environmentObject(AppStateViewModel())
            .environmentObject(AuthViewModel())
    }
}
#endif
```

## Getting Help

If you encounter issues not covered here:

1. Check the [main AGENTS.md](/AGENTS.md) for architecture overview
2. Review package-specific AGENTS.md files
3. Look at the working code examples in the ViewModels
4. Check Swift/SwiftUI documentation
5. Review Clerk iOS SDK documentation

---

*This guide is based on actual issues encountered and resolved during Kumori development. Last updated: December 2024* 