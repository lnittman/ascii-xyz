#!/bin/bash

echo "🚀 Deploying Arbor API to Cloudflare Workers"
echo ""

# Check if we're in the right directory
if [ ! -f "wrangler.toml" ]; then
  echo "❌ Error: wrangler.toml not found. Are you in the apps/api directory?"
  exit 1
fi

echo "📝 Step 1: Installing dependencies"
bun install

echo ""
echo "📝 Step 2: Setting up secrets"
echo "You'll be prompted to enter each secret. Have them ready:"
echo "- DATABASE_URL (your Neon PostgreSQL URL)"
echo "- CLERK_SECRET_KEY (from Clerk dashboard)"
echo "- REDIS_URL (your Redis/Upstash URL)"
echo "- SENTRY_DSN (optional)"
echo ""

# Set secrets
echo "Setting DATABASE_URL..."
npx wrangler secret put DATABASE_URL

echo ""
echo "Setting CLERK_SECRET_KEY..."
npx wrangler secret put CLERK_SECRET_KEY

echo ""
echo "Setting REDIS_URL..."
npx wrangler secret put REDIS_URL

echo ""
echo "Setting SENTRY_DSN (press Enter to skip if not available)..."
npx wrangler secret put SENTRY_DSN || true

echo ""
echo "📝 Step 3: Building the project"
bunx turbo build --filter=api

echo ""
echo "📝 Step 4: Deploying to Cloudflare Workers"
npx wrangler deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your API service is now available at:"
echo "https://arbor-api.<your-subdomain>.workers.dev"
echo ""
echo "To view logs: npx wrangler tail"
echo ""
echo "Note: You'll need to update your AI service URL in apps/app/.env.local"
echo "to point to your deployed API endpoint."