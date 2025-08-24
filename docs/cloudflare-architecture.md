# Cloudflare Architecture for ASCII Platform

## 🚀 Recommended Cloudflare Stack

### Core Services to Implement

#### 1. **R2 Object Storage** (Primary Storage)
**Use Cases:**
- Store generated ASCII art frames as JSON files
- Store chat attachments and media files  
- Export/download archives (ZIP files)
- Backup ASCII collections
- Store user avatars and project images

**Implementation:**
```typescript
// Store ASCII artwork
const artworkKey = `artworks/${userId}/${artworkId}.json`;
await env.R2_BUCKET.put(artworkKey, JSON.stringify(frames));

// Store with metadata
await env.R2_BUCKET.put(key, data, {
  customMetadata: {
    userId,
    visibility: 'public',
    createdAt: new Date().toISOString()
  }
});
```

#### 2. **KV Namespace** (High-Speed Cache)
**Use Cases:**
- Cache frequently accessed ASCII artworks
- Store user sessions and preferences
- Cache public gallery listings
- Rate limiting counters
- Temporary share URLs
- Hot ASCII templates

**Implementation:**
```typescript
// Cache ASCII artwork with TTL
await env.KV_CACHE.put(
  `ascii:${artworkId}`,
  JSON.stringify(artwork),
  { expirationTtl: 3600 } // 1 hour cache
);

// Session storage
await env.KV_SESSION.put(
  `session:${sessionId}`,
  JSON.stringify(userData),
  { expirationTtl: 86400 } // 24 hours
);
```

#### 3. **D1 Database** (Edge SQL)
**Use Cases:**
- Lightweight metadata storage
- ASCII artwork indexes
- Share links and permissions
- User preferences
- Gallery search indexes

**Why D1 over PostgreSQL:**
- Edge-native, no connection overhead
- Perfect for read-heavy workloads (galleries)
- Global read replicas
- Lower latency for metadata queries
- Keep Neon PostgreSQL for complex relational data

**Implementation:**
```sql
-- D1 schema for ASCII metadata
CREATE TABLE ascii_metadata (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  prompt TEXT,
  r2_key TEXT NOT NULL,
  visibility TEXT DEFAULT 'private',
  views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_visibility (visibility),
  INDEX idx_created (created_at DESC)
);
```

#### 4. **Durable Objects** (Real-time Features)
**Use Cases:**
- Live ASCII generation streaming
- Collaborative ASCII editing sessions
- Real-time viewer count
- Animation playback synchronization
- Rate limiting per user

**Implementation:**
```typescript
export class ASCIIGenerationRoom extends DurableObject {
  async handleWebSocket(request: Request) {
    const ws = new WebSocketPair();
    this.state.acceptWebSocket(ws[1]);
    
    // Broadcast generation progress
    this.broadcast({
      type: 'frame',
      data: generatedFrame,
      progress: 0.5
    });
    
    return new Response(null, { 
      status: 101,
      webSocket: ws[0]
    });
  }
}
```

#### 5. **Queues** (Background Processing)
**Use Cases:**
- Batch ASCII frame generation
- Export processing (create ZIP files)
- Thumbnail generation
- Analytics event processing
- Email notifications

**Implementation:**
```typescript
// Queue ASCII generation job
await env.ASCII_QUEUE.send({
  type: 'generate',
  userId,
  prompt,
  frames: 10,
  style: 'dense'
});

// Consumer worker
export default {
  async queue(batch, env) {
    for (const message of batch.messages) {
      await processASCIIGeneration(message.body);
      message.ack();
    }
  }
};
```

### Additional Services to Consider

#### 6. **Analytics Engine** (Usage Metrics)
- Track ASCII generation usage
- Monitor popular prompts/styles
- User engagement metrics
- API usage for billing

#### 7. **Images** (Thumbnail Generation)
- Generate preview images from ASCII
- Create social media cards
- Optimize avatars

#### 8. **Stream** (Video Processing)
- Future: ASCII to video conversion
- Live streaming ASCII animations

## 📋 Migration Plan

### Phase 1: Storage Migration
1. Implement R2 for all file storage
2. Move session data to KV
3. Keep PostgreSQL for now

### Phase 2: Edge Database
1. Create D1 for metadata
2. Sync critical data from PostgreSQL
3. Use D1 for read-heavy queries

### Phase 3: Real-time Features
1. Add Durable Objects for live features
2. Implement WebSocket rooms
3. Add collaborative editing

### Phase 4: Background Jobs
1. Move async tasks to Queues
2. Implement batch processing
3. Add export pipeline

## 🏗️ Architecture Benefits

**Why This Stack:**
- **Global Performance**: Edge-native services reduce latency
- **Cost Efficiency**: No egress fees with R2, pay-per-use model
- **Scalability**: Auto-scaling, no infrastructure management
- **Developer Experience**: Unified platform, single deployment
- **Real-time Capable**: Durable Objects enable live features

## 📁 Updated Project Structure

```
apps/
  api/
    src/
      bindings.d.ts       # Cloudflare service bindings
      storage/
        r2.ts             # R2 operations
        kv.ts             # KV cache layer
        d1.ts             # D1 metadata
      realtime/
        durable-objects/  # DO classes
      queues/
        consumers/        # Queue processors
```

## 🔧 Environment Configuration

```toml
# wrangler.toml
name = "ascii-api"

# R2 Buckets
[[r2_buckets]]
binding = "ARTWORK_BUCKET"
bucket_name = "ascii-artworks"

[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "ascii-media"

# KV Namespaces
[[kv_namespaces]]
binding = "CACHE"
id = "ascii-cache"

[[kv_namespaces]]
binding = "SESSIONS"
id = "ascii-sessions"

# D1 Database
[[d1_databases]]
binding = "METADATA_DB"
database_name = "ascii-metadata"
database_id = "xxx"

# Durable Objects
[[durable_objects.bindings]]
name = "GENERATION_ROOM"
class_name = "ASCIIGenerationRoom"

# Queues
[[queues.producers]]
binding = "GENERATION_QUEUE"
queue = "ascii-generation"

[[queues.consumers]]
queue = "ascii-generation"
max_batch_size = 10
```

## 🎯 Implementation Priority

1. **Immediate**: R2 for storage (replace any GCS/Vercel Blob)
2. **High**: KV for caching and sessions
3. **Medium**: D1 for metadata (can run parallel with PostgreSQL)
4. **Future**: Durable Objects for real-time features
5. **Future**: Queues for background processing

This architecture leverages Cloudflare's entire ecosystem for a truly edge-native ASCII platform!