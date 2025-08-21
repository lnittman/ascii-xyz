# Clerk Billing Integration

This document describes how to use Clerk's B2C billing system in the Arbor application.

## Overview

Clerk billing allows you to create subscription plans and manage payments for individual users. The integration is provided through the `@repo/auth/billing` module, which wraps Clerk's billing components and utilities.

## Setup

### 1. Enable Billing in Clerk Dashboard

1. Navigate to the **Billing Settings** page in your Clerk Dashboard
2. Follow the setup guide to enable billing for your application
3. Choose your payment gateway:
   - **Clerk development gateway**: For testing (shared test Stripe account)
   - **Stripe account**: Use your own Stripe account for production

### 2. Create Plans

1. Navigate to the **Plans** page in the Clerk Dashboard
2. Select the **Plans for Users** tab
3. Create your plans (we use `free` and `plus` in Arbor):

#### Free Plan
- **Name**: `free`
- **Price**: $0
- **Features**: Basic access, 250 messages/month, community support

#### Plus Plan
- **Name**: `plus`
- **Price**: $10/month
- **Features**: Unlimited messages, priority support, advanced features

### 3. Add Features (Optional)

You can add features to plans for more granular access control:
1. Select a plan in the Clerk Dashboard
2. In the **Features** section, select **Add Feature**
3. Define feature names like `advanced-analytics`, `priority-support`, etc.

## Usage

### Components

#### PricingPage

A complete pricing page component that displays Clerk's pricing table:

```tsx
import { PricingPage } from '@repo/auth/billing';

export default function Pricing() {
  return <PricingPage />;
}
```

#### PricingTable

Direct access to Clerk's pricing table component:

```tsx
import { PricingTable } from '@repo/auth/billing';

export default function CustomPricing() {
  return (
    <div className="my-custom-wrapper">
      <PricingTable />
    </div>
  );
}
```

### Access Control

#### Protecting Components by Plan

```tsx
import { ProtectPlan } from '@repo/auth/billing';

export default function PremiumFeature() {
  return (
    <ProtectPlan 
      plan="plus" 
      fallback={<div>Upgrade to Plus to access this feature</div>}
    >
      <div>This content is only visible to Plus subscribers</div>
    </ProtectPlan>
  );
}
```

#### Protecting Components by Feature

```tsx
import { ProtectFeature } from '@repo/auth/billing';

export default function AnalyticsDashboard() {
  return (
    <ProtectFeature 
      feature="advanced-analytics" 
      fallback={<div>This feature requires a subscription</div>}
    >
      <div>Advanced analytics dashboard</div>
    </ProtectFeature>
  );
}
```

#### Server-Side Access Control

```tsx
import { auth } from '@clerk/nextjs/server';

export default async function ServerPage() {
  const { has } = await auth();
  
  // Check by plan
  const hasPlusAccess = has({ plan: 'plus' });
  
  // Check by feature
  const hasAnalyticsAccess = has({ feature: 'advanced-analytics' });
  
  if (!hasPlusAccess) {
    return <div>Upgrade to Plus to access this content</div>;
  }
  
  return <div>Premium content here</div>;
}
```

### Utilities

#### Plan Constants

Use the provided constants for type safety:

```tsx
import { PLANS, type PlanType } from '@repo/auth/billing';

// PLANS.FREE = 'free'
// PLANS.PLUS = 'plus'

function checkPlan(userPlan: PlanType) {
  if (userPlan === PLANS.PLUS) {
    // User has Plus plan
  }
}
```

#### Plan Utilities

```tsx
import { isPaidPlan } from '@repo/auth/billing';

const userPlan = 'plus';
if (isPaidPlan(userPlan)) {
  // User has a paid plan
}
```

## Implementation Examples

### Settings Page Integration

The billing settings page shows a clean current plan display with upgrade link:

```tsx
// apps/app/src/components/app/settings/components/BillingTab.tsx
import Link from 'next/link';
import { CheckCircle, ArrowUpRight } from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';

export function BillingTab() {
  const features = [
    'Chat on web, iOS, and Android',
    'Generate code and visualize data', 
    'Write, edit, and create content',
    'Analyze text and images',
    'Ability to search the web',
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="rounded-none border border-border/40 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none border border-border/40 flex items-center justify-center">
              <div className="w-4 h-4 bg-primary rounded-none"></div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-foreground">Free plan</h4>
              <p className="text-sm text-muted-foreground">Try Arbor</p>
            </div>
          </div>
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/upgrade">
              Upgrade plan
              <ArrowUpRight className="h-4 w-4 ml-1" weight="bold" />
            </Link>
          </Button>
        </div>
        
        <div className="space-y-3">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" weight="duotone" />
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Dedicated Upgrade Page

```tsx
// apps/app/src/app/(authenticated)/upgrade/page.tsx
import { PricingPage } from '@repo/auth/billing';

export default function Upgrade() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upgrade to unlock advanced features and get the most out of Arbor
          </p>
        </div>
        
        <PricingPage className="max-w-4xl mx-auto" />
      </div>
    </div>
  );
}
```

### Feature Gating in Components

```tsx
// Example: Premium chat features
import { ProtectPlan } from '@repo/auth/billing';

export function ChatInterface() {
  return (
    <div>
      {/* Basic chat features available to all users */}
      <BasicChatInput />
      
      {/* Premium features only for Plus subscribers */}
      <ProtectPlan 
        plan="plus"
        fallback={
          <div className="p-4 border border-dashed border-border/40 rounded-none text-center">
            <p className="text-muted-foreground mb-2">
              Unlock advanced chat features
            </p>
            <Button asChild>
              <Link href="/upgrade">Upgrade to Plus</Link>
            </Button>
          </div>
        }
      >
        <AdvancedChatFeatures />
      </ProtectPlan>
    </div>
  );
}
```

## API Reference

### Components

- `PricingPage`: Complete pricing page with Clerk's pricing table
- `PricingTable`: Direct access to Clerk's pricing table component
- `ProtectPlan`: Protect content by subscription plan
- `ProtectFeature`: Protect content by feature
- `Protect`: Direct access to Clerk's Protect component

### Constants

- `PLANS`: Object containing plan name constants
- `PlanType`: TypeScript type for plan names

### Utilities

- `isPaidPlan(plan: string)`: Check if a plan is a paid plan

### Server-Side Usage

Use Clerk's `auth()` helper and the `has()` method for server-side access control:

```tsx
import { auth } from '@clerk/nextjs/server';

const { has } = await auth();
const hasAccess = has({ plan: 'plus' });
const hasFeature = has({ feature: 'feature-name' });
```

## Pricing

Clerk billing costs 0.7% per transaction, plus Stripe's transaction fees (paid directly to Stripe).

## Best Practices

1. **Use constants**: Always use `PLANS.FREE` and `PLANS.PLUS` instead of string literals
2. **Provide fallbacks**: Always provide meaningful fallback content for protected components
3. **Server-side checks**: Use server-side access control for sensitive operations
4. **Feature-based gating**: Consider using features instead of plans for more granular control
5. **User experience**: Provide clear upgrade paths and pricing information

## Troubleshooting

### Common Issues

1. **Pricing table not showing**: Ensure billing is enabled in Clerk Dashboard and plans are created
2. **Access control not working**: Verify plan names match exactly between Clerk Dashboard and code
3. **Development testing**: Use Clerk's development gateway for testing without real payments

### Debug Tips

1. Check the browser console for Clerk-related errors
2. Verify user subscription status in Clerk Dashboard
3. Test with different user accounts and subscription states
4. Use server-side logging to debug `has()` method results

## Migration Notes

If migrating from a custom billing system:

1. Create corresponding plans in Clerk Dashboard
2. Map existing user subscriptions to Clerk plans
3. Update access control logic to use Clerk's `has()` method
4. Replace custom pricing components with Clerk's PricingTable
5. Test thoroughly with different subscription states 