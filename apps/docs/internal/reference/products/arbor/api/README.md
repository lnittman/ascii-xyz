# Arbor API Reference

## Overview

The Arbor API provides powerful AI agent capabilities, project management, and collaborative workspace features. Built on modern technologies including Mastra for agent orchestration, it enables intelligent conversations, memory persistence, and tool integrations.

## Base URL

```
Production: https://api.arbor.xyz
Staging: https://staging-api.arbor.xyz
Development: http://localhost:3001/api
```

## Authentication

Arbor uses Clerk for authentication. All API requests require authentication:

### API Key Authentication
```http
Authorization: Bearer <api_key>
X-API-Key: <api_key>
```

### Server-Side Authentication
For server-side requests, use the `@repo/auth` helpers to verify sessions:

```javascript
import { auth } from '@repo/auth';

const session = await auth();
if (!session) {
  throw new Error('Unauthorized');
}
```

## Common Headers

```http
Content-Type: application/json
Accept: application/json
X-Client-Version: 1.0.0
X-Request-ID: <unique_request_id>
```

## Rate Limiting

Rate limits are shared across the platform. See the [main API documentation](/docs/api/) for details.

## Chat Endpoints

### Create Chat Session

#### POST /api/chats

Create a new chat session with an AI agent.

**Request:**
```json
{
  "projectId": "proj_123",
  "name": "Project Planning Assistant",
  "model": "claude-3-opus",
  "systemPrompt": "You are a helpful project planning assistant with expertise in software development.",
  "temperature": 0.7,
  "maxTokens": 4096,
  "metadata": {
    "tags": ["planning", "development"],
    "priority": "high"
  }
}
```

**Response:**
```json
{
  "id": "chat_abc123",
  "projectId": "proj_123",
  "name": "Project Planning Assistant",
  "model": "claude-3-opus",
  "systemPrompt": "You are a helpful project planning assistant...",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "messageCount": 0,
  "metadata": {
    "tags": ["planning", "development"],
    "priority": "high"
  }
}
```

### List Chat Sessions

#### GET /api/chats

Retrieve all chat sessions for the authenticated user.

**Query Parameters:**
- `projectId` (optional): Filter by project ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sort` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order - asc/desc (default: desc)

**Response:**
```json
{
  "chats": [
    {
      "id": "chat_abc123",
      "projectId": "proj_123",
      "name": "Project Planning Assistant",
      "model": "claude-3-opus",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "lastMessageAt": "2024-01-01T10:30:00Z",
      "messageCount": 15
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Get Chat Session

#### GET /api/chats/{chatId}

Retrieve a specific chat session with messages.

**Response:**
```json
{
  "id": "chat_abc123",
  "projectId": "proj_123",
  "name": "Project Planning Assistant",
  "model": "claude-3-opus",
  "systemPrompt": "You are a helpful project planning assistant...",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "Help me plan a new feature",
      "createdAt": "2024-01-01T10:00:00Z"
    },
    {
      "id": "msg_002",
      "role": "assistant",
      "content": "I'd be happy to help you plan a new feature. Could you tell me more about...",
      "createdAt": "2024-01-01T10:00:05Z",
      "metadata": {
        "tokensUsed": 150,
        "processingTime": 1.2
      }
    }
  ]
}
```

### Update Chat Session

#### PATCH /api/chats/{chatId}

Update chat session properties.

**Request:**
```json
{
  "name": "Updated Planning Assistant",
  "systemPrompt": "You are an expert project planning assistant...",
  "metadata": {
    "tags": ["planning", "agile", "development"]
  }
}
```

### Delete Chat Session

#### DELETE /api/chats/{chatId}

Delete a chat session and all associated messages.

**Response:**
```json
{
  "success": true,
  "deletedAt": "2024-01-01T12:00:00Z"
}
```

## Chat Interaction Endpoints

### Send Message (Streaming)

#### POST /api/chat

Send a message to an AI agent and receive streaming responses.

**Request:**
```json
{
  "chatId": "chat_abc123",
  "message": "What are the best practices for implementing user authentication?",
  "attachments": [
    {
      "type": "file",
      "name": "requirements.md",
      "content": "base64_encoded_content"
    }
  ],
  "context": {
    "recentFiles": ["auth.ts", "user.model.ts"],
    "currentDirectory": "/src/auth"
  }
}
```

**Response:** Server-Sent Events (SSE) stream
```
event: start
data: {"chatId":"chat_abc123","messageId":"msg_003"}

event: token
data: {"content":"Based"}

event: token
data: {"content":" on"}

event: token
data: {"content":" best"}

event: token
data: {"content":" practices"}

event: metadata
data: {"tokensUsed":523,"model":"claude-3-opus"}

event: done
data: {"messageId":"msg_003","totalTokens":523}
```

### Send Message (Non-streaming)

#### POST /api/chat/message

Send a message and receive a complete response.

**Request:**
```json
{
  "chatId": "chat_abc123",
  "message": "Summarize the key points from our discussion"
}
```

**Response:**
```json
{
  "id": "msg_004",
  "chatId": "chat_abc123",
  "role": "assistant",
  "content": "Here's a summary of the key points from our discussion:\n\n1. Authentication best practices...",
  "createdAt": "2024-01-01T10:15:00Z",
  "metadata": {
    "tokensUsed": 245,
    "model": "claude-3-opus",
    "processingTime": 2.1
  }
}
```

## Project Endpoints

### Create Project

#### POST /api/projects

Create a new project workspace.

**Request:**
```json
{
  "name": "E-commerce Platform",
  "description": "Building a modern e-commerce platform with AI features",
  "settings": {
    "defaultModel": "claude-3-opus",
    "enableMemory": true,
    "enableTools": true
  },
  "metadata": {
    "framework": "Next.js",
    "language": "TypeScript",
    "team": ["user_123", "user_456"]
  }
}
```

**Response:**
```json
{
  "id": "proj_123",
  "name": "E-commerce Platform",
  "description": "Building a modern e-commerce platform with AI features",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "settings": {
    "defaultModel": "claude-3-opus",
    "enableMemory": true,
    "enableTools": true
  },
  "metadata": {
    "framework": "Next.js",
    "language": "TypeScript",
    "team": ["user_123", "user_456"]
  },
  "stats": {
    "chatSessions": 0,
    "totalMessages": 0,
    "activeAgents": 0
  }
}
```

### List Projects

#### GET /api/projects

Retrieve all projects for the authenticated user.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `sort`: Sort field
- `search`: Search term

**Response:**
```json
{
  "projects": [
    {
      "id": "proj_123",
      "name": "E-commerce Platform",
      "description": "Building a modern e-commerce platform...",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "stats": {
        "chatSessions": 5,
        "totalMessages": 127,
        "activeAgents": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3
  }
}
```

### Get Project

#### GET /api/projects/{projectId}

Retrieve detailed project information.

**Response:**
```json
{
  "id": "proj_123",
  "name": "E-commerce Platform",
  "description": "Building a modern e-commerce platform with AI features",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "settings": {
    "defaultModel": "claude-3-opus",
    "enableMemory": true,
    "enableTools": true,
    "allowedTools": ["code_interpreter", "web_search", "file_reader"]
  },
  "metadata": {
    "framework": "Next.js",
    "language": "TypeScript",
    "repository": "https://github.com/user/ecommerce-platform",
    "team": ["user_123", "user_456"]
  },
  "stats": {
    "chatSessions": 5,
    "totalMessages": 127,
    "activeAgents": 2,
    "storageUsed": 15728640,
    "lastActivityAt": "2024-01-01T15:30:00Z"
  },
  "recentChats": [
    {
      "id": "chat_abc123",
      "name": "Project Planning Assistant",
      "lastMessageAt": "2024-01-01T15:30:00Z"
    }
  ]
}
```

### Update Project

#### PATCH /api/projects/{projectId}

Update project settings and metadata.

**Request:**
```json
{
  "name": "E-commerce Platform v2",
  "settings": {
    "defaultModel": "claude-3-sonnet",
    "allowedTools": ["code_interpreter", "web_search", "file_reader", "terminal"]
  }
}
```

### Delete Project

#### DELETE /api/projects/{projectId}

Delete a project and all associated data.

**Response:**
```json
{
  "success": true,
  "deletedAt": "2024-01-01T16:00:00Z",
  "deletedItems": {
    "chats": 5,
    "messages": 127,
    "files": 23
  }
}
```

## User Endpoints

### Get User Profile

#### GET /api/users/profile

Retrieve the current user's profile and settings.

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Developer",
  "createdAt": "2023-06-01T00:00:00Z",
  "preferences": {
    "defaultModel": "claude-3-opus",
    "theme": "dark",
    "codeTheme": "monokai",
    "notifications": {
      "email": true,
      "desktop": false
    }
  },
  "usage": {
    "messagesThisMonth": 1523,
    "tokensThisMonth": 523890,
    "projectsCreated": 8,
    "activeChatSessions": 12
  },
  "subscription": {
    "plan": "pro",
    "status": "active",
    "renewsAt": "2024-02-01T00:00:00Z"
  }
}
```

### Update User Preferences

#### PATCH /api/users/preferences

Update user preferences and settings.

**Request:**
```json
{
  "defaultModel": "claude-3-sonnet",
  "theme": "light",
  "notifications": {
    "email": true,
    "desktop": true
  }
}
```

## Agent Configuration Endpoints

### Create Agent

#### POST /api/agents

Create a custom AI agent with specific capabilities.

**Request:**
```json
{
  "name": "Code Review Agent",
  "description": "Specialized agent for code review and best practices",
  "model": "claude-3-opus",
  "systemPrompt": "You are an expert code reviewer...",
  "tools": ["code_interpreter", "git_integration"],
  "memory": {
    "type": "persistent",
    "vectorStore": "pinecone"
  },
  "workflows": ["code_review", "security_audit"]
}
```

**Response:**
```json
{
  "id": "agent_789",
  "name": "Code Review Agent",
  "description": "Specialized agent for code review and best practices",
  "createdAt": "2024-01-01T00:00:00Z",
  "model": "claude-3-opus",
  "capabilities": {
    "tools": ["code_interpreter", "git_integration"],
    "memory": {
      "type": "persistent",
      "vectorStore": "pinecone"
    },
    "workflows": ["code_review", "security_audit"]
  },
  "status": "active"
}
```

## Memory and Context Endpoints

### Store Memory

#### POST /api/memory

Store information in the agent's long-term memory.

**Request:**
```json
{
  "chatId": "chat_abc123",
  "type": "fact",
  "content": "The user prefers TypeScript over JavaScript",
  "metadata": {
    "confidence": 0.95,
    "source": "conversation",
    "timestamp": "2024-01-01T10:30:00Z"
  }
}
```

### Query Memory

#### POST /api/memory/query

Search the agent's memory for relevant information.

**Request:**
```json
{
  "chatId": "chat_abc123",
  "query": "user preferences for programming languages",
  "limit": 5,
  "threshold": 0.7
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "mem_001",
      "content": "The user prefers TypeScript over JavaScript",
      "relevanceScore": 0.92,
      "metadata": {
        "confidence": 0.95,
        "source": "conversation",
        "timestamp": "2024-01-01T10:30:00Z"
      }
    }
  ]
}
```

## Tool Integration Endpoints

### Execute Tool

#### POST /api/tools/execute

Execute a specific tool within a chat context.

**Request:**
```json
{
  "chatId": "chat_abc123",
  "tool": "code_interpreter",
  "input": {
    "code": "const sum = (a, b) => a + b;\nconsole.log(sum(5, 3));",
    "language": "javascript"
  }
}
```

**Response:**
```json
{
  "id": "exec_123",
  "tool": "code_interpreter",
  "status": "completed",
  "output": {
    "stdout": "8\n",
    "stderr": "",
    "exitCode": 0,
    "executionTime": 0.045
  }
}
```

## Webhooks

### Configure Webhooks

#### POST /api/webhooks

Set up webhooks for various events.

**Request:**
```json
{
  "url": "https://your-app.com/webhooks/arbor",
  "events": ["chat.message.created", "project.updated", "agent.error"],
  "secret": "webhook_secret_key",
  "active": true
}
```

### Webhook Events

#### Chat Message Created
```json
{
  "event": "chat.message.created",
  "timestamp": "2024-01-01T10:30:00Z",
  "data": {
    "chatId": "chat_abc123",
    "messageId": "msg_004",
    "role": "assistant",
    "content": "I've analyzed your code...",
    "projectId": "proj_123"
  }
}
```

## Error Handling

Arbor uses `ApiError` from `@repo/api` to standardize error responses:

```json
{
  "error": {
    "type": "validation_error",
    "code": "INVALID_CHAT_ID",
    "message": "The specified chat ID does not exist",
    "details": {
      "chatId": "chat_invalid"
    },
    "request_id": "req_xyz789"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `CHAT_NOT_FOUND` | 404 | Chat session not found |
| `PROJECT_NOT_FOUND` | 404 | Project not found |
| `MODEL_NOT_AVAILABLE` | 503 | Selected model unavailable |
| `CONTEXT_TOO_LONG` | 400 | Message exceeds context limit |
| `MEMORY_QUOTA_EXCEEDED` | 402 | Memory storage limit exceeded |
| `TOOL_EXECUTION_FAILED` | 500 | Tool execution error |

## SDKs and Examples

### JavaScript/TypeScript SDK

```bash
npm install @arbor/sdk
```

```javascript
import { ArborClient } from '@arbor/sdk';

const client = new ArborClient({
  apiKey: process.env.ARBOR_API_KEY
});

// Create a chat session
const chat = await client.chats.create({
  projectId: 'proj_123',
  name: 'Development Assistant',
  model: 'claude-3-opus'
});

// Send a message with streaming
const stream = await client.chat.stream({
  chatId: chat.id,
  message: 'Help me refactor this function'
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}
```

### Python SDK

```bash
pip install arbor-sdk
```

```python
from arbor import ArborClient

client = ArborClient(api_key="your_api_key")

# Create a project
project = client.projects.create(
    name="AI Research Project",
    description="Exploring AI capabilities"
)

# Create an agent
agent = client.agents.create(
    name="Research Assistant",
    model="claude-3-opus",
    tools=["web_search", "file_reader"]
)

# Start a conversation
chat = client.chats.create(
    project_id=project.id,
    agent_id=agent.id
)

response = client.chat.message(
    chat_id=chat.id,
    message="What are the latest developments in AI?"
)
print(response.content)
```

### cURL Examples

```bash
# Create a chat session
curl -X POST https://api.arbor.xyz/api/chats \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj_123",
    "name": "Planning Assistant",
    "model": "claude-3-opus"
  }'

# Send a message
curl -X POST https://api.arbor.xyz/api/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "chatId": "chat_abc123",
    "message": "Help me plan my project"
  }'
```

## Best Practices

### Agent Design
1. **Clear System Prompts**: Define specific roles and capabilities
2. **Tool Selection**: Choose only necessary tools to reduce complexity
3. **Memory Strategy**: Use persistent memory for long-term projects
4. **Error Handling**: Implement robust error recovery

### Performance Optimization
1. **Streaming Responses**: Use SSE for real-time interactions
2. **Batch Operations**: Process multiple items when possible
3. **Context Management**: Keep context focused and relevant
4. **Caching**: Cache frequently accessed data

### Security
1. **API Key Management**: Rotate keys regularly
2. **Input Validation**: Sanitize all user inputs
3. **Rate Limiting**: Implement client-side throttling
4. **Data Privacy**: Handle sensitive data appropriately

## Integration Points

Arbor integrates with various external services:

- **AI Providers**: Multiple LLM providers via Mastra
- **Email**: Resend for notifications
- **Analytics**: PostHog and Vercel Analytics
- **Version Control**: Git integration for code analysis
- **Cloud Storage**: S3-compatible storage for files

---

*For more information, visit our [Developer Portal](https://developers.arbor.xyz)*