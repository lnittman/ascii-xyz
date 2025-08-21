# Unified API Reference

This document provides a complete reference for all API endpoints across both Kumori and Arbor services.

## Table of Contents

- [Authentication](#authentication)
- [Common Headers](#common-headers)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Kumori Endpoints](#kumori-endpoints)
- [Arbor Endpoints](#arbor-endpoints)
- [Webhook Events](#webhook-events)

## Authentication

All API endpoints require authentication using one of the following methods:

### API Key Authentication
```http
Authorization: Bearer <api_key>
X-API-Key: <api_key>
```

### OAuth 2.0 Authentication
```http
Authorization: Bearer <access_token>
```

## Common Headers

Required and recommended headers for all API requests:

```http
Content-Type: application/json
Accept: application/json
X-Client-Version: <sdk_version>
X-Request-ID: <unique_request_id>
```

## Rate Limiting

Rate limits apply across all services:

| Tier | Requests/Minute | Requests/Hour | Requests/Day |
|------|----------------|---------------|--------------|
| Free | 10 | 100 | 1,000 |
| Basic | 60 | 1,000 | 10,000 |
| Pro | 300 | 5,000 | 50,000 |
| Enterprise | Custom | Custom | Custom |

Rate limit headers:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1640995200
X-RateLimit-Reset-After: 3600
```

## Error Handling

All endpoints use consistent error response format:

```json
{
  "error": {
    "type": "error_type",
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "request_id": "req_xyz789",
    "documentation_url": "https://docs.platform.app/errors/ERROR_CODE"
  }
}
```

### Common Status Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 202 | Accepted |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Kumori Endpoints

### Image Generation

#### POST `/api/v2/generate/text-to-image`
Generate images from text descriptions.

**Parameters:**
- `prompt` (string, required): Text description
- `negative_prompt` (string): Things to avoid
- `model` (string): Model ID
- `parameters` (object): Generation parameters
  - `width` (integer): 64-2048 pixels
  - `height` (integer): 64-2048 pixels
  - `num_outputs` (integer): 1-4 images
  - `num_inference_steps` (integer): 10-150 steps
  - `guidance_scale` (float): 1.0-20.0
  - `seed` (integer): Random seed
- `style` (object): Style configuration
- `output` (object): Output format settings
- `webhook_url` (string): Callback URL
- `metadata` (object): Custom metadata

#### POST `/api/v2/generate/image-to-image`
Transform existing images based on prompts.

**Parameters:**
- `init_image` (string, required): Source image URL
- `prompt` (string, required): Transformation prompt
- `strength` (float): 0.0-1.0 transformation strength
- `model` (string): Model ID
- `parameters` (object): Generation parameters
- `preserve` (object): Preservation settings

#### POST `/api/v2/generate/inpaint`
Selectively edit parts of an image.

**Parameters:**
- `init_image` (string, required): Original image URL
- `mask_image` (string, required): Mask image URL
- `prompt` (string, required): Inpainting prompt
- `model` (string): Model ID
- `parameters` (object): Generation parameters
- `inpaint_mode` (string): Inpainting mode
- `mask_blur` (integer): Mask blur radius
- `preserve_masked_area` (boolean): Preserve masked area

### Image Processing

#### POST `/api/v2/process/filters`
Apply filters and effects to images.

**Parameters:**
- `image_url` (string, required): Input image URL
- `filters` (array, required): Array of filter objects
- `output_format` (string): Output format
- `preserve_metadata` (boolean): Keep EXIF data

#### POST `/api/v2/process/remove-background`
Remove or replace image backgrounds.

**Parameters:**
- `image_url` (string, required): Input image URL
- `mode` (string): "remove" or "replace"
- `output_format` (string): Output format
- `edge_smoothing` (boolean): Smooth edges
- `foreground_threshold` (float): Detection threshold

#### POST `/api/v2/process/upscale`
Enhance image resolution using AI.

**Parameters:**
- `image_url` (string, required): Input image URL
- `scale_factor` (integer): 2, 4, or 8
- `model` (string): Upscaling model
- `enhance_faces` (boolean): Face enhancement
- `denoise_strength` (float): Denoising strength

### Model Management

#### GET `/api/v2/models`
List all available AI models.

**Response includes:**
- Model capabilities
- Supported sizes
- Pricing information
- Performance metrics

#### GET `/api/v2/models/{model_id}`
Get detailed information about a specific model.

### Gallery Management

#### GET `/api/v2/gallery`
Retrieve user's image gallery.

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `sort` (string): Sort field
- `order` (string): asc/desc
- `tags` (string): Comma-separated tags
- `model` (string): Filter by model
- `date_from` (string): Start date
- `date_to` (string): End date

#### POST `/api/v2/gallery/items`
Add image to gallery.

**Parameters:**
- `image_id` (string, required): Image ID
- `title` (string): Image title
- `description` (string): Description
- `tags` (array): Tags
- `is_public` (boolean): Public visibility
- `collections` (array): Collection IDs

## Arbor Endpoints

### Chat Management

#### POST `/api/chats`
Create a new chat session.

**Parameters:**
- `projectId` (string): Project ID
- `name` (string): Chat name
- `model` (string): AI model
- `systemPrompt` (string): System instructions
- `temperature` (float): 0.0-2.0
- `maxTokens` (integer): Max response tokens
- `metadata` (object): Custom metadata

#### GET `/api/chats`
List all chat sessions.

**Query Parameters:**
- `projectId` (string): Filter by project
- `page` (integer): Page number
- `limit` (integer): Items per page
- `sort` (string): Sort field
- `order` (string): asc/desc

#### GET `/api/chats/{chatId}`
Get chat session with messages.

#### PATCH `/api/chats/{chatId}`
Update chat session.

**Parameters:**
- `name` (string): New name
- `systemPrompt` (string): New prompt
- `metadata` (object): Updated metadata

#### DELETE `/api/chats/{chatId}`
Delete chat session.

### Chat Interaction

#### POST `/api/chat`
Send message with streaming response.

**Parameters:**
- `chatId` (string, required): Chat session ID
- `message` (string, required): User message
- `attachments` (array): File attachments
- `context` (object): Additional context

**Response:** Server-Sent Events stream

#### POST `/api/chat/message`
Send message with complete response.

**Parameters:**
- `chatId` (string, required): Chat session ID
- `message` (string, required): User message

### Project Management

#### POST `/api/projects`
Create a new project.

**Parameters:**
- `name` (string, required): Project name
- `description` (string): Description
- `settings` (object): Project settings
- `metadata` (object): Custom metadata

#### GET `/api/projects`
List all projects.

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `sort` (string): Sort field
- `search` (string): Search term

#### GET `/api/projects/{projectId}`
Get project details.

#### PATCH `/api/projects/{projectId}`
Update project.

**Parameters:**
- `name` (string): New name
- `description` (string): New description
- `settings` (object): Updated settings

#### DELETE `/api/projects/{projectId}`
Delete project and all data.

### User Management

#### GET `/api/users/profile`
Get current user profile.

#### PATCH `/api/users/preferences`
Update user preferences.

**Parameters:**
- `defaultModel` (string): Default AI model
- `theme` (string): UI theme
- `notifications` (object): Notification settings

### Agent Configuration

#### POST `/api/agents`
Create custom AI agent.

**Parameters:**
- `name` (string, required): Agent name
- `description` (string): Description
- `model` (string): AI model
- `systemPrompt` (string): Instructions
- `tools` (array): Enabled tools
- `memory` (object): Memory configuration
- `workflows` (array): Workflows

### Memory Operations

#### POST `/api/memory`
Store information in memory.

**Parameters:**
- `chatId` (string, required): Chat ID
- `type` (string): Memory type
- `content` (string): Content to store
- `metadata` (object): Metadata

#### POST `/api/memory/query`
Query memory.

**Parameters:**
- `chatId` (string, required): Chat ID
- `query` (string, required): Search query
- `limit` (integer): Result limit
- `threshold` (float): Relevance threshold

### Tool Execution

#### POST `/api/tools/execute`
Execute a tool.

**Parameters:**
- `chatId` (string, required): Chat ID
- `tool` (string, required): Tool name
- `input` (object, required): Tool input

## Webhook Events

### Kumori Events

#### `generation.completed`
Triggered when image generation completes.

```json
{
  "event": "generation.completed",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "generation_id": "gen_abc123",
    "user_id": "user_123",
    "model": "stable-diffusion-xl",
    "images": [...]
  }
}
```

#### `generation.failed`
Triggered when generation fails.

#### `process.completed`
Triggered when image processing completes.

### Arbor Events

#### `chat.message.created`
Triggered when a new message is created.

```json
{
  "event": "chat.message.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "chatId": "chat_abc123",
    "messageId": "msg_001",
    "role": "assistant",
    "content": "...",
    "projectId": "proj_123"
  }
}
```

#### `project.updated`
Triggered when project is updated.

#### `agent.error`
Triggered when agent encounters an error.

## SDK Support

Official SDKs are available for:
- JavaScript/TypeScript
- Python
- Swift (iOS/macOS)
- Go

See individual service documentation for SDK examples.

## API Versioning

The API uses URL versioning:
- Current version: v2
- Legacy support: v1 (deprecated)

Version in URL: `/api/v2/endpoint`

## Deprecation Policy

- Deprecated endpoints marked in documentation
- 6-month deprecation notice
- Migration guides provided
- Legacy endpoints maintained for 12 months

---

*Last updated: January 2024*