import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod';
import { router } from './router';

// Create OpenAPI generator with Zod converter
const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

// Generate OpenAPI document
export async function getOpenAPIDocument() {
  const spec = await generator.generate(router, {
    info: {
      title: 'Arbor API',
      version: '1.0.0',
      description:
        'Engineering-first platform for building AI-powered applications',
      contact: {
        name: 'Arbor Team',
        url: 'https://arbor.xyz',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
        description: 'Development server',
      },
      {
        url: 'https://api.arbor.xyz',
        description: 'Production server',
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'User',
        description: 'User management endpoints',
      },
      {
        name: 'Workspace',
        description: 'Workspace management endpoints',
      },
      {
        name: 'Project',
        description: 'Project management endpoints',
      },
      {
        name: 'Chat',
        description: 'Chat and message endpoints',
      },
      {
        name: 'Settings',
        description: 'User settings endpoints',
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints',
      },
      {
        name: 'Outputs',
        description: 'Output generation endpoints',
      },
      {
        name: 'Feedback',
        description: 'Feedback endpoints',
      },
      {
        name: 'Share',
        description: 'Sharing endpoints',
      },
    ],
  });

  return spec;
}

// Handler for serving OpenAPI spec
export async function openAPIHandler(_request: Request) {
  const spec = await getOpenAPIDocument();
  return new Response(JSON.stringify(spec, null, 2), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
