'use client';

import { useAuth } from '@repo/auth/client';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import * as Clerk from '@clerk/elements/common';
import * as ClerkSignIn from '@clerk/elements/sign-in';
import { AsciiScatter } from '@repo/ascii';
import { useTheme } from 'next-themes';

function SignInContent() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);
  
  const isDark = mounted ? (resolvedTheme === 'dark') : false;

  return (
    <div className="flex h-full w-full">
      {/* Desktop: Split panel layout */}
      <div className="hidden lg:flex w-full">
        {/* Left panel - Authentication */}
        <div className="flex flex-1 flex-col justify-between bg-background">
          <div className="flex flex-1 flex-col justify-center px-8 py-12">
            <div className="mx-auto w-full max-w-sm">
              <ClerkSignIn.Root routing="path" path="/signin">
                <ClerkSignIn.Step name="start" className="flex flex-col items-stretch w-full">
                  {/* Header - centered */}
                  <div className="mb-12 text-center">
                    <h1 className="text-2xl font-medium text-foreground">
                      Sign in to ASCII
                    </h1>
                  </div>
                  
                  {/* Apple Sign In Button */}
                  <Clerk.Connection
                    name="apple"
                    className="flex items-center justify-center gap-2 rounded-lg border border-border bg-foreground hover:bg-foreground/90 px-4 py-3 font-medium text-sm text-background transition-all duration-200 w-full mb-3"
                  >
                    <Clerk.Icon className="h-5 w-5" />
                    Continue with Apple
                  </Clerk.Connection>
                  
                  {/* Google Sign In Button */}
                  <Clerk.Connection
                    name="google"
                    className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background hover:bg-muted px-4 py-3 font-medium text-sm text-foreground transition-all duration-200 w-full"
                  >
                    <Clerk.Icon className="h-5 w-5" />
                    Continue with Google
                  </Clerk.Connection>
                  
                  {/* Terms text */}
                  <p className="mt-8 text-xs text-muted-foreground text-center">
                    By signing in, you agree to our{' '}
                    <a href="/terms" className="underline">Terms of Service</a> and{' '}
                    <a href="/privacy" className="underline">Privacy Policy</a>.
                  </p>
                </ClerkSignIn.Step>
                
                {/* SSO Callback Step */}
                <ClerkSignIn.Step name="sso-callback">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin h-6 w-6 border-2 border-foreground border-t-transparent rounded-full" />
                    <p className="text-xs font-mono text-muted-foreground">authenticating...</p>
                  </div>
                </ClerkSignIn.Step>
              </ClerkSignIn.Root>
            </div>
          </div>
          
          {/* Bottom section - keep empty for clean minimal design */}
          <div className="px-8 pb-8">
            <div className="mx-auto max-w-sm text-center">
              {/* Intentionally empty for minimal aesthetic */}
            </div>
          </div>
        </div>
        
        {/* Right panel - ASCII container with padding + rounded border */}
        <div className="flex-1 relative bg-background">
          {/* Container takes full right half with top/right/bottom padding */}
          <div className="absolute inset-y-6 right-6 left-0">
            <div className="relative h-full w-full rounded-lg border border-border/40 bg-muted/5 dark:bg-white/[0.04] overflow-hidden">
              <AsciiScatter 
                active={true} 
                isDark={isDark}
                className="absolute inset-0" 
              />
              {/* Subtle gradient overlay inside container */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/10 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      
        {/* Mobile layout */}
        <div className="flex lg:hidden w-full h-full flex-col px-4 pt-4 pb-6 gap-4">
        {/* ASCII panel on top with rounded border */}
        <div className="relative w-full rounded-lg border border-border/40 bg-muted/5 overflow-hidden" style={{ minHeight: 220 }}>
          <AsciiScatter active={true} isDark={isDark} className="absolute inset-0" />
        </div>

        {/* Sign-in buttons directly below (no extra card/container, no ASCII wordmark) */}
        <div className="flex flex-col gap-2">
          <ClerkSignIn.Root routing="path" path="/signin">
            <ClerkSignIn.Step name="start" className="flex flex-col items-stretch w-full">
              <Clerk.Connection
                name="apple"
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-foreground hover:bg-foreground/90 px-4 py-3 font-mono text-sm text-background transition-all duration-200 w-full"
              >
                <Clerk.Icon className="h-4 w-4" />
                continue with Apple
              </Clerk.Connection>
              <Clerk.Connection
                name="google"
                className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-border bg-background hover:bg-muted px-4 py-3 font-mono text-sm text-foreground transition-all duration-200 w-full"
              >
                <Clerk.Icon className="h-4 w-4" />
                continue with Google
              </Clerk.Connection>
            </ClerkSignIn.Step>
            <ClerkSignIn.Step name="sso-callback">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="animate-spin h-6 w-6 border-2 border-foreground border-t-transparent rounded-full" />
                <p className="text-xs font-mono text-muted-foreground">authenticating...</p>
              </div>
            </ClerkSignIn.Step>
          </ClerkSignIn.Root>
          {/* Terms text */}
          <p className="mt-2 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <a href="/terms" className="underline">Terms of Service</a> and{' '}
            <a href="/privacy" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full w-full items-center justify-center px-4 bg-background">
        <div className="animate-spin h-6 w-6 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
