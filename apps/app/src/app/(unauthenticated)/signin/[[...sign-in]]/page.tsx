import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn 
        routing="path"
        path="/signin"
        signUpUrl="/signup"
        fallbackRedirectUrl="/"
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-background border border-border shadow-none',
            headerTitle: 'text-2xl font-normal lowercase',
            headerSubtitle: 'text-muted-foreground',
            socialButtonsBlockButton: 'border border-border hover:bg-accent',
            formButtonPrimary: 'bg-primary hover:bg-primary/90',
            footerActionLink: 'text-primary hover:text-primary/90',
            identityPreviewEditButton: 'text-primary hover:text-primary/90',
            formFieldLabel: 'text-foreground',
            formFieldInput: 'bg-background border-border',
            dividerLine: 'bg-border',
            dividerText: 'text-muted-foreground',
          },
        }}
      />
    </div>
  );
}
