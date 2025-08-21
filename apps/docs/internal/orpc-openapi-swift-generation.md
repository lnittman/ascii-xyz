# 🐙 oRPC OpenAPI to Swift Client Generation Guide

## 🦉 overview

This guide covers how to generate OpenAPI specifications from oRPC routers and create Swift clients for iOS/macOS applications using Apple's Swift OpenAPI Generator.

## 🐊 quick start

### 1. install dependencies

```bash
# in your orpc project
pnpm add @orpc/openapi@latest @orpc/zod@latest
```

### 2. generate openapi specification

```typescript
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { router } from './router';
import { writeFileSync } from 'fs';

const generator = new OpenAPIGenerator({
  schemaConverters: [
    new ZodToJsonSchemaConverter()
  ]
});

const spec = await generator.generate(router, {
  info: {
    title: 'Arbor API',
    version: '1.0.0'
  },
  servers: [
    { url: 'http://localhost:3000/api' },
    { url: 'https://api.arbor.xyz' }
  ]
});

// write spec to file
writeFileSync('./openapi.json', JSON.stringify(spec, null, 2));
```

## 🦝 orpc openapi setup

### defining routes with openapi metadata

```typescript
import { os } from '@orpc/server';
import * as z from 'zod';

// define schemas with descriptions
const ChatSchema = z.object({
  id: z.string().describe('Unique chat identifier'),
  title: z.string().describe('Chat title'),
  createdAt: z.date().describe('Creation timestamp'),
  messages: z.array(MessageSchema).optional()
});

// create restful routes
export const listChats = os
  .route({ 
    method: 'GET', 
    path: '/chats',
    summary: 'List all chats',
    tags: ['Chats']
  })
  .input(z.object({
    limit: z.number().int().min(1).max(100).default(20),
    cursor: z.string().optional()
  }))
  .output(z.object({
    items: z.array(ChatSchema),
    nextCursor: z.string().optional()
  }))
  .handler(async ({ input }) => {
    // implementation
    return { items: [], nextCursor: undefined };
  });

export const createChat = os
  .route({ 
    method: 'POST', 
    path: '/chats',
    summary: 'Create a new chat',
    tags: ['Chats']
  })
  .input(z.object({
    title: z.string().min(1).max(255)
  }))
  .output(ChatSchema)
  .handler(async ({ input }) => {
    // implementation
    return { id: '1', title: input.title, createdAt: new Date() };
  });

// organize in router
export const router = {
  chat: {
    list: listChats,
    create: createChat
  }
};
```

### serving openapi with handler

```typescript
import { createServer } from 'node:http';
import { OpenAPIHandler } from '@orpc/openapi/node';
import { CORSPlugin } from '@orpc/server/plugins';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';

const openAPIHandler = new OpenAPIHandler(router, {
  plugins: [
    new CORSPlugin({
      exposeHeaders: ['Content-Disposition']
    })
  ]
});

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [
    new ZodToJsonSchemaConverter()
  ]
});

const server = createServer(async (req, res) => {
  // handle api requests
  const { matched } = await openAPIHandler.handle(req, res, {
    prefix: '/api'
  });

  if (matched) {
    return;
  }

  // serve openapi spec
  if (req.url === '/openapi.json') {
    const spec = await openAPIGenerator.generate(router, {
      info: {
        title: 'Arbor API',
        version: '1.0.0'
      },
      servers: [
        { url: '/api' }
      ]
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(spec));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(3000);
```

## 🦋 swift client generation

### 1. xcode project setup

1. **add swift packages**
   - `https://github.com/apple/swift-openapi-generator`
   - `https://github.com/apple/swift-openapi-runtime`
   - `https://github.com/apple/swift-openapi-urlsession`

2. **configure build plugin**
   - navigate to target → build phases
   - expand "run build tool plug-ins"
   - add openapigenerator plugin

3. **add required files**
   - `openapi.json` (generated from orpc)
   - `openapi-generator-config.yaml`:

```yaml
generate:
  - types
  - client
accessModifier: public
```

### 2. swift package setup

```swift
// Package.swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ArborAPIClient",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        .library(
            name: "ArborAPIClient",
            targets: ["ArborAPIClient"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-openapi-generator", from: "1.2.0"),
        .package(url: "https://github.com/apple/swift-openapi-runtime", from: "1.3.0"),
        .package(url: "https://github.com/apple/swift-openapi-urlsession", from: "1.0.0")
    ],
    targets: [
        .target(
            name: "ArborAPIClient",
            dependencies: [
                .product(name: "OpenAPIRuntime", package: "swift-openapi-runtime"),
                .product(name: "OpenAPIURLSession", package: "swift-openapi-urlsession")
            ],
            plugins: [
                .plugin(name: "OpenAPIGenerator", package: "swift-openapi-generator")
            ]
        )
    ]
)
```

### 3. using generated swift client

```swift
import OpenAPIRuntime
import OpenAPIURLSession
import Foundation

public class ArborAPIClient {
    private let client: Client
    
    public init(serverURL: URL, token: String? = nil) {
        var transport = URLSessionTransport()
        
        // add authentication if provided
        if let token = token {
            transport = URLSessionTransport(configuration: .init(
                session: {
                    let config = URLSessionConfiguration.default
                    config.httpAdditionalHeaders = [
                        "Authorization": "Bearer \(token)"
                    ]
                    return URLSession(configuration: config)
                }()
            ))
        }
        
        self.client = Client(
            serverURL: serverURL,
            transport: transport
        )
    }
    
    // convenience methods
    public func listChats(limit: Int = 20, cursor: String? = nil) async throws -> [Chat] {
        let response = try await client.get_sol_chats(
            query: .init(
                limit: limit,
                cursor: cursor
            )
        )
        
        switch response {
        case .ok(let okResponse):
            let body = try okResponse.body.json
            return body.items.map { Chat(from: $0) }
        case .undocumented(let statusCode, _):
            throw APIError.unexpectedStatus(statusCode)
        }
    }
}

// models
public struct Chat {
    public let id: String
    public let title: String
    public let createdAt: Date
    
    init(from generated: Components.Schemas.Chat) {
        self.id = generated.id
        self.title = generated.title
        self.createdAt = generated.createdAt
    }
}
```

## 🐝 advanced patterns

### streaming responses

```typescript
// orpc server
import { eventIterator } from '@orpc/server';

export const streamChat = os
  .route({ 
    method: 'POST', 
    path: '/chats/{id}/stream',
    summary: 'Stream chat messages'
  })
  .input(z.object({
    id: z.string(),
    message: z.string()
  }))
  .output(eventIterator(z.object({
    token: z.string(),
    done: z.boolean()
  })))
  .handler(async function* ({ input }) {
    // stream implementation
    for (const token of tokens) {
      yield { token, done: false };
    }
    yield { token: '', done: true };
  });
```

```swift
// swift client
public func streamChat(id: String, message: String) async throws -> AsyncThrowingStream<String, Error> {
    let response = try await client.post_sol_chats_sol__lcub_id_rcub__sol_stream(
        path: .init(id: id),
        body: .json(.init(message: message))
    )
    
    switch response {
    case .ok(let okResponse):
        return AsyncThrowingStream { continuation in
            Task {
                do {
                    for try await event in okResponse.body.text_event_hyphen_stream {
                        if let data = event.data {
                            let decoded = try JSONDecoder().decode(StreamEvent.self, from: Data(data.utf8))
                            if !decoded.done {
                                continuation.yield(decoded.token)
                            } else {
                                continuation.finish()
                            }
                        }
                    }
                } catch {
                    continuation.finish(throwing: error)
                }
            }
        }
    default:
        throw APIError.streamingNotSupported
    }
}
```

### file uploads

```typescript
// orpc server
export const uploadFile = os
  .route({ 
    method: 'POST', 
    path: '/files/upload',
    inputStructure: 'detailed'
  })
  .input(z.object({
    body: z.object({
      file: z.file(),
      metadata: z.object({
        name: z.string(),
        type: z.string()
      })
    })
  }))
  .output(z.object({
    url: z.string(),
    size: z.number()
  }))
  .handler(async ({ input }) => {
    // handle file upload
    return { url: 'https://...', size: 12345 };
  });
```

```swift
// swift client
public func uploadFile(data: Data, name: String, mimeType: String) async throws -> FileUploadResponse {
    let response = try await client.post_sol_files_sol_upload(
        body: .multipartForm([
            .init(
                name: "file",
                filename: name,
                headerFields: [.contentType(mimeType)],
                body: .init(data)
            ),
            .init(
                name: "metadata",
                body: .init(#"{"name":"\#(name)","type":"\#(mimeType)"}"#.data(using: .utf8)!)
            )
        ])
    )
    
    switch response {
    case .ok(let okResponse):
        let body = try okResponse.body.json
        return FileUploadResponse(url: body.url, size: body.size)
    default:
        throw APIError.uploadFailed
    }
}
```

## 🦌 best practices

### 1. schema design
- use descriptive field names
- add `.describe()` to all schemas
- use appropriate zod validations
- consider versioning strategy

### 2. error handling
```typescript
// define typed errors
const errors = {
  UNAUTHORIZED: {
    status: 401,
    message: 'Authentication required'
  },
  NOT_FOUND: {
    status: 404,
    message: 'Resource not found'
  }
};

const base = os.errors(errors);
```

```swift
// handle errors in swift
public enum APIError: Error {
    case unauthorized
    case notFound
    case unexpectedStatus(Int)
    
    init(from statusCode: Int) {
        switch statusCode {
        case 401: self = .unauthorized
        case 404: self = .notFound
        default: self = .unexpectedStatus(statusCode)
        }
    }
}
```

### 3. type safety
- leverage generated types
- create wrapper types for better api
- use async/await throughout
- handle all response cases

### 4. authentication
```swift
public class AuthenticatedClient {
    private var token: String?
    private let baseURL: URL
    
    public func setToken(_ token: String) {
        self.token = token
        // recreate client with new token
    }
    
    public func clearToken() {
        self.token = nil
    }
}
```

## 🐸 troubleshooting

### common issues

1. **plugin disabled error**
   - enable in xcode settings
   - trust the plugin

2. **missing generated files**
   - ensure config file is in target
   - check file naming conventions
   - verify openapi spec validity

3. **type mismatches**
   - use `JsonifiedClient` for dates/bigints
   - handle timezone conversions
   - validate schema compatibility

4. **build failures**
   - clean derived data
   - update package versions
   - check minimum platform versions

### debugging tips

1. **validate openapi spec**
   ```bash
   npx @redocly/cli lint openapi.json
   ```

2. **test endpoints manually**
   ```bash
   curl -X GET http://localhost:3000/api/chats
   ```

3. **check generated code**
   - look in derived data folder
   - verify import statements
   - check for naming conflicts

## 🦚 resources

- [orpc openapi documentation](https://orpc.unnoq.com/openapi/getting-started)
- [swift openapi generator](https://github.com/apple/swift-openapi-generator)
- [openapi specification](https://spec.openapis.org/oas/latest.html)
- [zod documentation](https://zod.dev)

remember: the key to successful api client generation is maintaining consistency between your orpc router definitions and the generated openapi specification. always validate your spec and test the generated client thoroughly.