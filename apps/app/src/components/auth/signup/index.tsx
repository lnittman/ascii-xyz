'use client';

import * as ClerkSignUp from '@clerk/elements/sign-up';
import type React from 'react';
import { useEffect } from 'react';

import { SignUpStartStep } from './components/start';
import { SignUpVerificationsStep } from './components/verifications';

export interface SignUpProps {
  onRedirect?: (path: string) => void;
  onSignUpComplete?: () => void;
  renderLogo?: () => React.ReactNode;
}

export const SignUp = ({
  onRedirect,
  onSignUpComplete,
  renderLogo,
}: SignUpProps) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleClerkEvent =
      (eventName: string) => (event: Event | CustomEvent) => {
        if (
          eventName === 'clerk:signup:successful' ||
          eventName === 'clerk:verification:complete'
        ) {
          if (onSignUpComplete) {
            onSignUpComplete();
          } else if (onRedirect) {
            onRedirect('/');
          }
        }
        if (eventName === 'clerk:error') {
          const _errorDetail = (event as CustomEvent).detail;
        }
      };

    const eventsToListen: Record<string, (event: Event | CustomEvent) => void> =
      {
        'clerk:signup:started': handleClerkEvent('clerk:signup:started'),
        'clerk:signup:attempted': handleClerkEvent('clerk:signup:attempted'),
        'clerk:signup:verification': handleClerkEvent(
          'clerk:signup:verification'
        ),
        'clerk:signup:successful': handleClerkEvent('clerk:signup:successful'),
        'clerk:verification:complete': handleClerkEvent(
          'clerk:verification:complete'
        ),
        'clerk:error': handleClerkEvent('clerk:error'),
      };

    Object.entries(eventsToListen).forEach(([eventName, handler]) => {
      document.addEventListener(eventName, handler as EventListener);
    });

    return () => {
      Object.entries(eventsToListen).forEach(([eventName, handler]) => {
        document.removeEventListener(eventName, handler as EventListener);
      });
    };
  }, [onSignUpComplete, onRedirect]);

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full p-6">
        <ClerkSignUp.Root routing="path" path="/signup">
          <SignUpStartStep renderLogo={renderLogo} />
          <SignUpVerificationsStep renderLogo={renderLogo} />
        </ClerkSignUp.Root>
      </div>
    </div>
  );
};
