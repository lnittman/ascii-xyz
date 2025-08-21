'use client';

import * as Clerk from '@clerk/elements/common';
import * as ClerkSignUp from '@clerk/elements/sign-up';
import type React from 'react';
import { ArborAsciiLogo } from '../../../code/ArborAsciiLogo';

interface SignUpVerificationsStepProps {
  renderLogo?: () => React.ReactNode;
}

export const SignUpVerificationsStep: React.FC<
  SignUpVerificationsStepProps
> = ({ renderLogo }) => {
  return (
    <ClerkSignUp.Step name="verifications">
      <ClerkSignUp.Strategy name="email_code">
        <div className="mb-6 text-center">
          {renderLogo ? renderLogo() : <ArborAsciiLogo size="small" />}
          <h1 className="mt-4 font-bold text-xl">check your email</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            we sent a verification code to your email
          </p>
        </div>

        <Clerk.Field name="code" className="mb-5">
          <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
            verification code
          </Clerk.Label>
          <Clerk.Input className="w-full rounded-none border border-border bg-card p-3 text-base transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-ring" />
          <Clerk.FieldError className="mt-2 text-destructive text-xs" />
        </Clerk.Field>

        <ClerkSignUp.Action
          submit
          className="mb-3 w-full rounded-none border border-primary/20 bg-primary p-3 font-medium text-primary-foreground text-sm transition-all duration-200 hover:bg-primary/90"
        >
          verify
        </ClerkSignUp.Action>

        <ClerkSignUp.Action
          navigate="start"
          className="block w-full cursor-pointer text-center text-muted-foreground text-sm transition-all duration-200 hover:text-foreground"
        >
          go back
        </ClerkSignUp.Action>
      </ClerkSignUp.Strategy>

      <ClerkSignUp.Strategy name="phone_code">
        <div className="mb-6 text-center">
          {renderLogo ? renderLogo() : <ArborAsciiLogo size="small" />}
          <h1 className="mt-4 font-bold text-xl">check your phone</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            we sent a verification code to your phone
          </p>
        </div>

        <Clerk.Field name="code" className="mb-5">
          <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
            verification code
          </Clerk.Label>
          <Clerk.Input className="w-full rounded-none border border-border bg-card p-3 text-base transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-ring" />
          <Clerk.FieldError className="mt-2 text-destructive text-xs" />
        </Clerk.Field>

        <ClerkSignUp.Action
          submit
          className="mb-3 w-full rounded-none border border-primary/20 bg-primary p-3 font-medium text-primary-foreground text-sm transition-all duration-200 hover:bg-primary/90"
        >
          verify
        </ClerkSignUp.Action>

        <ClerkSignUp.Action
          navigate="start"
          className="block w-full cursor-pointer text-center text-muted-foreground text-sm transition-all duration-200 hover:text-foreground"
        >
          go back
        </ClerkSignUp.Action>
      </ClerkSignUp.Strategy>
    </ClerkSignUp.Step>
  );
};
