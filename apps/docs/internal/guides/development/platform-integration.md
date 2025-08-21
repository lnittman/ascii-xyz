# Platform Integration Guide

This guide demonstrates how to integrate Kumori (image generation) and Arbor (AI agents) to create powerful combined workflows.

## Overview

The platform provides seamless integration between:
- **Kumori**: AI-powered image generation with advanced filtering
- **Arbor**: Intelligent AI agents with memory and tool capabilities

## Common Integration Patterns

### 1. Generate Images from Chat

Use Arbor agents to generate images through natural conversation:

```typescript
// Example: Agent with image generation capability
import { createAgent } from '@arbor/sdk';
import { KumoriClient } from '@kumori/client';

const kumoriClient = new KumoriClient({
  apiKey: process.env.KUMORI_API_KEY
});

const imageAgent = createAgent({
  name: 'ImageCreator',
  instructions: 'Help users create images based on their descriptions',
  tools: [
    {
      name: 'generate_image',
      description: 'Generate an image based on a prompt',
      execute: async ({ prompt, style }) => {
        const result = await kumoriClient.generate({
          prompt,
          style: style || 'default',
          width: 1024,
          height: 1024
        });
        return {
          imageUrl: result.url,
          message: `I've created an image based on: "${prompt}"`
        };
      }
    }
  ]
});

// Usage in chat
const response = await imageAgent.chat({
  message: "Create a fantasy landscape with a dragon"
});
```

### 2. Analyze Images with AI

Use Arbor agents to analyze and describe Kumori-generated images:

```typescript
// Example: Image analysis agent
const analysisAgent = createAgent({
  name: 'ImageAnalyzer',
  instructions: 'Analyze images and provide detailed descriptions',
  tools: [
    {
      name: 'analyze_image',
      description: 'Analyze an image and provide insights',
      execute: async ({ imageUrl }) => {
        // Use vision capabilities to analyze the image
        const analysis = await analysisAgent.analyzeImage(imageUrl);
        return {
          description: analysis.description,
          tags: analysis.tags,
          suggestions: analysis.improvements
        };
      }
    }
  ]
});

// Combine with generation
const generated = await kumoriClient.generate({
  prompt: "Cyberpunk city at night"
});

const analysis = await analysisAgent.chat({
  message: `Analyze this image: ${generated.url}`
});
```

### 3. Interactive Image Refinement

Create a feedback loop for iterative image improvement:

```typescript
// Example: Iterative refinement workflow
class ImageRefinementWorkflow {
  constructor(private kumori: KumoriClient, private agent: Agent) {}

  async refineImage(initialPrompt: string, maxIterations = 3) {
    let currentImage = await this.kumori.generate({ prompt: initialPrompt });
    let improvements = [];

    for (let i = 0; i < maxIterations; i++) {
      // Agent analyzes the current image
      const feedback = await this.agent.chat({
        message: `Analyze this image and suggest improvements: ${currentImage.url}`
      });

      if (feedback.satisfied) break;

      // Generate improved version based on feedback
      const refinedPrompt = `${initialPrompt}. Improvements: ${feedback.suggestions.join(', ')}`;
      currentImage = await this.kumori.generate({ prompt: refinedPrompt });
      improvements.push(feedback.suggestions);
    }

    return {
      finalImage: currentImage,
      improvements,
      iterations: improvements.length
    };
  }
}
```

## API Integration Examples

### Basic Integration

```typescript
// Initialize both clients
import { ArborClient } from '@arbor/client';
import { KumoriClient } from '@kumori/client';

const arbor = new ArborClient({ apiKey: process.env.ARBOR_API_KEY });
const kumori = new KumoriClient({ apiKey: process.env.KUMORI_API_KEY });

// Create an integrated workflow
async function generateAndDescribe(userRequest: string) {
  // Use Arbor to enhance the prompt
  const enhancedPrompt = await arbor.agents.enhancePrompt({
    original: userRequest,
    style: 'detailed'
  });

  // Generate image with Kumori
  const image = await kumori.generate({
    prompt: enhancedPrompt.result,
    quality: 'high'
  });

  // Use Arbor to create a description
  const description = await arbor.agents.describeImage({
    imageUrl: image.url
  });

  return {
    image: image.url,
    prompt: enhancedPrompt.result,
    description: description.text
  };
}
```

### Advanced Workflows

```typescript
// Multi-agent collaboration for complex tasks
class CreativeDirector {
  private conceptAgent: Agent;
  private styleAgent: Agent;
  private reviewAgent: Agent;

  async createArtwork(brief: string) {
    // Step 1: Concept development
    const concept = await this.conceptAgent.chat({
      message: `Develop a visual concept for: ${brief}`
    });

    // Step 2: Style recommendation
    const style = await this.styleAgent.chat({
      message: `Recommend art style for concept: ${concept.result}`
    });

    // Step 3: Generate multiple variations
    const variations = await Promise.all(
      style.recommendations.map(s => 
        kumori.generate({
          prompt: concept.result,
          style: s,
          seed: Math.random()
        })
      )
    );

    // Step 4: Review and select
    const review = await this.reviewAgent.chat({
      message: `Review these variations and select the best`,
      images: variations.map(v => v.url)
    });

    return {
      selected: variations[review.selectedIndex],
      reasoning: review.reasoning,
      alternatives: variations
    };
  }
}
```

## Real-World Use Cases

### 1. Content Creation Pipeline

```typescript
// Automated content creation for social media
async function createSocialMediaContent(topic: string) {
  // Generate post content
  const content = await arbor.agents.contentWriter.generate({
    topic,
    platform: 'instagram',
    tone: 'engaging'
  });

  // Extract visual elements from content
  const visualPrompt = await arbor.agents.promptExtractor.extract({
    text: content.caption,
    focusOn: 'visual_elements'
  });

  // Generate matching image
  const image = await kumori.generate({
    prompt: visualPrompt.result,
    aspectRatio: '1:1', // Instagram square
    style: content.suggestedStyle
  });

  // Generate hashtags based on image and content
  const hashtags = await arbor.agents.hashtagGenerator.generate({
    caption: content.caption,
    imageUrl: image.url
  });

  return {
    caption: content.caption,
    image: image.url,
    hashtags: hashtags.tags
  };
}
```

### 2. Educational Material Generation

```typescript
// Create illustrated educational content
async function createEducationalMaterial(topic: string, gradeLevel: string) {
  // Generate lesson content
  const lesson = await arbor.agents.educator.createLesson({
    topic,
    gradeLevel,
    includeVisuals: true
  });

  // Generate illustrations for each concept
  const illustrations = await Promise.all(
    lesson.concepts.map(async (concept) => {
      const illustration = await kumori.generate({
        prompt: `Educational illustration: ${concept.visualDescription}`,
        style: 'educational',
        includeText: false
      });

      return {
        concept: concept.title,
        description: concept.description,
        image: illustration.url
      };
    })
  );

  return {
    lesson: lesson.content,
    illustrations,
    worksheets: lesson.worksheets
  };
}
```

### 3. Product Design Assistant

```typescript
// AI-powered product design workflow
async function designProduct(requirements: ProductRequirements) {
  // Generate design concepts
  const concepts = await arbor.agents.designer.generateConcepts({
    requirements,
    count: 3
  });

  // Create visual mockups
  const mockups = await Promise.all(
    concepts.map(async (concept) => {
      const mockup = await kumori.generate({
        prompt: concept.visualDescription,
        style: 'product_design',
        lighting: 'studio'
      });

      // Get feedback on the mockup
      const feedback = await arbor.agents.designCritic.review({
        imageUrl: mockup.url,
        requirements,
        concept
      });

      return {
        concept,
        mockup: mockup.url,
        feedback: feedback.analysis,
        score: feedback.score
      };
    })
  );

  // Select best design
  const bestDesign = mockups.reduce((best, current) => 
    current.score > best.score ? current : best
  );

  return {
    selected: bestDesign,
    alternatives: mockups.filter(m => m !== bestDesign)
  };
}
```

## Best Practices

### 1. Error Handling

```typescript
// Robust error handling for integrated workflows
async function safeIntegratedOperation(operation: () => Promise<any>) {
  try {
    return await operation();
  } catch (error) {
    if (error.service === 'kumori') {
      // Handle Kumori-specific errors
      console.error('Image generation failed:', error);
      // Fallback to default image or retry
    } else if (error.service === 'arbor') {
      // Handle Arbor-specific errors
      console.error('Agent processing failed:', error);
      // Fallback to simple prompt or retry
    }
    throw error;
  }
}
```

### 2. Rate Limiting

```typescript
// Manage rate limits across services
import { RateLimiter } from '@platform/common';

const kumoriLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000 // 1 minute
});

const arborLimiter = new RateLimiter({
  maxRequests: 1000,
  windowMs: 60000
});

async function rateLimitedGeneration(prompt: string) {
  await kumoriLimiter.acquire();
  return kumori.generate({ prompt });
}
```

### 3. Caching

```typescript
// Cache integration results
import { Cache } from '@platform/cache';

const integrationCache = new Cache({
  ttl: 3600000 // 1 hour
});

async function cachedWorkflow(input: string) {
  const cacheKey = `workflow:${hash(input)}`;
  
  const cached = await integrationCache.get(cacheKey);
  if (cached) return cached;

  const result = await performIntegratedWorkflow(input);
  await integrationCache.set(cacheKey, result);
  
  return result;
}
```

## Configuration

### Environment Variables

```bash
# Kumori Configuration
KUMORI_API_KEY=your_kumori_api_key
KUMORI_API_URL=https://api.kumori.ai

# Arbor Configuration
ARBOR_API_KEY=your_arbor_api_key
ARBOR_API_URL=https://api.arbor.ai

# Shared Configuration
PLATFORM_CACHE_REDIS_URL=redis://localhost:6379
PLATFORM_RATE_LIMIT_ENABLED=true
```

### Integration Settings

```typescript
// config/integration.ts
export const integrationConfig = {
  kumori: {
    defaultStyle: 'balanced',
    maxRetries: 3,
    timeout: 30000
  },
  arbor: {
    defaultModel: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7
  },
  workflows: {
    maxConcurrentJobs: 10,
    resultCacheTTL: 3600
  }
};
```

## Monitoring and Debugging

### Logging Integration Events

```typescript
// Structured logging for integrated workflows
import { Logger } from '@platform/logger';

const logger = new Logger('platform-integration');

async function loggedWorkflow(input: any) {
  const workflowId = generateId();
  
  logger.info('Workflow started', { workflowId, input });
  
  try {
    // Log Arbor operations
    logger.debug('Calling Arbor agent', { workflowId, agent: 'enhancer' });
    const enhanced = await arbor.enhance(input);
    
    // Log Kumori operations
    logger.debug('Generating image', { workflowId, prompt: enhanced });
    const image = await kumori.generate({ prompt: enhanced });
    
    logger.info('Workflow completed', { workflowId, result: image.url });
    return image;
  } catch (error) {
    logger.error('Workflow failed', { workflowId, error });
    throw error;
  }
}
```

### Performance Monitoring

```typescript
// Track performance across services
import { Metrics } from '@platform/metrics';

const metrics = new Metrics();

async function monitoredOperation() {
  const timer = metrics.startTimer('integration.workflow.duration');
  
  try {
    const arborTimer = metrics.startTimer('integration.arbor.duration');
    const arborResult = await arbor.process();
    arborTimer.end();
    
    const kumoriTimer = metrics.startTimer('integration.kumori.duration');
    const kumoriResult = await kumori.generate();
    kumoriTimer.end();
    
    metrics.increment('integration.workflow.success');
    return { arborResult, kumoriResult };
  } catch (error) {
    metrics.increment('integration.workflow.error');
    throw error;
  } finally {
    timer.end();
  }
}
```

## Next Steps

1. Explore the [Kumori API Reference](../products/kumori/api/README.md)
2. Learn about [Arbor Agent Development](../products/arbor/implementation/README.md)
3. Review [Platform Architecture](../architecture/platform-overview.md)
4. Check out [Example Projects](../examples/README.md)

For more examples and advanced patterns, see the implementation guides in each product's documentation.