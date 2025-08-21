# Image Asset Management System

## Overview

This document outlines how user-generated images are stored, cached, and displayed throughout the Kumori app, making them appear as seamless as built-in assets.

## Storage Architecture

### Local Storage Strategy

```
Documents/
├── Generations/
│   ├── Stickers/
│   │   ├── gen_abc123_full.png      (Original, transparent BG)
│   │   ├── gen_abc123_thumb.png     (Thumbnail for grid)
│   │   └── gen_abc123_meta.json     (Metadata)
│   └── Scenes/
│       ├── gen_xyz789_full.jpg      (Original)
│       ├── gen_xyz789_thumb.jpg     (Thumbnail)
│       └── gen_xyz789_meta.json     (Metadata)
└── Cache/
    ├── Downloads/                    (Temporary downloads)
    └── Processed/                    (Optimized versions)
```

## Core Components

### 1. Image Storage Manager

```swift
// Services/ImageStorageManager.swift
class ImageStorageManager {
    static let shared = ImageStorageManager()
    
    private let fileManager = FileManager.default
    private let documentsURL: URL
    
    func saveGeneration(_ image: UIImage, 
                       metadata: GenerationMetadata,
                       type: OutputType) async throws -> GenerationAsset {
        // 1. Generate unique paths
        let id = metadata.id
        let fullPath = getFullImagePath(for: id, type: type)
        let thumbPath = getThumbnailPath(for: id, type: type)
        let metaPath = getMetadataPath(for: id, type: type)
        
        // 2. Save full image
        let imageData = type == .sticker ? 
            image.pngData() : 
            image.jpegData(compressionQuality: 0.9)
        try imageData?.write(to: fullPath)
        
        // 3. Generate and save thumbnail
        let thumbnail = await generateThumbnail(from: image, type: type)
        let thumbData = thumbnail.pngData()
        try thumbData?.write(to: thumbPath)
        
        // 4. Save metadata
        let metaData = try JSONEncoder().encode(metadata)
        try metaData.write(to: metaPath)
        
        return GenerationAsset(
            id: id,
            fullImagePath: fullPath,
            thumbnailPath: thumbPath,
            metadata: metadata,
            type: type
        )
    }
    
    private func generateThumbnail(from image: UIImage, 
                                  type: OutputType) async -> UIImage {
        let size = CGSize(width: 400, height: 400)
        
        return await withCheckedContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                let renderer = UIGraphicsImageRenderer(size: size)
                let thumbnail = renderer.image { context in
                    if type == .scene {
                        // Add rounded corners for scenes
                        let rect = CGRect(origin: .zero, size: size)
                        let path = UIBezierPath(roundedRect: rect, cornerRadius: 20)
                        path.addClip()
                    }
                    image.draw(in: CGRect(origin: .zero, size: size))
                }
                continuation.resume(returning: thumbnail)
            }
        }
    }
}
```

### 2. Generation Asset Model

```swift
// Models/GenerationAsset.swift
struct GenerationAsset: Identifiable {
    let id: String
    let fullImagePath: URL
    let thumbnailPath: URL
    let metadata: GenerationMetadata
    let type: OutputType
    
    var thumbnail: UIImage? {
        UIImage(contentsOfFile: thumbnailPath.path)
    }
    
    var fullImage: UIImage? {
        UIImage(contentsOfFile: fullImagePath.path)
    }
    
    var displayName: String {
        metadata.filterName ?? "Untitled"
    }
    
    var createdAt: Date {
        metadata.createdAt
    }
}

extension GenerationMetadata {
    var filterName: String?
    var originalImageId: String?
    var enhancementOptions: EnhancementOptions?
}
```

### 3. Asset Provider for InfiniteGrid

```swift
// Services/GenerationAssetProvider.swift
@MainActor
class GenerationAssetProvider: ObservableObject {
    @Published var assets: [GenerationAsset] = []
    @Published var isLoading = false
    
    private let storageManager = ImageStorageManager.shared
    
    func loadAssets() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            // Load all saved generations
            let stickers = try await storageManager.loadAssets(type: .sticker)
            let scenes = try await storageManager.loadAssets(type: .scene)
            
            // Combine and sort by date
            assets = (stickers + scenes)
                .sorted { $0.createdAt > $1.createdAt }
        } catch {
            print("Failed to load assets: \(error)")
        }
    }
    
    func assetImage(for index: Int) -> UIImage? {
        guard index >= 0 && index < assets.count else { return nil }
        return assets[index].thumbnail
    }
}
```

## Integration with Existing Views

### 1. HomeView Integration

```swift
// Update HomeView to display generated images
struct HomeView: View {
    @StateObject private var assetProvider = GenerationAssetProvider()
    
    var body: some View {
        ZStack {
            InfiniteGrid(
                gridSize: 80,
                onItemTap: { item in
                    // Handle tap on generation
                    if let asset = assetProvider.assets[safe: item.gridIndex] {
                        showAssetDetail(asset)
                    }
                },
                // ... other parameters
            ) { item in
                GenerationGridCell(
                    asset: assetProvider.assets[safe: item.gridIndex],
                    fallbackImage: Image("logo")
                )
            }
        }
        .task {
            await assetProvider.loadAssets()
        }
    }
}

// Custom cell for grid
struct GenerationGridCell: View {
    let asset: GenerationAsset?
    let fallbackImage: Image
    
    var body: some View {
        if let asset = asset {
            Group {
                if let thumbnail = asset.thumbnail {
                    Image(uiImage: thumbnail)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .clipShape(
                            asset.type == .scene ? 
                            AnyShape(RoundedRectangle(cornerRadius: 12)) : 
                            AnyShape(Rectangle())
                        )
                } else {
                    // Loading state
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.fillSecondary)
                        .shimmer()
                }
            }
        } else {
            fallbackImage
                .resizable()
                .scaledToFit()
                .padding(12)
        }
    }
}
```

### 2. FeedView Integration

```swift
// Update FeedView to show generated content
struct GenerationFeedItem {
    let asset: GenerationAsset
    let creator: User
    let likes: Int
    let comments: Int
}

// In FeedData.swift
static func generationFeedItems() -> [FeedItem] {
    // Load recent generations and convert to feed items
    let generations = GenerationAssetProvider.shared.assets
        .prefix(10)
        .map { asset in
            FeedItem(type: .generation(
                GenerationItem(
                    asset: asset,
                    userName: "You",
                    userAvatar: nil,
                    timeAgo: asset.createdAt.timeAgoDisplay(),
                    likeCount: 0,
                    commentCount: 0,
                    bookmarkCount: 0
                )
            ))
        }
    return generations
}
```

## Image Display Optimization

### 1. Lazy Loading

```swift
// Components/LazyGenerationImage.swift
struct LazyGenerationImage: View {
    let asset: GenerationAsset
    @State private var loadedImage: UIImage?
    @State private var isLoading = false
    
    var body: some View {
        Group {
            if let image = loadedImage {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .transition(.opacity)
            } else {
                // Placeholder while loading
                Rectangle()
                    .fill(Color.fillSecondary)
                    .overlay(
                        ProgressView()
                            .opacity(isLoading ? 1 : 0)
                    )
                    .onAppear {
                        loadImage()
                    }
            }
        }
    }
    
    private func loadImage() {
        guard !isLoading else { return }
        isLoading = true
        
        Task {
            // Load in background
            let image = await Task.detached(priority: .userInitiated) {
                asset.thumbnail
            }.value
            
            await MainActor.run {
                withAnimation(.easeIn(duration: 0.3)) {
                    loadedImage = image
                    isLoading = false
                }
            }
        }
    }
}
```

### 2. Memory Management

```swift
// Services/ImageCacheManager.swift
class ImageCacheManager {
    static let shared = ImageCacheManager()
    
    private var memoryCache = NSCache<NSString, UIImage>()
    private let maxMemoryCount = 100
    private let maxMemorySize = 100 * 1024 * 1024 // 100MB
    
    init() {
        memoryCache.countLimit = maxMemoryCount
        memoryCache.totalCostLimit = maxMemorySize
        
        // Listen for memory warnings
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(clearCache),
            name: UIApplication.didReceiveMemoryWarningNotification,
            object: nil
        )
    }
    
    func image(for key: String) -> UIImage? {
        memoryCache.object(forKey: key as NSString)
    }
    
    func store(_ image: UIImage, for key: String) {
        let cost = image.jpegData(compressionQuality: 1.0)?.count ?? 0
        memoryCache.setObject(image, forKey: key as NSString, cost: cost)
    }
    
    @objc private func clearCache() {
        memoryCache.removeAllObjects()
    }
}
```

## Export and Sharing

### 1. High-Resolution Export

```swift
// Services/ExportService.swift
class ExportService {
    func exportHighResolution(_ asset: GenerationAsset) async throws -> URL {
        guard let fullImage = asset.fullImage else {
            throw ExportError.imageNotFound
        }
        
        // Create temporary export directory
        let exportURL = FileManager.default
            .temporaryDirectory
            .appendingPathComponent("\(asset.id)_export.png")
        
        // Save at full quality
        if asset.type == .sticker {
            try fullImage.pngData()?.write(to: exportURL)
        } else {
            try fullImage.jpegData(compressionQuality: 1.0)?.write(to: exportURL)
        }
        
        return exportURL
    }
    
    func shareAsset(_ asset: GenerationAsset, from viewController: UIViewController) {
        Task {
            do {
                let exportURL = try await exportHighResolution(asset)
                
                let activityVC = UIActivityViewController(
                    activityItems: [exportURL],
                    applicationActivities: nil
                )
                
                await MainActor.run {
                    viewController.present(activityVC, animated: true)
                }
            } catch {
                print("Export failed: \(error)")
            }
        }
    }
}
```

## Best Practices

### 1. File Management
- Implement periodic cleanup of old cached files
- Set maximum storage limits (e.g., 500MB)
- Compress thumbnails aggressively
- Use WebP format for better compression when possible

### 2. Performance
- Load thumbnails on demand
- Pre-cache nearby grid items
- Use background queues for image processing
- Implement progressive loading for large images

### 3. User Experience
- Show loading states with shimmer effects
- Provide smooth transitions when images load
- Cache scroll positions in grid views
- Enable quick preview with 3D touch/long press

### 4. Sync and Backup
- Mark images for iCloud backup (optional)
- Implement export to Photos app
- Support batch operations
- Provide clear storage usage information

## Migration Path

When app updates change the storage format:

1. Check storage version on app launch
2. Run migration in background if needed
3. Show progress to user for large migrations
4. Keep backup of original format until migration completes
5. Clean up old format files after successful migration 