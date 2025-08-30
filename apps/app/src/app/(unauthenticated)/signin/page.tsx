'use client';

import { useAuth } from '@repo/auth/client';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import * as Clerk from '@clerk/elements/common';
import * as ClerkSignIn from '@clerk/elements/sign-in';
import { AsciiMorph } from '@/components/shared/ascii-morph';

function SignInContent() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

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
                  {/* Header */}
                  <div className="mb-12">
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
                    By continuing, you agree to ASCII's{' '}
                    <span className="underline">Terms of Service</span> and{' '}
                    <span className="underline">Privacy Policy</span>
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
        
        {/* Right panel - ASCII Animation */}
        <div className="flex-1 relative bg-muted/5 border-l border-border/50 overflow-hidden">
          <AsciiMorph className="absolute inset-0" speed={150} interactive={true} />
          
          {/* Overlay with sample prompt */}
          <div className="absolute bottom-8 left-8 right-8 p-6 backdrop-blur-sm bg-background/80 rounded-xl border border-border/50">
            <p className="text-xs font-mono text-muted-foreground mb-2">Try asking:</p>
            <p className="text-sm font-mono text-foreground">
              "Create an ASCII animation of a flickering campfire with smoke rising into the stars"
            </p>
          </div>
        </div>
      </div>
      
      {/* Mobile: Centered layout */}
      <div className="flex lg:hidden w-full h-full flex-col">
        {/* Full page ASCII morph background */}
        <AsciiMorph className="absolute inset-0 z-0" speed={200} interactive={true} />
        
        {/* Sign-in content - bottom aligned */}
        <div className="relative z-10 flex flex-1 flex-col justify-end px-4 pb-8">
          <ClerkSignIn.Root routing="path" path="/signin">
            <ClerkSignIn.Step name="start" className="flex flex-col items-stretch w-full">
              {/* Minimalist sign-in card */}
              <div className="backdrop-blur-sm bg-background/90 rounded-xl border border-border/50 p-6">
                {/* ASCII logo */}
                <div className="mb-6 text-center">
                  <pre className="font-mono text-[10px] text-foreground/60 inline-block">
{`    ___   _____ _____ _____ _____ 
   / _ \\ /  ___/  __ \\_   _|_   _|
  / /_\\ \\\\ \`--.|  /  \\ | |   | |  
  |  _  | \`--. \\ |    || |   | |  
  | | | |/\\__/ / \\__/\\| |_ _| |_ 
  \\_| |_/\\____/ \\____/\\___/ \\___/ `}
                  </pre>
                </div>
                
                {/* Apple Sign In Button */}
                <Clerk.Connection
                  name="apple"
                  className="flex items-center justify-center gap-2 rounded-lg border border-border bg-foreground hover:bg-foreground/90 px-4 py-3 font-mono text-sm text-background transition-all duration-200 w-full mb-2"
                >
                  <Clerk.Icon className="h-4 w-4" />
                  continue with Apple
                </Clerk.Connection>
                
                {/* Google Sign In Button */}
                <Clerk.Connection
                  name="google"
                  className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background hover:bg-muted px-4 py-3 font-mono text-sm text-foreground transition-all duration-200 w-full"
                >
                  <Clerk.Icon className="h-4 w-4" />
                  continue with Google
                </Clerk.Connection>
                
                {/* Subtle text */}
                <p className="mt-4 text-center text-xs font-mono text-muted-foreground">
                  create AI-powered ASCII art
                </p>
              </div>
            </ClerkSignIn.Step>
            
            {/* SSO Callback Step */}
            <ClerkSignIn.Step name="sso-callback">
              <div className="flex flex-col items-center justify-center gap-4 backdrop-blur-sm bg-background/90 rounded-xl border border-border/50 p-6">
                <div className="animate-spin h-6 w-6 border-2 border-foreground border-t-transparent rounded-full" />
                <p className="text-xs font-mono text-muted-foreground">authenticating...</p>
              </div>
            </ClerkSignIn.Step>
          </ClerkSignIn.Root>
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