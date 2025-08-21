'use client';

import * as Clerk from '@clerk/elements/common';
import * as ClerkSignIn from '@clerk/elements/sign-in';
import type React from 'react';

export const SignInResetPasswordStep: React.FC = () => {
  return (
    <ClerkSignIn.Step name="reset-password">
      <div className="mb-6 text-center">
        <h1 className="font-bold text-foreground text-xl">
          create new password
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          please create a new password for your account
        </p>
      </div>

      <Clerk.Field name="password" className="mb-4">
        <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
          new password
        </Clerk.Label>
        <Clerk.Input className="w-full rounded-none border border-border bg-card p-3 text-base transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-ring" />
        <Clerk.FieldError className="mt-2 text-destructive text-xs" />
      </Clerk.Field>

      <Clerk.Field name="confirmPassword" className="mb-5">
        <Clerk.Label className="mb-2 block font-medium text-foreground text-sm">
          confirm password
        </Clerk.Label>
        <Clerk.Input className="w-full rounded-none border border-border bg-card p-3 text-base transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-ring" />
        <Clerk.FieldError className="mt-2 text-destructive text-xs" />
      </Clerk.Field>

      <ClerkSignIn.Action
        submit
        className="w-full rounded-none bg-primary p-3 font-medium text-primary-foreground text-sm transition-all duration-200 hover:bg-primary/90"
      >
        reset password
      </ClerkSignIn.Action>
    </ClerkSignIn.Step>
  );
};
