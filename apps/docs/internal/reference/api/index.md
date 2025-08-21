# Unified API Documentation

## Overview

Welcome to the unified API documentation for our platform. We provide comprehensive APIs across two main services:

- **Kumori**: AI-powered image generation, manipulation, and management
- **Arbor**: AI chat agents, project management, and collaborative workspaces

## Quick Navigation

### 🎨 [Kumori API](/docs/products/kumori/api/)
Advanced image generation and processing capabilities:
- Text-to-image generation with multiple AI models
- Image-to-image transformations
- Background removal and image enhancement
- Filter application and artistic effects

### 🤖 [Arbor API](/docs/products/arbor/api/)
Intelligent AI agents and workspace management:
- AI chat and agent interactions
- Project and workspace management
- Memory persistence and context handling
- Tool integrations and custom workflows

### 📚 [API Reference](/docs/api/reference.md)
Complete reference for all endpoints across both services

## Authentication

Both services use a unified authentication approach powered by Clerk:

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

1. **API Keys**: Generate from your dashboard at `https://dashboard.platform.app/api-keys`
2. **OAuth**: Register your application at `https://dashboard.platform.app/oauth/apps`

For server-side authentication in Arbor, use the `@repo/auth` helpers to verify sessions.

## Base URLs

### Production
- Kumori: `https://api.kumori.app`
- Arbor: `https://api.arbor.xyz`

### Staging
- Kumori: `https://staging-api.kumori.app`
- Arbor: `https://staging-api.arbor.xyz`

### Development
- Kumori: `http://localhost:3000/api`
- Arbor: `http://localhost:3001/api`

## Rate Limiting

Rate limits apply across all services:

| Tier | Requests/Minute | Requests/Hour | Requests/Day |
|------|----------------|---------------|--------------|
| Free | 10 | 100 | 1,000 |
| Basic | 60 | 1,000 | 10,000 |
| Pro | 300 | 5,000 | 50,000 |
| Enterprise | Custom | Custom | Custom |

Rate limit information is included in response headers:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1640995200
```

## Quick Start Examples

### Generate an Image (Kumori)

```javascript
import { KumoriClient } from '@kumori/sdk';

const client = new KumoriClient({
  apiKey: process.env.KUMORI_API_KEY
});

const result = await client.generate.textToImage({
  prompt: 'A serene Japanese garden at sunset',
  model: 'stable-diffusion-xl',
  parameters: {
    width: 1024,
    height: 1024
  }
});

console.log(result.images[0].url);
```

### Create a Chat Session (Arbor)

```javascript
import { ArborClient } from '@arbor/sdk';

const client = new ArborClient({
  apiKey: process.env.ARBOR_API_KEY
});

const chat = await client.chats.create({
  projectId: 'project_123',
  model: 'claude-3-opus',
  systemPrompt: 'You are a helpful AI assistant.'
});

const response = await client.chat.stream({
  chatId: chat.id,
  message: 'Hello, how can you help me today?'
});
```

### Using Both Services Together

```javascript
// Generate an image and analyze it with AI
const image = await kumoriClient.generate.textToImage({
  prompt: 'A complex technical diagram'
});

const analysis = await arborClient.chat.message({
  message: 'Please analyze this technical diagram',
  attachments: [{
    type: 'image',
    url: image.images[0].url
  }]
});
```

## SDKs and Client Libraries

### Official SDKs

#### JavaScript/TypeScript
```bash
npm install @kumori/sdk @arbor/sdk
# or
yarn add @kumori/sdk @arbor/sdk
```

#### Python
```bash
pip install kumori-sdk arbor-sdk
```

#### Swift (iOS/macOS)
```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/platform/kumori-swift.git", from: "1.0.0"),
    .package(url: "https://github.com/platform/arbor-swift.git", from: "1.0.0")
]
```

#### Go
```go
import (
    "github.com/platform/kumori-go"
    "github.com/platform/arbor-go"
)
```

## Error Handling

Both APIs use consistent error response formats:

```json
{
  "error": {
    "type": "validation_error",
    "code": "INVALID_REQUEST",
    "message": "The request validation failed",
    "details": {
      "field": "prompt",
      "reason": "required_field_missing"
    },
    "request_id": "req_xyz789",
    "documentation_url": "https://docs.platform.app/errors/INVALID_REQUEST"
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
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `QUOTA_EXCEEDED` | 402 | Account quota exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Support and Resources

- **Developer Portal**: [https://developers.platform.app](https://developers.platform.app)
- **API Status**: [https://status.platform.app](https://status.platform.app)
- **Community Forum**: [https://community.platform.app](https://community.platform.app)
- **Support**: [support@platform.app](mailto:support@platform.app)

## Next Steps

1. [Explore Kumori API documentation](/docs/products/kumori/api/) for image generation
2. [Explore Arbor API documentation](/docs/products/arbor/api/) for AI agents
3. [View the complete API reference](/docs/api/reference.md)
4. [Join our Discord community](https://discord.gg/platform)