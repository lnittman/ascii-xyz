'use client';

import type React from 'react';
import { useEffect } from 'react';

import * as ClerkSignIn from '@clerk/elements/sign-in';

import { SignInForgotPasswordStep } from './components/forgot-password';
import { SignInResetPasswordStep } from './components/reset-password';
import { SignInSsoCallbackStep } from './components/sso-callback';
import { SignInStartStep } from './components/start';
import { SignInVerificationsStep } from './components/verifications';

interface SignInProps {
  onSignInComplete?: () => void;
  onRedirect?: (path: string) => void;
  renderLogo?: () => React.ReactNode;
}

export const SignIn = ({
  onRedirect,
  onSignInComplete,
  renderLogo,
}: SignInProps) => {
  useEffect(() => {
    const handleClerkEvents = () => {
      const cb = () => {
        if (onSignInComplete) {
          onSignInComplete();
        } else if (onRedirect) {
          onRedirect('/');
        }
      };
      document.addEventListener('clerk:sign-in:complete', cb);
      return () => {
        document.removeEventListener('clerk:sign-in:complete', cb);
      };
    };
    const cleanup = handleClerkEvents();
    return cleanup;
  }, [onSignInComplete, onRedirect]);

  const goToHome = () => {
    try {
      if (onSignInComplete) {
        onSignInComplete();
      } else if (onRedirect) {
        onRedirect('/');
      }
    } catch (_err: any) {}
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full p-6">
        <ClerkSignIn.Root routing="path" path="/signin">
          <SignInStartStep renderLogo={renderLogo} />
          <SignInSsoCallbackStep renderLogo={renderLogo} goToHome={goToHome} />
          <SignInVerificationsStep />
          <SignInForgotPasswordStep />
          <SignInResetPasswordStep />
        </ClerkSignIn.Root>
      </div>
    </div>
  );
};
