'use client';

import type React from 'react';
import { useState } from 'react';

import * as Clerk from '@clerk/elements/common';
import * as ClerkSignIn from '@clerk/elements/sign-in';
import { Link } from '@phosphor-icons/react';
import { LogsAnimation } from '@repo/ascii';

interface SignInStartStepProps {
  renderLogo?: () => React.ReactNode;
}

export const SignInStartStep: React.FC<SignInStartStepProps> = ({
  renderLogo,
}) => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setEmailSent(true);
    }
  };

  return (
    <ClerkSignIn.Step name="start" className="w-full">
      <div className="mb-8 flex justify-center">
        {renderLogo ? renderLogo() : (
          <LogsAnimation 
            width={50} 
            height={10} 
            fps={15}
            logCount={4}
            floating={true}
            rotation={true}
            moss={false}
            water={true}
          />
        )}
      </div>

      <div className="space-y-4">
        <Clerk.Connection
          name="google"
          className="flex w-full select-none items-center justify-center gap-2 rounded-md border border-border bg-background p-3 font-medium text-foreground text-sm hover-transition hover:bg-accent/50 active:bg-accent/60 active:scale-[0.98] touch-manipulation"
        >
          <Clerk.Icon className="h-5 w-5" />
          continue with Google
        </Clerk.Connection>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-border border-t" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-muted-foreground">or</span>
          </div>
        </div>

        {!emailSent ? (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <Clerk.Field name="identifier">
              <Clerk.Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground hover-transition focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="enter your email"
                autoComplete="email"
                required
              />
              <Clerk.FieldError className="mt-2 text-destructive text-xs" />
            </Clerk.Field>

            <ClerkSignIn.Action
              submit
              className="flex w-full items-center justify-center gap-2 rounded-md border border-primary/20 bg-primary p-3 font-medium text-primary-foreground text-sm hover-transition hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98] touch-manipulation"
            >
              <Link weight="duotone" className="h-4 w-4" />
              send magic link
            </ClerkSignIn.Action>
          </form>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              we've sent a magic link to <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              check your email and click the link to sign in
            </p>
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="text-xs text-primary hover:underline"
            >
              use a different email
            </button>
          </div>
        )}
      </div>
    </ClerkSignIn.Step>
  );
};
