'use client';

import * as Clerk from '@clerk/elements/common';
import * as ClerkSignIn from '@clerk/elements/sign-in';
import type React from 'react';

export const SignInForgotPasswordStep: React.FC = () => {
  return (
    <ClerkSignIn.Step name="forgot-password">
      <div className="mb-6 text-center">
        <h1 className="font-bold text-foreground text-xl">
          reset your password
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          enter your email to receive a password reset code
        </p>
      </div>

      <Clerk.Field name="identifier" className="mb-5">
        <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
          email
        </Clerk.Label>
        <Clerk.Input className="w-full rounded-none border border-border bg-card p-3 text-base hover-transition focus:outline-none focus:ring-1 focus:ring-ring" />
        <Clerk.FieldError className="mt-2 text-destructive text-xs" />
      </Clerk.Field>

      {/* Email reset strategy */}
      <ClerkSignIn.SupportedStrategy name="reset_password_email_code" asChild>
        <button className="mb-4 w-full rounded-none border border-primary/20 bg-primary px-4 py-3 font-medium text-primary-foreground text-sm hover-bg hover:bg-primary/90">
          send reset code
        </button>
      </ClerkSignIn.SupportedStrategy>

      {/* Back to start */}
      <ClerkSignIn.Action navigate="start" asChild>
        <button className="w-full rounded-none px-4 py-3 text-muted-foreground text-sm hover-bg hover:text-foreground">
          back to sign in
        </button>
      </ClerkSignIn.Action>
    </ClerkSignIn.Step>
  );
};
