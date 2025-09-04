'use client';

import type React from 'react';

import * as Clerk from '@clerk/elements/common';
import * as ClerkSignIn from '@clerk/elements/sign-in';

import { Button } from '@repo/design/components/ui/button';
import { AsciiLogo } from '../../../shared/ascii-logo';

interface SignInSsoCallbackStepProps {
  goToHome: () => void;
  renderLogo?: () => React.ReactNode;
}

export const SignInSsoCallbackStep: React.FC<SignInSsoCallbackStepProps> = ({
  goToHome,
  renderLogo,
}) => {
  return (
    <ClerkSignIn.Step name="sso-callback">
      <div className="mb-10 text-center">
        {renderLogo ? renderLogo() : <AsciiLogo size="small" />}

        <h2 className="mt-4 font-medium text-foreground text-xl">
          Completing sign-in...
        </h2>

        <p className="mt-2 text-muted-foreground text-sm">
          Please wait while we're completing your authentication
        </p>
      </div>
      <ClerkSignIn.Captcha />
      <Clerk.GlobalError className="mt-4 text-center text-destructive text-sm" />
      <div className="mt-4 text-center">
        <Button
          onClick={goToHome}
          className="mt-4 rounded-none border border-slate-300 bg-muted p-2 font-medium text-sm hover-transition hover:bg-muted/80 dark:border-slate-700"
        >
          Go to Home Page
        </Button>
      </div>
    </ClerkSignIn.Step>
  );
};
