# Kumori Image Generation System Architecture

## Overview

Kumori is a premium iOS application that provides a beautiful interface for AI-powered image generation using carefully crafted artistic filters. The app focuses on two main output types:

1. **Stickers**: Characters/items with transparent backgrounds
2. **Scenes**: Rounded corner tiles with full backgrounds

## System Architecture

### Client-Server Architecture

```
┌─────────────────────┐
│   iOS App (Swift)   │
│  ┌───────────────┐  │
│  │ Create View   │  │         ┌──────────────────┐
│  │   & Flow      │  │         │  Backend Service │
│  └───────┬───────┘  │         │  (Next.js/Vercel)│
│          │          │         │                  │
│  ┌───────▼───────┐  │   HTTP  │  ┌────────────┐ │
│  │ Image Service │◄─┼─────────┼──┤    API     │ │
│  │  (Alamofire)  │  │         │  │ Endpoints  │ │
│  └───────────────┘  │         │  └──────┬─────┘ │
│                     │         │         │       │
│  ┌───────────────┐  │         │  ┌──────▼─────┐ │
│  │ Image Cache & │  │         │  │ OpenAI API │ │
│  │   Storage     │  │         │  │ DALL-E 3   │ │
│  └───────────────┘  │         │  └────────────┘ │
└─────────────────────┘         └──────────────────┘
```

## Module Structure

### 1. Models

#### Filter Model
```swift
// Models/Filter.swift
struct Filter: Identifiable, Codable {
    let id: String
    let name: String
    let description: String
    let category: FilterCategory
    let outputType: OutputType
    let previewImage: String? // Asset name or URL
    let isPremium: Bool
    let sortOrder: Int
}

enum FilterCategory: String, Codable, CaseIterable {
    case fantasy = "Fantasy"
    case anime = "Anime"
    case realistic = "Realistic"
    case artistic = "Artistic"
    case cyberpunk = "Cyberpunk"
    case minimal = "Minimal"
}

enum OutputType: String, Codable {
    case sticker = "sticker"    // Transparent background
    case scene = "scene"        // Full background
}
```

#### Generation Request/Response Models
```swift
// Models/GenerationRequest.swift
struct GenerationRequest: Codable {
    let imageData: Data
    let filterId: String
    let outputFormat: OutputFormat
    let enhancementOptions: EnhancementOptions?
}

struct EnhancementOptions: Codable {
    let upscale: Bool
    let denoise: Bool
    let colorEnhance: Bool
}

enum OutputFormat: String, Codable {
    case png = "png"
    case webp = "webp"
}

// Models/GenerationResponse.swift
struct GenerationResponse: Codable {
    let id: String
    let status: GenerationStatus
    let resultUrl: String?
    let thumbnailUrl: String?
    let error: GenerationError?
    let metadata: GenerationMetadata
}

struct GenerationMetadata: Codable {
    let createdAt: Date
    let processingTime: TimeInterval
    let dimensions: CGSize
    let fileSize: Int64
}
```

### 2. Services

#### Image Generation Service
```swift
// Services/ImageGenerationService.swift
protocol ImageGenerationServiceProtocol {
    func generateImage(
        from image: UIImage,
        filter: Filter,
        options: EnhancementOptions?
    ) async throws -> GenerationResponse
    
    func getGenerationStatus(id: String) async throws -> GenerationResponse
    
    func cancelGeneration(id: String) async throws
}
```

#### Filter Service
```swift
// Services/FilterService.swift
protocol FilterServiceProtocol {
    func fetchAvailableFilters() async throws -> [Filter]
    func getFilter(by id: String) -> Filter?
    func getCachedFilters() -> [Filter]
}
```

### 3. Views

#### Create Flow Structure
```
CreateView (Main Container)
├── FilterSelectionView
│   ├── FilterCategoryTabs
│   └── FilterGrid
├── ImagePickerView
│   ├── CameraCapture
│   └── PhotoLibraryPicker
├── GenerationView
│   ├── ProcessingAnimation
│   ├── ProgressIndicator
│   └── ResultDisplay
└── SaveShareView
    ├── SaveOptions
    └── ShareSheet
```

### 4. View Models

#### CreateViewModel
```swift
// ViewModels/CreateViewModel.swift
@MainActor
class CreateViewModel: ObservableObject {
    @Published var selectedFilter: Filter?
    @Published var sourceImage: UIImage?
    @Published var generationState: GenerationState = .idle
    @Published var generatedImage: UIImage?
    @Published var error: Error?
    
    enum GenerationState {
        case idle
        case uploading(progress: Double)
        case processing(estimatedTime: TimeInterval)
        case completed
        case failed(Error)
    }
}
```

## API Specification

### Endpoints

#### 1. Upload & Generate
```
POST /api/generate
Content-Type: multipart/form-data

Request:
- image: File (max 10MB)
- filter_id: String
- output_format: String (png/webp)
- enhancement_options: JSON (optional)

Response:
{
  "generation_id": "gen_123456",
  "status": "processing",
  "estimated_time": 15,
  "webhook_url": "wss://api.kumori.app/ws/gen_123456"
}
```

#### 2. Check Status
```
GET /api/generations/{id}

Response:
{
  "id": "gen_123456",
  "status": "completed",
  "result_url": "https://cdn.kumori.app/results/gen_123456.png",
  "thumbnail_url": "https://cdn.kumori.app/thumbs/gen_123456.webp",
  "metadata": {
    "created_at": "2024-01-01T00:00:00Z",
    "processing_time": 12.5,
    "dimensions": { "width": 1024, "height": 1024 },
    "file_size": 2457600
  }
}
```

#### 3. Get Filters
```
GET /api/filters

Response:
{
  "filters": [
    {
      "id": "fantasy_warrior",
      "name": "Fantasy Warrior",
      "description": "Transform into a Final Fantasy style warrior",
      "category": "fantasy",
      "output_type": "sticker",
      "preview_url": "https://cdn.kumori.app/previews/fantasy_warrior.webp",
      "is_premium": false,
      "sort_order": 1
    }
  ]
}
```

## Image Upload Best Practices

### 1. Pre-upload Processing
- Resize images client-side to max 2048x2048 before upload
- Convert to JPEG with 85% quality for photos
- Use PNG for images with transparency
- Implement progressive upload with chunks for large files

### 2. Upload Implementation
```swift
// Use Alamofire's upload capabilities
AF.upload(
    multipartFormData: { formData in
        formData.append(imageData, withName: "image", fileName: "upload.jpg", mimeType: "image/jpeg")
        formData.append(filterId.data(using: .utf8)!, withName: "filter_id")
    },
    to: "\(baseURL)/api/generate"
)
.uploadProgress { progress in
    // Update UI with progress
}
```

### 3. Error Handling
- Implement retry logic for network failures
- Cache uploads locally for resume capability
- Provide clear error messages for size/format issues

## Integration Points

### 1. Replacing ChatView
- When user taps the '+' button in Dock, present CreateView instead of ChatView
- Use similar transition animations for consistency
- Maintain navigation flow back to main app

### 2. InfiniteGrid Integration
- Display generated images in the HomeView grid
- Implement local caching for smooth scrolling
- Support both stickers and scenes with appropriate styling

### 3. FeedView Integration
- Show recent creations from all users (if social features added)
- Display filter information with each creation
- Enable liking/sharing functionality

## Animation & Transitions

### 1. Create Flow Animations
```swift
// Use existing transition system
.transition(.glassBlur(radius: 20))
.scaleFade(isVisible: true)
.slideUp(isVisible: true)
```

### 2. Generation Progress
- Shimmer effect during processing
- Particle effects for completion
- Smooth reveal of generated image

### 3. Filter Selection
- Grid animations with staggered appearance
- Hover/press states with scale effects
- Category transitions with slide animations

## Performance Considerations

### 1. Image Caching
- Implement SDWebImage or similar for efficient caching
- Store generated images locally with metadata
- Implement cache size limits and cleanup

### 2. Memory Management
- Downscale images for grid display
- Load full resolution only when needed
- Release unused images from memory

### 3. Background Processing
- Continue generation when app backgrounds
- Local notifications for completion
- Background fetch for status updates

## Security & Privacy

### 1. API Authentication
- Implement secure token-based auth
- Store credentials in Keychain
- Refresh tokens automatically

### 2. Image Privacy
- Encrypt stored images
- Clear cache on user request
- No automatic cloud backup for generated content

### 3. Content Moderation
- Client-side content detection
- Server-side safety checks
- User reporting mechanisms

## Future Enhancements

### 1. Social Features
- User profiles and galleries
- Following/followers system
- Collaborative creations

### 2. Advanced Editing
- Post-generation adjustments
- Multiple filter combinations
- Custom filter creation

### 3. Monetization
- Premium filters
- High-resolution exports
- Commercial usage licenses 