# Platform Architecture Overview

Welcome to the architecture documentation for our AI platform. This documentation covers the technical architecture, design decisions, and system components for both **Arbor** (AI Agent Platform) and **Kumori** (AI Image Generation).

## Platform Architecture

Our platform consists of two complementary products that share common infrastructure:

- **[Arbor](../products/arbor/architecture/)** - AI Agent Platform for building and deploying intelligent agents
- **[Kumori](../products/kumori/architecture/)** - AI-powered image generation with advanced filtering and management

## Key Architecture Documents

### Platform Overview
- [Platform Architecture Overview](platform-overview.md) - How services interact and share infrastructure
- [System Integration](system-overview.md) - Overall system architecture and data flow
- [Apps & Packages Integration](apps-packages-integration.md) - Monorepo structure and component relationships

### Product-Specific Architecture

#### Arbor Architecture
- [Arbor System Overview](../products/arbor/architecture/system-overview.md)
- [Agent Architecture](../products/arbor/architecture/agent-architecture.md)
- [Memory & Persistence](../products/arbor/architecture/memory-persistence.md)

#### Kumori Architecture
- [Kumori System Architecture](../products/kumori/architecture/system-architecture.md)
- [Image Generation System](../products/kumori/architecture/image-generation-system.md)
- [Image Asset Management](../products/kumori/architecture/image-asset-management.md)
- [UI-First Development](../products/kumori/architecture/ui-first-development.md)

### Data Flow & Integration
- [Data Flow Diagrams](data-flow-diagrams.md) - Visual representation of data movement
- [API Integration Points](../api/integration-points.md) - Service communication patterns

### Infrastructure & Deployment
- [Deployment Architecture](deployment-architecture.md) - Cloud infrastructure and deployment patterns
- [Shared Services](shared-services.md) - Authentication, analytics, storage, and other shared components

## Architecture Principles

### 1. Modular Design
- Clear separation of concerns between products
- Shared components in packages for reusability
- Independent deployment capabilities

### 2. Scalability First
- Horizontal scaling for all services
- Stateless application design
- Efficient caching strategies

### 3. Developer Experience
- TypeScript throughout the stack
- Consistent API patterns
- Comprehensive documentation

### 4. Security & Privacy
- Zero-knowledge architecture where applicable
- End-to-end encryption for sensitive data
- Secure key management

## Technology Stack

### Core Technologies
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Node.js, TypeScript, Mastra Framework
- **Database**: PostgreSQL (Neon), Redis
- **AI/ML**: OpenAI, Anthropic Claude, Replicate
- **Infrastructure**: Vercel, Cloudflare

### Shared Services
- **Authentication**: Clerk
- **Analytics**: PostHog
- **Monitoring**: Sentry, Better Stack
- **Storage**: Cloudflare R2, Vercel Blob

## Getting Started

1. Review the [Platform Architecture Overview](platform-overview.md)
2. Explore product-specific architectures:
   - [Arbor Architecture](../products/arbor/architecture/)
   - [Kumori Architecture](../products/kumori/architecture/)
3. Check [Decision Records](decision-records/) for architectural decisions

## Contributing

When making architectural changes:
1. Document decisions in [Decision Records](decision-records/)
2. Update relevant architecture diagrams
3. Ensure consistency across both products
4. Consider impact on shared infrastructure

## Navigation

- [← Back to Documentation Home](../README.md)
- [Platform Overview →](platform-overview.md)
- [Arbor Architecture →](../products/arbor/architecture/)
- [Kumori Architecture →](../products/kumori/architecture/)