# Kumori Technical Architecture

## Overview

Kumori is built as a native iOS/macOS app using SwiftUI, with a modular package architecture for maximum code reuse and maintainability. The app communicates with a Next.js API backend for AI-powered translations and lesson generation.

## Package Architecture

```
kumori-apple/
├── kumori-ios/          # Main iOS app target
├── Packages/
│   ├── Auth/           # Clerk authentication (existing)
│   ├── Design/         # UI components & theme (existing)
│   ├── Analytics/      # Analytics integration (existing)
│   ├── Networking/     # API client (new)
│   ├── Models/         # Shared data models (new)
│   ├── Storage/        # Local persistence (new)
│   └── Translation/    # Translation features (new)
```

## Package Details

### 1. Networking Package

**Purpose**: Centralized API client using Alamofire

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0")
]

// Core Components:
- APIClient.swift         # Main API client
- APIEndpoint.swift      # Endpoint definitions
- APIError.swift         # Error handling
- RequestInterceptor.swift # Auth token injection
- NetworkMonitor.swift   # Connectivity monitoring
```

**Key APIs**:
```swift
public class APIClient {
    func translate(_ request: TranslationRequest) async throws -> TranslationResponse
    func generateLesson(from translations: [Translation]) async throws -> Lesson
    func saveUserPreferences(_ preferences: UserPreferences) async throws
    func fetchProgress() async throws -> UserProgress
}
```

### 2. Models Package

**Purpose**: Shared data models between client and server

```swift
// Core Models:

public struct Translation: Codable, Identifiable {
    let id: UUID
    let sourceText: String
    let translatedText: String
    let romaji: String?
    let context: TranslationContext?
    let createdAt: Date
}

public struct TranslationContext: Codable {
    let grammarNotes: [String]
    let culturalNotes: [String]?
    let alternativeTranslations: [String]?
    let difficulty: Difficulty
}

public struct Lesson: Codable, Identifiable {
    let id: UUID
    let title: String
    let type: LessonType
    let content: LessonContent
    let estimatedDuration: TimeInterval
    let difficulty: Difficulty
}

public struct UserPreferences: Codable {
    let interests: [Interest]
    let learningGoals: [LearningGoal]
    let dailyGoal: Int // minutes
    let preferredLessonTypes: [LessonType]
}

public enum Interest: String, Codable, CaseIterable {
    case anime
    case business
    case travel
    case gaming
    case culture
    case food
    case technology
}

public enum LessonType: String, Codable {
    case vocabulary
    case grammar
    case conversation
    case reading
    case listening
}
```

### 3. Storage Package

**Purpose**: Local data persistence using Core Data + UserDefaults

```swift
// Core Components:
- CoreDataStack.swift     # Core Data setup
- TranslationStore.swift  # Saved translations
- VocabularyStore.swift   # User vocabulary
- PreferencesStore.swift  # User preferences
- CacheManager.swift      # Response caching
```

**Key Features**:
- Offline support for saved translations
- Vocabulary spaced repetition tracking
- User preference syncing
- Response caching for performance

### 4. Translation Package

**Purpose**: Translation-specific UI and business logic

```swift
// Core Components:
- TranslationView.swift        # Main chat interface
- TranslationViewModel.swift   # Chat logic
- MessageBubble.swift         # Message UI component
- TranslationInput.swift      # Input field component
- VocabularyListView.swift    # Saved words view
- LessonGeneratorView.swift   # Lesson creation UI
```

## API Design

### Base Configuration
```
Base URL: https://api.kumori.app
Authentication: Bearer token (from Clerk)
Content-Type: application/json
```

### Endpoints

#### 1. Translation
```
POST /api/translate
Request:
{
  "text": "Hello, how are you?",
  "targetLanguage": "ja",
  "context": {
    "previousMessages": [...],
    "userLevel": "beginner"
  }
}

Response:
{
  "translation": {
    "id": "uuid",
    "sourceText": "Hello, how are you?",
    "translatedText": "こんにちは、元気ですか？",
    "romaji": "Konnichiwa, genki desu ka?",
    "context": {
      "grammarNotes": [
        "こんにちは (konnichiwa) - Standard greeting",
        "元気ですか (genki desu ka) - Asking about wellbeing"
      ],
      "culturalNotes": ["Used in formal/polite contexts"],
      "alternativeTranslations": ["やあ、調子はどう？"],
      "difficulty": "beginner"
    }
  }
}
```

#### 2. Lesson Generation
```
POST /api/lessons/generate
Request:
{
  "translationIds": ["uuid1", "uuid2"],
  "lessonType": "vocabulary",
  "duration": 10 // minutes
}

Response:
{
  "lesson": {
    "id": "uuid",
    "title": "Greetings & Basic Phrases",
    "type": "vocabulary",
    "content": {
      "exercises": [...],
      "explanations": [...],
      "practiceQuestions": [...]
    },
    "estimatedDuration": 600,
    "difficulty": "beginner"
  }
}
```

#### 3. User Preferences
```
PUT /api/user/preferences
Request:
{
  "interests": ["anime", "gaming"],
  "learningGoals": ["conversation", "reading"],
  "dailyGoal": 15,
  "preferredLessonTypes": ["vocabulary", "conversation"]
}
```

#### 4. Progress Tracking
```
GET /api/user/progress
Response:
{
  "streak": 7,
  "totalTranslations": 156,
  "vocabularySize": 89,
  "lessonsCompleted": 12,
  "weeklyProgress": {...}
}
```

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   SwiftUI   │────▶│ View Model   │────▶│ API Client  │
│    View     │     │              │     │ (Alamofire) │
└─────────────┘     └──────────────┘     └──────┬───────┘
                            │                     │
                            ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │ Local Store  │     │  Next.js    │
                    │ (Core Data)  │     │    API      │
                    └──────────────┘     └─────────────┘
```

## Security & Privacy

### Data Protection
- All API communication over HTTPS
- Clerk JWT tokens for authentication
- Local data encrypted with iOS Keychain
- No PII stored without user consent

### Privacy Features
- Translation history stored locally only
- Option to delete all data
- Anonymous analytics (opt-in)
- No third-party data sharing

## Performance Optimizations

### Client-Side
- Lazy loading for vocabulary lists
- Image caching for lesson content
- Debounced translation requests
- Offline mode with sync queue

### API-Side
- Response caching headers
- Pagination for large datasets
- Request rate limiting
- CDN for static assets

## Error Handling

### Network Errors
```swift
enum NetworkError: LocalizedError {
    case noConnection
    case timeout
    case serverError(Int)
    case invalidResponse
    
    var errorDescription: String? {
        switch self {
        case .noConnection:
            return "No internet connection"
        case .timeout:
            return "Request timed out"
        case .serverError(let code):
            return "Server error (\(code))"
        case .invalidResponse:
            return "Invalid response from server"
        }
    }
}
```

### Graceful Degradation
- Offline mode with cached data
- Retry logic with exponential backoff
- User-friendly error messages
- Fallback to local translation history

## Testing Strategy

### Unit Tests
- Model serialization/deserialization
- View model logic
- API client mocking
- Core Data operations

### Integration Tests
- API endpoint testing
- Authentication flow
- Data synchronization
- Error scenarios

### UI Tests
- Translation flow
- Onboarding completion
- Navigation patterns
- Accessibility compliance

---

*This architecture provides a solid foundation for building a scalable, maintainable language learning app with AI at its core.* 