import { PricingPage } from '@repo/auth/billing';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-bold text-4xl text-foreground">
            Choose Your Plan
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Upgrade to unlock advanced features and get the most out of Arbor
          </p>
        </div>

        <PricingPage className="mx-auto max-w-4xl" />
      </div>
    </div>
  );
}
