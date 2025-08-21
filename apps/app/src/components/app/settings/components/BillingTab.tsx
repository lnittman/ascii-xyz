'use client';
import Image from 'next/image';
import Link from 'next/link';

import { ArrowUpRight, CheckCircle } from '@phosphor-icons/react';

import { Button } from '@repo/design/components/ui/button';

export function BillingTab() {
  const _currentPlan = 'free';

  const features = [
    'Generate and execute code in your browser',
    'Create visualizations and analyze data',
    'Upload and analyze images and documents',
    'Search the web for real-time information',
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="rounded-none border border-border/40 p-6">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-none border border-border/40">
              <Image
                src="/assets/leaves/fall.png"
                alt="Fall leaf"
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
            <div>
              <h4 className="font-medium text-foreground text-lg">Free plan</h4>
              <p className="text-muted-foreground text-sm">Try Arbor</p>
            </div>
          </div>
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/upgrade">
              Upgrade
              <ArrowUpRight className="ml-1 h-4 w-4" weight="bold" />
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle
                className="h-4 w-4 shrink-0 text-green-500"
                weight="duotone"
              />
              <span className="text-foreground text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
