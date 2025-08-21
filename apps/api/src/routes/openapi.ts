import { getOpenAPIDocument } from '@repo/orpc/openapi';
import { Hono } from 'hono';

const app = new Hono();

// Serve OpenAPI JSON spec
app.get('/spec.json', async (c) => {
  try {
    const spec = await getOpenAPIDocument();
    return c.json(spec);
  } catch (_error) {
    return c.json({ error: 'Failed to generate OpenAPI specification' }, 500);
  }
});

// Serve Swagger UI (optional)
app.get('/', (c) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Arbor API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/openapi/spec.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: 'BaseLayout',
        supportedSubmitMethods: [],
        persistAuthorization: true,
      });
    };
  </script>
</body>
</html>
  `;

  return c.html(html);
});

export default app;
