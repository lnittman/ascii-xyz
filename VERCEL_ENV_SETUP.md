# Vercel Production Environment Variables

## Required Environment Variables for Production

You must set these environment variables in your Vercel project settings:

### 1. Convex Configuration
```
NEXT_PUBLIC_CONVEX_URL=https://admired-bee-750.convex.cloud
```

### 2. Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXZvbHZlZC1mb2FsLTQyLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_pacaxD0XXmjfl9WQq2LVe1WAQ6QrgTmqEqbW527uDF
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 3. App URL
```
NEXT_PUBLIC_APP_URL=https://ascii-xyz.vercel.app
```

## How to Set Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `ascii-xyz` project
3. Navigate to Settings → Environment Variables
4. Add each variable above for the "Production" environment
5. Redeploy your application

## Important Notes

- The production Convex URL is: `https://admired-bee-750.convex.cloud`
- The development Convex URL is: `https://determined-dalmatian-278.convex.cloud`
- Make sure to use the production URL for Vercel deployments
- The OpenRouter API key is set in Convex, not Vercel

## Convex Environment Variables

These are already set in Convex Dashboard:
- `OPENROUTER_API_KEY` - For AI model access
- `CLERK_JWT_ISSUER_DOMAIN` - For auth verification
- `CLERK_WEBHOOK_SECRET` - For user sync