# arbor deployment guide

## overview

arbor consists of two main deployments:
- **apps/app**: main next.js application (deployed to vercel)
- **apps/ai**: mastra ai service (deployed to mastra cloud)

## current deployment status

### production urls
- app: `https://arbor-xyz.vercel.app`
- ai: `https://arbor-xyz.mastra.cloud`

### deployment architecture
```
┌─────────────────┐     ┌──────────────────┐
│   vercel app    │────▶│  mastra cloud    │
│ arbor-xyz.app   │     │  arbor-xyz.ai    │
└─────────────────┘     └──────────────────┘
        │                        │
        ▼                        ▼
   ┌──────────┐            ┌──────────┐
   │ postgres │            │  agents  │
   └──────────┘            └──────────┘
```

## environment variables

### apps/app (vercel)
```env
# required
NEXT_PUBLIC_AI_URL=https://arbor-xyz.mastra.cloud
NEXT_PUBLIC_APP_URL=https://arbor-xyz.vercel.app
NEXT_PUBLIC_API_URL=https://arbor-xyz.vercel.app

# clerk auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# database
DATABASE_URL=...

# ai api keys (user configurable)
OPENROUTER_API_KEY=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GOOGLE_API_KEY=...
```

### apps/ai (mastra cloud)
```env
# database (same as app)
DATABASE_URL=...

# ai api keys (fallback)
OPENROUTER_API_KEY=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GOOGLE_API_KEY=...
```

## mastra cloud deployment

### how it works
1. mastra cloud connects to your github repository
2. automatically deploys on code changes
3. provides agent endpoints at `https://[project].mastra.cloud`
4. handles scaling and infrastructure

### key findings
- mastra cloud is accessible and working
- no authentication required (handled at deployment level)
- supports streaming responses
- cors is configured with wildcard `*`

### testing mastra cloud
```bash
# test if service is up
curl https://arbor-xyz.mastra.cloud/

# test chat agent
curl -X POST https://arbor-xyz.mastra.cloud/api/agents/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

## communication flow

1. user → apps/app frontend
2. frontend → `/api/chat` (next.js api route)
3. api route → mastraagentservice
4. mastraagentservice → mastra cloud
5. mastra cloud → streams response back

## debugging

### check ai status
visit: `https://arbor-xyz.vercel.app/api/debug/ai-status`

### common issues

#### cors errors
- mastra cloud already allows all origins
- check browser console for specific errors

#### connection timeouts
- verify `NEXT_PUBLIC_AI_URL` is set correctly
- check mastra cloud dashboard for errors

#### authentication errors
- mastra cloud doesn't require api keys
- authentication happens at deployment level

## utility commands

```bash
# chat with local ai service
pnpm mastra:chat

# chat with production mastra cloud
pnpm mastra:chat:prod
```

## deployment checklist

### deploying apps/app to vercel
1. push code to github
2. vercel auto-deploys from main branch
3. ensure all environment variables are set
4. verify `NEXT_PUBLIC_AI_URL` points to mastra cloud

### deploying apps/ai to mastra cloud
1. push code to github
2. mastra cloud auto-deploys
3. check mastra cloud dashboard for status
4. test endpoints with curl

## monitoring

### vercel (apps/app)
- function logs: vercel dashboard → functions
- errors: vercel dashboard → analytics
- performance: vercel speed insights

### mastra cloud (apps/ai)
- logs: mastra cloud dashboard
- agent performance: built-in monitoring
- errors: check deployment logs

## future improvements

1. **authentication**: add api key support when mastra cloud supports it
2. **cors**: restrict to specific domains for security
3. **monitoring**: add custom metrics and alerts
4. **fallback**: implement failover to vercel-deployed ai service