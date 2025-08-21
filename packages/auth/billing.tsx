'use client';

import { PricingTable, Protect } from '@clerk/nextjs';
import type React from 'react';

/**
 * Clerk Billing Integration
 *
 * This module provides components and utilities for Clerk's B2C billing system.
 * It includes the PricingTable component and access control utilities.
 */

interface PricingPageProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * PricingPage component that displays Clerk's pricing table
 *
 * @example
 * ```tsx
 * import { PricingPage } from '@repo/auth/billing';
 *
 * export default function Pricing() {
 *   return <PricingPage />;
 * }
 * ```
 */
export function PricingPage({ className, style }: PricingPageProps) {
  return (
    <div
      className={className}
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 1rem',
        ...style,
      }}
    >
      <PricingTable />
    </div>
  );
}

/**
 * Re-export Clerk's PricingTable for direct use
 */
export { PricingTable };

/**
 * Re-export Clerk's Protect component for access control
 *
 * @example
 * ```tsx
 * import { ProtectPlan, ProtectFeature } from '@repo/auth/billing';
 *
 * // Protect by plan
 * <ProtectPlan
 *   plan="plus"
 *   fallback={<p>Upgrade to Plus to access this feature</p>}
 * >
 *   <PremiumFeature />
 * </ProtectPlan>
 *
 * // Protect by feature
 * <ProtectFeature
 *   feature="advanced-analytics"
 *   fallback={<p>This feature requires a subscription</p>}
 * >
 *   <AnalyticsDashboard />
 * </ProtectFeature>
 * ```
 */
export { Protect };

interface ProtectPlanProps {
  plan: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface ProtectFeatureProps {
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Convenience wrapper for protecting content by plan
 */
export function ProtectPlan({ plan, fallback, children }: ProtectPlanProps) {
  return (
    <Protect plan={plan} fallback={fallback}>
      {children}
    </Protect>
  );
}

/**
 * Convenience wrapper for protecting content by feature
 */
export function ProtectFeature({
  feature,
  fallback,
  children,
}: ProtectFeatureProps) {
  return (
    <Protect feature={feature} fallback={fallback}>
      {children}
    </Protect>
  );
}

/**
 * Hook to check if user has access to a plan or feature
 * Note: This must be used in server components or server actions
 *
 * @example
 * ```tsx
 * import { auth } from '@clerk/nextjs/server';
 *
 * export default async function Page() {
 *   const { has } = await auth();
 *   const hasPlusAccess = has({ plan: 'plus' });
 *   const hasFeatureAccess = has({ feature: 'advanced-analytics' });
 *
 *   if (!hasPlusAccess) {
 *     return <div>Upgrade to Plus to access this content</div>;
 *   }
 *
 *   return <div>Premium content here</div>;
 * }
 * ```
 */
export type { User } from '@clerk/nextjs/server';

/**
 * Common plan names for type safety
 */
export const PLANS = {
  FREE: 'free',
  PLUS: 'plus',
} as const;

export type PlanType = (typeof PLANS)[keyof typeof PLANS];

/**
 * Utility function to check if a plan is a paid plan
 */
export function isPaidPlan(plan: string): boolean {
  return plan !== PLANS.FREE;
}
