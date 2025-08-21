# arbor ai deployment guide

this guide explains how to properly deploy the mastra ai service to vercel.

## prerequisites

1. vercel cli installed: `npm install -g vercel`
2. vercel account with team access
3. environment variables ready

## environment variables

the ai service requires these environment variables in vercel:

```env
# database (required)
DATABASE_URL=postgresql://...?sslmode=require

# llm providers (at least one required)
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...

# vercel deployer (required for auto-deploy)
VERCEL_TOKEN=...

# optional tools
JINA_API_KEY=...
GITHUB_TOKEN=...

# optional observability
OTEL_EXPORTER_OTLP_ENDPOINT=...
LANGFUSE_API_KEY=...
```

## deployment steps

### 1. build the mastra app

```bash
cd apps/ai
npx mastra build
```

this generates:
- `.mastra/output/` directory with all built files
- `vercel.json` with proper configuration
- bundled code with dependencies

### 2. deploy to vercel

#### option a: manual deployment

```bash
cd .mastra/output
vercel --prod
```

follow prompts to:
- link to existing project (apps/ai)
- confirm deployment settings

#### option b: automated deployment

use the provided script:

```bash
cd apps/ai
./deploy.sh
```

### 3. configure environment variables

in vercel dashboard (apps/ai project):

1. go to settings → environment variables
2. add all required variables for production
3. redeploy to apply changes

## troubleshooting

### "function size exceeded"

mastra bundles can be large. solutions:
1. exclude dev dependencies: already handled by `--omit=dev`
2. use external packages in vercel.json if needed

### "database connection failed"

1. ensure `DATABASE_URL` includes `?sslmode=require`
2. verify database allows connections from vercel ips
3. check pgvector extension is installed

### "agent not responding"

1. check environment variables are set
2. verify at least one llm provider key is valid
3. check vercel function logs for errors

## vercel project structure

the deployed project has this structure:

```
apps/ai/
├── index.mjs           # main entry point
├── mastra.mjs          # mastra configuration
├── tools.mjs           # tool definitions
├── tools/              # individual tool files
├── instrumentation.mjs # telemetry setup
└── vercel.json         # deployment config
```

## api endpoints

once deployed, the ai service exposes:

- `POST /agents/chat/generate` - single generation
- `POST /agents/chat/stream` - streaming responses
- `POST /agents/code/generate` - code-specific generation
- `POST /agents/code/stream` - code streaming

## integration with main app

the main arbor app (`apps/app`) connects to the ai service via:

1. environment variable: `MASTRA_API_URL=https://apps-ai.vercel.app`
2. api client in `packages/api/services/mastra`

## monitoring

view deployment status and logs:
1. vercel dashboard → apps/ai project
2. functions tab → real-time logs
3. analytics → function invocations

## continuous deployment

for automated deployments on push:

1. connect github repo to vercel
2. set root directory: `apps/ai`
3. build command: `npx mastra build && cd .mastra/output`
4. output directory: `.mastra/output`

## next steps

after deployment:
1. test api endpoints with curl/postman
2. verify agent responses
3. check memory persistence
4. monitor token usage