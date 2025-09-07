'use client';

import { useState } from 'react';
import { Button } from '@repo/design/components/ui/button';
import { 
  CreditCard,
  Crown,
  Check,
  X,
  Receipt,
  Download,
  Calendar
} from '@phosphor-icons/react';
import { cn } from '@repo/design/lib/utils';

const plans = [
  {
    id: 'free',
    name: 'FREE',
    price: '$0',
    period: 'FOREVER',
    description: 'FOR CASUAL CREATORS',
    features: [
      '10 ASCII GENERATIONS PER DAY',
      'BASIC MODELS',
      'PUBLIC GALLERY',
      'STANDARD EXPORT',
    ],
    limitations: [
      'NO PREMIUM MODELS',
      'NO BATCH GENERATION',
      'LIMITED STORAGE (100 ARTWORKS)',
    ],
    current: true,
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '$9',
    period: 'PER MONTH',
    description: 'FOR POWER USERS',
    features: [
      'UNLIMITED GENERATIONS',
      'ALL AI MODELS',
      'PRIVATE GALLERY',
      'BATCH GENERATION',
      'PRIORITY PROCESSING',
      'ADVANCED EXPORT OPTIONS',
      'UNLIMITED STORAGE',
      'API ACCESS',
    ],
    limitations: [],
    recommended: true,
  },
  {
    id: 'team',
    name: 'TEAM',
    price: '$29',
    period: 'PER MONTH',
    description: 'FOR TEAMS & ORGANIZATIONS',
    features: [
      'EVERYTHING IN PRO',
      '5 TEAM MEMBERS',
      'TEAM COLLABORATION',
      'SHARED GALLERIES',
      'ADMIN CONTROLS',
      'PRIORITY SUPPORT',
      'CUSTOM BRANDING',
      'SSO AUTHENTICATION',
    ],
    limitations: [],
  },
];

export default function BillingSettingsPage() {
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const invoices = [
    { id: '1', date: '2024-01-01', amount: '$9.00', status: 'PAID' },
    { id: '2', date: '2023-12-01', amount: '$9.00', status: 'PAID' },
    { id: '3', date: '2023-11-01', amount: '$9.00', status: 'PAID' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-mono text-lg font-semibold uppercase tracking-wider">
          BILLING
        </h2>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          MANAGE YOUR SUBSCRIPTION AND BILLING
        </p>
      </div>

      {/* Current Plan */}
      <div className="rounded-md border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              CURRENT PLAN
            </p>
            <p className="mt-1 font-mono text-lg font-semibold">
              FREE PLAN
            </p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              YOU HAVE 7 GENERATIONS REMAINING TODAY
            </p>
          </div>
          <Crown className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={cn(
          'font-mono text-xs uppercase tracking-wider',
          billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'
        )}>
          MONTHLY
        </span>
        <button
          onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
          className="relative h-6 w-11 rounded-full bg-muted border border-border"
        >
          <div className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform duration-200',
            billingPeriod === 'yearly' ? 'translate-x-5' : 'translate-x-0.5'
          )} />
        </button>
        <span className={cn(
          'font-mono text-xs uppercase tracking-wider',
          billingPeriod === 'yearly' ? 'text-foreground' : 'text-muted-foreground'
        )}>
          YEARLY
          <span className="ml-1 text-green-500">(SAVE 20%)</span>
        </span>
      </div>

      {/* Plans */}
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'relative rounded-md border p-6',
              'transition-all duration-200',
              plan.current
                ? 'border-border bg-muted/30'
                : plan.recommended
                ? 'border-foreground bg-muted/50'
                : 'border-border/50 hover:border-border'
            )}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-sm bg-foreground px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-background">
                  RECOMMENDED
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
                  {plan.name}
                </h3>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div>
                <span className="font-mono text-2xl font-bold">
                  {plan.price}
                </span>
                <span className="ml-1 font-mono text-xs text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <div className="space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3 w-3 text-green-500" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.limitations.map((limitation) => (
                  <div key={limitation} className="flex items-start gap-2">
                    <X className="mt-0.5 h-3 w-3 text-red-500" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {limitation}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.current ? 'outline' : plan.recommended ? 'default' : 'outline'}
                className="w-full font-mono text-xs uppercase tracking-wider"
                disabled={plan.current}
              >
                {plan.current ? 'CURRENT PLAN' : `UPGRADE TO ${plan.name}`}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <div className="space-y-4 border-t border-border/50 pt-8">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          PAYMENT METHOD
        </h3>

        <div className="rounded-md border border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-mono text-xs font-medium uppercase tracking-wider">
                  NO PAYMENT METHOD
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  ADD A CARD TO UPGRADE YOUR PLAN
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs uppercase tracking-wider"
            >
              ADD CARD
            </Button>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="space-y-4 border-t border-border/50 pt-8">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          BILLING HISTORY
        </h3>

        {invoices.length > 0 ? (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-md border border-border/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-mono text-xs">
                      {invoice.date}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {invoice.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-medium">
                    {invoice.amount}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-border/50 p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              NO BILLING HISTORY
            </p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              YOUR INVOICES WILL APPEAR HERE
            </p>
          </div>
        )}
      </div>

      {/* Subscription Management */}
      <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4">
        <p className="font-mono text-xs font-medium uppercase tracking-wider">
          CANCEL SUBSCRIPTION
        </p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          YOU CAN CANCEL YOUR SUBSCRIPTION AT ANY TIME
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 border-red-500/50 font-mono text-xs uppercase tracking-wider text-red-500 hover:bg-red-500/10"
          disabled
        >
          NO ACTIVE SUBSCRIPTION
        </Button>
      </div>
    </div>
  );
}