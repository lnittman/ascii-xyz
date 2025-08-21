# Image Generation API Reference

## Overview

The Image Generation API provides comprehensive AI-powered image generation, manipulation, and management services. Built with modern web technologies, it supports multiple AI models, advanced filtering, and seamless integration capabilities.

## Base URL

```
Production: https://api.imagegen.app
Staging: https://staging-api.imagegen.app
Development: http://localhost:3000/api
```

## Authentication

All API requests require authentication using API keys or OAuth 2.0:

### API Key Authentication
```http
Authorization: Bearer <api_key>
X-API-Key: <api_key>
```

### OAuth 2.0 Authentication
```http
Authorization: Bearer <access_token>
```

### Obtaining Credentials

1. **API Keys**: Generate from your dashboard at `https://dashboard.imagegen.app/api-keys`
2. **OAuth**: Register your application at `https://dashboard.imagegen.app/oauth/apps`

## Common Headers

```http
Content-Type: application/json
Accept: application/json
X-Client-Version: 2.0.0
X-Request-ID: <unique_request_id>
```

## Rate Limiting and Quotas

### Rate Limits

| Tier | Requests/Minute | Requests/Hour | Requests/Day |
|------|----------------|---------------|--------------|
| Free | 10 | 100 | 1,000 |
| Basic | 60 | 1,000 | 10,000 |
| Pro | 300 | 5,000 | 50,000 |
| Enterprise | Custom | Custom | Custom |

### Quota Information

Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1640995200
X-RateLimit-Reset-After: 3600
X-Quota-Limit: 10000
X-Quota-Remaining: 9842
X-Quota-Reset: 1641081600
```

## Image Generation Endpoints

### Text-to-Image Generation

#### POST /api/v2/generate/text-to-image

Generate images from text descriptions using AI models.

**Request:**
```json
{
  "prompt": "A serene Japanese garden with cherry blossoms, koi pond, and traditional bridge at sunset",
  "negative_prompt": "blur, low quality, distorted, watermark",
  "model": "stable-diffusion-xl",
  "parameters": {
    "width": 1024,
    "height": 1024,
    "num_outputs": 4,
    "num_inference_steps": 50,
    "guidance_scale": 7.5,
    "scheduler": "DPMSolverMultistep",
    "seed": 42,
    "sampler": "k_euler_a"
  },
  "style": {
    "preset": "photorealistic",
    "artistic_style": "impressionist",
    "lighting": "golden_hour",
    "camera_angle": "wide_angle"
  },
  "output": {
    "format": "png",
    "quality": 95,
    "return_type": "url"
  },
  "webhook_url": "https://your-app.com/webhooks/generation-complete",
  "metadata": {
    "user_id": "user_123",
    "project_id": "proj_456",
    "tags": ["nature", "landscape", "japan"]
  }
}
```

**Response:**
```json
{
  "id": "gen_abc123def456",
  "status": "completed",
  "created_at": "2024-01-01T00:00:00Z",
  "completed_at": "2024-01-01T00:00:45Z",
  "model": "stable-diffusion-xl",
  "images": [
    {
      "id": "img_001",
      "url": "https://cdn.imagegen.app/outputs/gen_abc123def456/image_1.png",
      "width": 1024,
      "height": 1024,
      "size_bytes": 2456789,
      "format": "png",
      "nsfw_score": 0.02,
      "aesthetic_score": 8.7
    },
    {
      "id": "img_002",
      "url": "https://cdn.imagegen.app/outputs/gen_abc123def456/image_2.png",
      "width": 1024,
      "height": 1024,
      "size_bytes": 2389012,
      "format": "png",
      "nsfw_score": 0.01,
      "aesthetic_score": 9.1
    }
  ],
  "cost": {
    "credits": 4,
    "usd": 0.08
  },
  "metadata": {
    "user_id": "user_123",
    "project_id": "proj_456",
    "tags": ["nature", "landscape", "japan"]
  }
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Text description of the desired image (max 1000 chars) |
| `negative_prompt` | string | No | Things to avoid in the generation |
| `model` | string | No | Model ID to use (default: stable-diffusion-xl) |
| `parameters.width` | integer | No | Image width in pixels (64-2048, must be multiple of 8) |
| `parameters.height` | integer | No | Image height in pixels (64-2048, must be multiple of 8) |
| `parameters.num_outputs` | integer | No | Number of images to generate (1-4) |
| `parameters.num_inference_steps` | integer | No | Denoising steps (10-150) |
| `parameters.guidance_scale` | float | No | Prompt adherence strength (1.0-20.0) |
| `parameters.seed` | integer | No | Random seed for reproducibility |
| `style.preset` | string | No | Style preset to apply |
| `output.format` | string | No | Output format: png, jpg, webp |
| `output.quality` | integer | No | JPEG/WebP quality (1-100) |
| `webhook_url` | string | No | URL for completion notification |

### Image-to-Image Generation

#### POST /api/v2/generate/image-to-image

Transform existing images based on text prompts.

**Request:**
```json
{
  "init_image": "https://example.com/source-image.jpg",
  "prompt": "Transform into a cyberpunk style with neon lights and futuristic elements",
  "strength": 0.75,
  "model": "stable-diffusion-xl",
  "parameters": {
    "width": 1024,
    "height": 1024,
    "num_outputs": 2,
    "num_inference_steps": 50,
    "guidance_scale": 7.5
  },
  "preserve": {
    "structure": true,
    "colors": false,
    "style": false
  }
}
```

**Response:**
```json
{
  "id": "gen_xyz789",
  "status": "completed",
  "created_at": "2024-01-01T00:01:00Z",
  "completed_at": "2024-01-01T00:01:30Z",
  "source_image": {
    "url": "https://example.com/source-image.jpg",
    "analysis": {
      "dominant_colors": ["#FF5733", "#33FF57", "#3357FF"],
      "detected_objects": ["person", "building", "sky"],
      "style": "photograph"
    }
  },
  "images": [
    {
      "id": "img_003",
      "url": "https://cdn.imagegen.app/outputs/gen_xyz789/image_1.png",
      "width": 1024,
      "height": 1024,
      "transformations_applied": ["style_transfer", "color_adjustment"]
    }
  ]
}
```

### Inpainting

#### POST /api/v2/generate/inpaint

Selectively edit parts of an image using masks.

**Request:**
```json
{
  "init_image": "https://example.com/original.jpg",
  "mask_image": "https://example.com/mask.png",
  "prompt": "Replace with a beautiful flower garden",
  "model": "stable-diffusion-xl-inpaint",
  "parameters": {
    "num_inference_steps": 50,
    "guidance_scale": 7.5
  },
  "inpaint_mode": "original",
  "mask_blur": 4,
  "preserve_masked_area": false
}
```

**Response:**
```json
{
  "id": "inp_123456",
  "status": "completed",
  "images": [
    {
      "id": "img_004",
      "url": "https://cdn.imagegen.app/outputs/inp_123456/result.png",
      "mask_area_percentage": 23.5,
      "inpainted_regions": [
        {
          "x": 100,
          "y": 200,
          "width": 300,
          "height": 400
        }
      ]
    }
  ]
}
```

## Filter and Processing Endpoints

### Apply Filters

#### POST /api/v2/process/filters

Apply various filters and effects to images.

**Request:**
```json
{
  "image_url": "https://example.com/image.jpg",
  "filters": [
    {
      "type": "brightness",
      "value": 1.2
    },
    {
      "type": "contrast",
      "value": 1.1
    },
    {
      "type": "blur",
      "radius": 5
    },
    {
      "type": "artistic",
      "style": "oil_painting",
      "intensity": 0.7
    }
  ],
  "output_format": "png",
  "preserve_metadata": true
}
```

**Response:**
```json
{
  "id": "proc_789xyz",
  "processed_image": {
    "url": "https://cdn.imagegen.app/processed/proc_789xyz/result.png",
    "filters_applied": ["brightness", "contrast", "blur", "artistic"],
    "processing_time_ms": 234
  }
}
```

### Background Removal

#### POST /api/v2/process/remove-background

Remove or replace image backgrounds using AI.

**Request:**
```json
{
  "image_url": "https://example.com/portrait.jpg",
  "mode": "remove",
  "output_format": "png",
  "edge_smoothing": true,
  "foreground_threshold": 0.5
}
```

**Response:**
```json
{
  "id": "bg_remove_123",
  "result": {
    "url": "https://cdn.imagegen.app/processed/bg_remove_123/no_bg.png",
    "mask_url": "https://cdn.imagegen.app/processed/bg_remove_123/mask.png",
    "foreground_bounds": {
      "x": 120,
      "y": 50,
      "width": 680,
      "height": 900
    }
  }
}
```

### Super Resolution

#### POST /api/v2/process/upscale

Enhance image resolution using AI upscaling.

**Request:**
```json
{
  "image_url": "https://example.com/low_res.jpg",
  "scale_factor": 4,
  "model": "real-esrgan",
  "enhance_faces": true,
  "denoise_strength": 0.5
}
```

**Response:**
```json
{
  "id": "upscale_456",
  "result": {
    "url": "https://cdn.imagegen.app/processed/upscale_456/high_res.png",
    "original_dimensions": {
      "width": 512,
      "height": 512
    },
    "upscaled_dimensions": {
      "width": 2048,
      "height": 2048
    },
    "enhancement_details": {
      "faces_detected": 2,
      "faces_enhanced": 2,
      "quality_improvement_score": 8.9
    }
  }
}
```

## Model Management Endpoints

### List Available Models

#### GET /api/v2/models

Retrieve all available AI models.

**Response:**
```json
{
  "models": [
    {
      "id": "stable-diffusion-xl",
      "name": "Stable Diffusion XL",
      "version": "1.0",
      "type": "text-to-image",
      "status": "active",
      "capabilities": ["text-to-image", "image-to-image", "inpainting"],
      "supported_sizes": [
        {"width": 1024, "height": 1024},
        {"width": 1152, "height": 896},
        {"width": 896, "height": 1152}
      ],
      "pricing": {
        "per_image": 0.02,
        "credits": 1
      },
      "performance": {
        "average_generation_time": 15,
        "queue_time": 2
      }
    },
    {
      "id": "midjourney-v6",
      "name": "Midjourney v6",
      "version": "6.0",
      "type": "text-to-image",
      "status": "active",
      "capabilities": ["text-to-image"],
      "specialized_features": ["artistic", "creative", "stylized"],
      "pricing": {
        "per_image": 0.05,
        "credits": 2.5
      }
    }
  ]
}
```

### Get Model Details

#### GET /api/v2/models/{model_id}

Get detailed information about a specific model.

**Response:**
```json
{
  "model": {
    "id": "stable-diffusion-xl",
    "name": "Stable Diffusion XL",
    "description": "Latest version of Stable Diffusion with improved quality and coherence",
    "version": "1.0",
    "release_date": "2023-07-26",
    "type": "text-to-image",
    "status": "active",
    "capabilities": {
      "text_to_image": true,
      "image_to_image": true,
      "inpainting": true,
      "outpainting": false,
      "controlnet": true
    },
    "parameters": {
      "max_prompt_length": 1000,
      "supported_schedulers": ["DPMSolverMultistep", "DDIM", "K_EULER"],
      "inference_steps_range": {
        "min": 10,
        "max": 150,
        "default": 50
      },
      "guidance_scale_range": {
        "min": 1.0,
        "max": 20.0,
        "default": 7.5
      }
    },
    "training_data": {
      "dataset_size": "2.3B images",
      "training_compute": "256 A100 GPUs",
      "training_duration": "1000 GPU hours"
    },
    "examples": [
      {
        "prompt": "A majestic lion in the savanna",
        "image_url": "https://cdn.imagegen.app/examples/sdxl_lion.jpg"
      }
    ]
  }
}
```

## User and Gallery Endpoints

### User Profile

#### GET /api/v2/user/profile

Get current user profile and statistics.

**Response:**
```json
{
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "username": "creative_artist",
    "created_at": "2023-01-01T00:00:00Z",
    "subscription": {
      "plan": "pro",
      "status": "active",
      "renews_at": "2024-02-01T00:00:00Z"
    },
    "usage": {
      "images_generated_today": 45,
      "images_generated_month": 892,
      "credits_remaining": 4521,
      "storage_used_mb": 2048,
      "storage_limit_mb": 10240
    },
    "preferences": {
      "default_model": "stable-diffusion-xl",
      "default_size": "1024x1024",
      "nsfw_filter": true,
      "auto_save_gallery": true
    }
  }
}
```

### Gallery Management

#### GET /api/v2/gallery

Retrieve user's image gallery.

**Request Parameters:**
```
?page=1
&limit=20
&sort=created_at
&order=desc
&tags=landscape,nature
&model=stable-diffusion-xl
&date_from=2024-01-01
&date_to=2024-01-31
```

**Response:**
```json
{
  "gallery": {
    "total_items": 156,
    "page": 1,
    "limit": 20,
    "items": [
      {
        "id": "gallery_item_123",
        "image_id": "img_abc123",
        "generation_id": "gen_xyz789",
        "url": "https://cdn.imagegen.app/gallery/user_abc123/img_abc123.png",
        "thumbnail_url": "https://cdn.imagegen.app/gallery/user_abc123/img_abc123_thumb.jpg",
        "prompt": "Beautiful sunset over mountains",
        "model": "stable-diffusion-xl",
        "created_at": "2024-01-15T14:30:00Z",
        "tags": ["landscape", "nature", "sunset"],
        "metadata": {
          "width": 1024,
          "height": 1024,
          "size_bytes": 2345678,
          "generation_time_seconds": 15
        },
        "interactions": {
          "views": 234,
          "likes": 45,
          "downloads": 12
        },
        "is_public": true,
        "is_featured": false
      }
    ]
  }
}
```

#### POST /api/v2/gallery/items

Add image to gallery.

**Request:**
```json
{
  "image_id": "img_abc123",
  "title": "Sunset Masterpiece",
  "description": "A beautiful sunset captured in AI art",
  "tags": ["sunset", "landscape", "nature"],
  "is_public": true,
  "collections": ["landscapes", "favorites"]
}
```

### Collections

#### POST /api/v2/collections

Create a new collection.

**Request:**
```json
{
  "name": "My Landscapes",
  "description": "Collection of my best landscape generations",
  "is_public": false,
  "cover_image_id": "img_123"
}
```

**Response:**
```json
{
  "collection": {
    "id": "coll_789",
    "name": "My Landscapes",
    "slug": "my-landscapes",
    "description": "Collection of my best landscape generations",
    "created_at": "2024-01-01T00:00:00Z",
    "item_count": 0,
    "is_public": false,
    "cover_image_url": "https://cdn.imagegen.app/gallery/covers/coll_789.jpg"
  }
}
```

## Webhook and Integration Endpoints

### Webhook Configuration

#### POST /api/v2/webhooks

Configure webhooks for generation events.

**Request:**
```json
{
  "url": "https://your-app.com/webhooks/imagegen",
  "events": ["generation.completed", "generation.failed", "process.completed"],
  "secret": "webhook_secret_key_123",
  "active": true,
  "retry_policy": {
    "max_retries": 3,
    "retry_delay_seconds": 60
  }
}
```

**Response:**
```json
{
  "webhook": {
    "id": "webhook_abc123",
    "url": "https://your-app.com/webhooks/imagegen",
    "events": ["generation.completed", "generation.failed", "process.completed"],
    "active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "last_triggered_at": null
  }
}
```

### Webhook Event Payloads

#### Generation Completed
```json
{
  "event": "generation.completed",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "generation_id": "gen_abc123",
    "user_id": "user_123",
    "model": "stable-diffusion-xl",
    "prompt": "A beautiful landscape",
    "images": [
      {
        "id": "img_001",
        "url": "https://cdn.imagegen.app/outputs/gen_abc123/image_1.png"
      }
    ],
    "cost": {
      "credits": 1,
      "usd": 0.02
    }
  }
}
```

### API Integration

#### POST /api/v2/integrations/connect

Connect third-party services.

**Request:**
```json
{
  "service": "dropbox",
  "auth_code": "auth_code_from_oauth",
  "settings": {
    "auto_upload": true,
    "folder_path": "/AI Generated Images",
    "file_naming": "{date}_{prompt_snippet}_{id}"
  }
}
```

## Error Handling and Status Codes

### Error Response Format

```json
{
  "error": {
    "type": "validation_error",
    "code": "INVALID_PROMPT",
    "message": "The prompt contains prohibited content",
    "details": {
      "field": "prompt",
      "reason": "nsfw_content_detected",
      "suggestion": "Please modify your prompt to remove inappropriate content"
    },
    "request_id": "req_xyz789",
    "documentation_url": "https://docs.imagegen.app/errors/INVALID_PROMPT"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `FORBIDDEN` | 403 | Access denied to resource |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_REQUEST` | 400 | Request validation failed |
| `INVALID_PROMPT` | 400 | Prompt contains prohibited content |
| `MODEL_NOT_AVAILABLE` | 503 | Selected model temporarily unavailable |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `QUOTA_EXCEEDED` | 402 | Account quota exceeded |
| `INVALID_IMAGE` | 400 | Invalid image format or corrupted file |
| `GENERATION_FAILED` | 500 | Image generation failed |
| `TIMEOUT` | 504 | Request timed out |
| `MAINTENANCE` | 503 | API under maintenance |

### Status Codes

| Status | Description |
|--------|-------------|
| 200 OK | Successful request |
| 201 Created | Resource created successfully |
| 202 Accepted | Request accepted for processing |
| 204 No Content | Successful request with no response body |
| 400 Bad Request | Invalid request parameters |
| 401 Unauthorized | Authentication required |
| 403 Forbidden | Access denied |
| 404 Not Found | Resource not found |
| 429 Too Many Requests | Rate limit exceeded |
| 500 Internal Server Error | Server error |
| 503 Service Unavailable | Service temporarily unavailable |

## SDKs and Client Libraries

### Official SDKs

#### JavaScript/TypeScript

```bash
npm install @imagegen/sdk
```

```javascript
import { ImageGenClient } from '@imagegen/sdk';

const client = new ImageGenClient({
  apiKey: 'your_api_key',
  baseURL: 'https://api.imagegen.app'
});

// Generate image
const result = await client.generate.textToImage({
  prompt: 'A futuristic city at night',
  model: 'stable-diffusion-xl',
  parameters: {
    width: 1024,
    height: 1024,
    numOutputs: 1
  }
});

console.log(result.images[0].url);
```

#### Python

```bash
pip install imagegen-sdk
```

```python
from imagegen import ImageGenClient

client = ImageGenClient(api_key="your_api_key")

# Generate image
result = client.generate.text_to_image(
    prompt="A serene mountain landscape",
    model="stable-diffusion-xl",
    parameters={
        "width": 1024,
        "height": 1024,
        "num_outputs": 2
    }
)

for image in result.images:
    print(f"Generated image: {image.url}")
```

#### Swift (iOS/macOS)

```swift
import ImageGenSDK

let client = ImageGenClient(apiKey: "your_api_key")

// Generate image
let request = TextToImageRequest(
    prompt: "A magical forest with glowing mushrooms",
    model: "stable-diffusion-xl",
    parameters: GenerationParameters(
        width: 1024,
        height: 1024,
        numOutputs: 1
    )
)

do {
    let result = try await client.generate.textToImage(request)
    if let firstImage = result.images.first {
        print("Generated image URL: \(firstImage.url)")
    }
} catch {
    print("Generation failed: \(error)")
}
```

#### Go

```go
package main

import (
    "fmt"
    "github.com/imagegen/imagegen-go"
)

func main() {
    client := imagegen.NewClient("your_api_key")
    
    result, err := client.Generate.TextToImage(&imagegen.TextToImageRequest{
        Prompt: "A retro 80s synthwave sunset",
        Model:  "stable-diffusion-xl",
        Parameters: &imagegen.GenerationParameters{
            Width:      1024,
            Height:     1024,
            NumOutputs: 1,
        },
    })
    
    if err != nil {
        panic(err)
    }
    
    fmt.Printf("Generated image: %s\n", result.Images[0].URL)
}
```

### Example Integrations

#### React Component

```jsx
import { useState } from 'react';
import { ImageGenClient } from '@imagegen/sdk';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const client = new ImageGenClient({ 
    apiKey: process.env.REACT_APP_IMAGEGEN_API_KEY 
  });
  
  const generateImage = async () => {
    setLoading(true);
    try {
      const result = await client.generate.textToImage({
        prompt,
        model: 'stable-diffusion-xl',
        parameters: { width: 1024, height: 1024 }
      });
      setImages(result.images);
    } catch (error) {
      console.error('Generation failed:', error);
    }
    setLoading(false);
  };
  
  return (
    <div>
      <input 
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
      />
      <button onClick={generateImage} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
      <div className="image-grid">
        {images.map(img => (
          <img key={img.id} src={img.url} alt="Generated" />
        ))}
      </div>
    </div>
  );
};
```

#### cURL Examples

```bash
# Text-to-Image Generation
curl -X POST https://api.imagegen.app/api/v2/generate/text-to-image \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cyberpunk street scene at night",
    "model": "stable-diffusion-xl",
    "parameters": {
      "width": 1024,
      "height": 1024,
      "num_outputs": 1
    }
  }'

# Check generation status
curl -X GET https://api.imagegen.app/api/v2/generations/gen_abc123 \
  -H "Authorization: Bearer YOUR_API_KEY"

# List models
curl -X GET https://api.imagegen.app/api/v2/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Best Practices

### Prompt Engineering

1. **Be Specific**: Include details about style, lighting, composition
2. **Use Negative Prompts**: Explicitly exclude unwanted elements
3. **Reference Styles**: Mention artistic styles or photographers
4. **Composition Terms**: Use photography terms like "rule of thirds", "depth of field"

### Performance Optimization

1. **Batch Requests**: Generate multiple variations in a single request
2. **Use Webhooks**: Avoid polling for long-running operations
3. **Cache Results**: Store generated images locally when possible
4. **Optimize Sizes**: Use appropriate dimensions for your use case

### Security

1. **Secure API Keys**: Never expose keys in client-side code
2. **Validate Inputs**: Sanitize user prompts before sending
3. **Use HTTPS**: Always use secure connections
4. **Implement Rate Limiting**: Add client-side rate limiting

### Cost Management

1. **Monitor Usage**: Track credit consumption via API or dashboard
2. **Set Budgets**: Configure spending limits and alerts
3. **Use Lower Steps**: Reduce inference steps for drafts
4. **Optimize Models**: Choose appropriate models for each use case

---

*For additional resources, visit our [Developer Portal](https://developers.imagegen.app)*