"use client";

import { ReactNode } from "react";
import { ConvexReactClient, ConvexProvider } from "convex/react";

// Create a dummy URL for build time when env var is not available
const getConvexUrl = () => {
  if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_CONVEX_URL) {
    // Return a dummy URL during build time to prevent errors
    return 'https://unused-during-build.convex.cloud';
  }
  return process.env.NEXT_PUBLIC_CONVEX_URL!;
};

const convex = new ConvexReactClient(getConvexUrl());

export default function ConvexClientProvider({ 
  children 
}: { 
  children: ReactNode 
}) {
  // Temporarily use regular ConvexProvider without Clerk
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}