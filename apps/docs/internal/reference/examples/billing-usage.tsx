import { auth } from '@clerk/nextjs/server';
import {
  PLANS,
  PricingPage,
  PricingTable,
  ProtectFeature,
  ProtectPlan,
  isPaidPlan,
} from '@repo/auth/billing';
import { Button } from '@repo/design/components/ui/button';

// Example 1: Complete upgrade page
export function ExampleUpgradePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12">
        <h1 className="mb-8 text-center font-bold text-4xl">
          Choose Your Plan
        </h1>
        <PricingPage />
      </div>
    </div>
  );
}

// Example 2: Custom pricing layout with Clerk's table
export function ExampleCustomPricing() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 text-center">
        <h2 className="mb-4 font-bold text-2xl">Upgrade Your Experience</h2>
        <p className="text-muted-foreground">
          Choose the plan that works best for you
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <PricingTable />
      </div>
    </div>
  );
}

// Example 3: Protecting content by plan
export function ExamplePremiumFeature() {
  return (
    <div className="space-y-4">
      {/* Content available to all users */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Basic Feature</h3>
        <p>This content is available to all users.</p>
      </div>

      {/* Content only for Plus subscribers */}
      <ProtectPlan
        plan={PLANS.PLUS}
        fallback={
          <div className="rounded-lg border border-dashed p-4 text-center">
            <h3 className="mb-2 font-semibold">Premium Feature</h3>
            <p className="mb-4 text-muted-foreground">
              Upgrade to Plus to unlock this feature
            </p>
            <Button>Upgrade Now</Button>
          </div>
        }
      >
        <div className="rounded-lg border bg-primary/5 p-4">
          <h3 className="mb-2 font-semibold">Premium Feature</h3>
          <p>This advanced feature is only available to Plus subscribers.</p>
        </div>
      </ProtectPlan>
    </div>
  );
}

// Example 4: Protecting content by feature
export function ExampleFeatureGating() {
  return (
    <div className="space-y-4">
      <ProtectFeature
        feature="advanced-analytics"
        fallback={
          <div className="rounded-lg border border-dashed p-4">
            <p className="text-muted-foreground">
              Advanced analytics requires a subscription
            </p>
          </div>
        }
      >
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Analytics Dashboard</h3>
          <p>Detailed analytics and insights for your account.</p>
        </div>
      </ProtectFeature>
    </div>
  );
}

// Example 5: Server-side access control
export async function ExampleServerPage() {
  const { has } = await auth();

  // Check if user has Plus plan
  const hasPlusAccess = has({ plan: PLANS.PLUS });

  // Check if user has specific feature
  const hasAnalyticsAccess = has({ feature: 'advanced-analytics' });

  if (!hasPlusAccess) {
    return (
      <div className="p-8 text-center">
        <h1 className="mb-4 font-bold text-2xl">Premium Content</h1>
        <p className="mb-4 text-muted-foreground">
          This page is only available to Plus subscribers.
        </p>
        <Button>Upgrade to Plus</Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-4 font-bold text-2xl">Welcome, Plus Subscriber!</h1>
      <p className="mb-4">You have access to all premium features.</p>

      {hasAnalyticsAccess && (
        <div className="mt-6 rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Advanced Analytics</h2>
          <p>Your detailed analytics dashboard would go here.</p>
        </div>
      )}
    </div>
  );
}

// Example 6: Using plan utilities
export function ExamplePlanUtilities() {
  const userPlan = 'plus'; // This would come from your user data

  return (
    <div className="p-4">
      <h3 className="mb-2 font-semibold">Plan Status</h3>
      <p>Current plan: {userPlan}</p>
      <p>Is paid plan: {isPaidPlan(userPlan) ? 'Yes' : 'No'}</p>
      <p>Is Plus plan: {userPlan === PLANS.PLUS ? 'Yes' : 'No'}</p>
    </div>
  );
}

// Example 7: Conditional rendering based on plan
export function ExampleConditionalFeatures() {
  return (
    <div className="space-y-4">
      {/* Always show basic features */}
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Basic Chat</h3>
        <p>Send and receive messages</p>
      </div>

      {/* Show premium features only to Plus subscribers */}
      <ProtectPlan
        plan={PLANS.PLUS}
        fallback={null} // Don't show anything if not subscribed
      >
        <div className="rounded-lg border bg-primary/5 p-4">
          <h3 className="font-semibold">Priority Support</h3>
          <p>Get faster response times and dedicated support</p>
        </div>

        <div className="rounded-lg border bg-primary/5 p-4">
          <h3 className="font-semibold">Advanced Features</h3>
          <p>Access to beta features and advanced tools</p>
        </div>
      </ProtectPlan>
    </div>
  );
}
