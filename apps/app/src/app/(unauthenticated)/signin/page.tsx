'use client';

import { useAuth } from '@repo/auth/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import * as Clerk from '@clerk/elements/common';
import * as ClerkSignIn from '@clerk/elements/sign-in';
import { MatrixRain } from '@/components/shared/matrix-rain';

export default function SignInPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  return (
    <div className="flex h-full w-full items-center justify-center px-4 bg-background">
      <ClerkSignIn.Root routing="path" path="/signin">
        <ClerkSignIn.Step name="start" className="flex flex-col items-stretch w-full max-w-sm">
          {/* Card with same background as page */}
          <div className="relative rounded-xl overflow-hidden bg-background">
            {/* Matrix ASCII Animation as full background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <MatrixRain />
            </div>
            
            {/* Content overlay */}
            <div className="relative z-10 flex flex-col justify-between h-[500px]">
              {/* Spacer for top */}
              <div className="flex-1" />
              
              {/* Google Sign In Button at bottom */}
              <div className="p-8">
                <Clerk.Connection
                  name="google"
                  className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground hover:bg-accent transition-colors duration-200 w-full"
                >
                  <Clerk.Icon className="h-4 w-4" />
                  continue with Google
                </Clerk.Connection>
              </div>
            </div>
          </div>
        </ClerkSignIn.Step>
        
        {/* SSO Callback Step */}
        <ClerkSignIn.Step name="sso-callback" className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin h-6 w-6 border-2 border-foreground border-t-transparent rounded-full" />
          <p className="text-xs font-mono text-muted-foreground">authenticating...</p>
        </ClerkSignIn.Step>
      </ClerkSignIn.Root>
    </div>
  );
}