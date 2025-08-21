# Documentation Guide Hub

Welcome to the unified documentation guide hub for the platform. This page provides organized access to all guides across both Kumori and Arbor products.

## Quick Start

- [Platform Getting Started Guide](./getting-started.md) - Start here for an overview of the entire platform
- [Development Setup](./development-setup.md) - Set up your local development environment

## By Audience

### For Developers

#### Platform Development
- [Development Setup](./development-setup.md) - Set up your local development environment
- [Testing Strategy](./testing-strategy.md) - Learn about our testing approach
- [Deployment Guide](./deployment.md) - Deploy applications to production
- [Platform Integration Guide](./platform-integration.md) - Integrate Kumori and Arbor

#### Product-Specific Development

**Kumori (Image Generation)**
- [Quick Start Guide](../products/kumori/guides/quick-start.md) - Get started with Kumori
- [Image Generation Guide](../products/kumori/guides/image-generation-guide.md) - Deep dive into image generation
- [Filter Creation](../products/kumori/guides/filter-creation.md) - Create custom image filters
- [Troubleshooting](../products/kumori/guides/troubleshooting.md) - Common issues and solutions

**Arbor (AI Agents)**
- [Getting Started](./getting-started.md) - Platform overview with Arbor focus
- [Agent Development](../products/arbor/implementation/README.md) - Build AI agents
- [Memory & Persistence](../products/arbor/architecture/memory-persistence.md) - Agent memory systems

### For Users

#### Kumori Users
- [Image Generation Guide](../products/kumori/guides/image-generation-guide.md) - Create AI-generated images
- [Prompt Best Practices](../products/kumori/prompts/best-practices.md) - Write effective prompts
- [Style Guides](../products/kumori/prompts/README.md) - Explore different artistic styles

#### Arbor Users
- [Platform Overview](./getting-started.md) - Understand the AI agent platform
- [Chat Interface Guide](../products/arbor/overview.md) - Interact with AI agents

### For System Administrators
- [Deployment Guide](./deployment.md) - Deploy and manage production systems
- [Environment Configuration](../state/environment-variables.md) - Configure system settings
- [Integration Status](../state/integration-status.md) - Monitor system integrations

## Learning Paths

### Path 1: Full-Stack Developer
1. [Development Setup](./development-setup.md)
2. [Platform Getting Started](./getting-started.md)
3. [Testing Strategy](./testing-strategy.md)
4. [Platform Integration](./platform-integration.md)
5. Product deep dives:
   - [Kumori Quick Start](../products/kumori/guides/quick-start.md)
   - [Arbor Architecture](../products/arbor/architecture/system-overview.md)

### Path 2: Image Generation Specialist
1. [Kumori Quick Start](../products/kumori/guides/quick-start.md)
2. [Image Generation Guide](../products/kumori/guides/image-generation-guide.md)
3. [Prompt Best Practices](../products/kumori/prompts/best-practices.md)
4. Style exploration:
   - [Photorealistic](../products/kumori/prompts/photorealistic.md)
   - [Fantasy](../products/kumori/prompts/fantasy.md)
   - [Chibi](../products/kumori/prompts/chibi.md)
5. [Filter Creation](../products/kumori/guides/filter-creation.md)

### Path 3: AI Agent Developer
1. [Platform Getting Started](./getting-started.md)
2. [Arbor Overview](../products/arbor/overview.md)
3. [Agent Architecture](../products/arbor/architecture/agent-architecture.md)
4. [Memory Systems](../products/arbor/architecture/memory-persistence.md)
5. Implementation guides:
   - [Memory Persistence](../products/arbor/implementation/agent-1-memory-persistence-architect.md)
   - [Output Systems](../products/arbor/implementation/agent-2-output-systems-engineer.md)
   - [Workspace Integration](../products/arbor/implementation/agent-3-workspace-integration-specialist.md)

### Path 4: Platform Integrator
1. [Platform Getting Started](./getting-started.md)
2. [Platform Integration Guide](./platform-integration.md)
3. [Kumori API](../products/kumori/api/README.md)
4. [Arbor API](../products/arbor/api/README.md)
5. [Deployment Guide](./deployment.md)

## Common Use Cases

### Generate Images from Chat
Learn how to use Arbor agents to generate images through Kumori:
- [Platform Integration Guide](./platform-integration.md)
- [Image Generation Guide](../products/kumori/guides/image-generation-guide.md)

### Analyze Images with AI
Use Arbor's AI agents to analyze Kumori-generated images:
- [Platform Integration Guide](./platform-integration.md)
- [Agent Architecture](../products/arbor/architecture/agent-architecture.md)

### Build Custom Workflows
Create automated workflows combining both products:
- [Platform Integration Guide](./platform-integration.md)
- [Workflow Examples](../implementation/daemon-integration/README.md)

## Best Practices

### Development Best Practices
- [Testing Strategy](./testing-strategy.md)
- [Development Setup](./development-setup.md)
- [Code Organization](../architecture/apps-packages-integration.md)

### Prompt Engineering
- [Kumori Prompt Best Practices](../products/kumori/prompts/best-practices.md)
- [Style-Specific Guides](../products/kumori/prompts/README.md)

### Production Deployment
- [Deployment Guide](./deployment.md)
- [Environment Configuration](../state/environment-variables.md)

## Additional Resources

### Architecture Documentation
- [Platform Overview](../platform/overview.md)
- [Kumori Architecture](../products/kumori/architecture/system-architecture.md)
- [Arbor Architecture](../products/arbor/architecture/system-overview.md)

### API References
- [Kumori API](../products/kumori/api/README.md)
- [Arbor API](../products/arbor/api/README.md)

### Troubleshooting
- [Kumori Troubleshooting](../products/kumori/guides/troubleshooting.md)
- [Integration Status](../state/integration-status.md)

## Contributing

To add new guides or improve existing documentation:
1. Follow the established structure
2. Include clear examples and code snippets
3. Add appropriate cross-references
4. Update this hub page with new guides

For questions or suggestions, please refer to the [Platform Roadmap](../platform/roadmap.md).