'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { SignUp as CustomSignUpComponent } from '@/components/auth/signup'; // Adjusted import path
import { LogsAnimation } from '@/lib/ascii';

export default function SignUpPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  // Effect to handle redirection after successful sign-up or if already signed in
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (isSignedIn) {
      router.push('/');
      return;
    }

    // Handle /signup/continue scenario
    // This specific logic might be better placed inside the Clerk flow if possible,
    // or by listening to specific Clerk events that lead to this state.
    // For now, keeping it as a pathname check.
    if (window.location.pathname.endsWith('/signup/continue')) {
      // This could indicate a completed step or an already signed-in state if Clerk redirected here.
      // The isSignedIn check above should ideally catch fully signed-in users.
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSignUpComplete = () => {
    // router.push('/'); // Can also redirect here, but useEffect is preferred for consistency
  };

  const handleRedirect = (path: string) => {
    router.push(path);
  };

  // Define the renderLogo function with LogsAnimation
  const renderLogsLogo = () => (
    <div className="mb-6 flex flex-col items-center justify-center">
      <LogsAnimation 
        width={60} 
        height={12} 
        fps={12}
        logCount={6}
        floating={true}
        rotation={true}
        moss={false}
        water={false}
      />
    </div>
  );

  if (!isLoaded) {
    return (
      <div className="flex w-full flex-col items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // If user is already signed in and auth is loaded, they will be redirected by the useEffect.
  // Rendering the component might be fine as Clerk itself might handle showing a signed-in state or redirecting.

  return (
    <CustomSignUpComponent
      // appName="arbor" // appName comes from atom, renderLogo will display it
      onSignUpComplete={handleSignUpComplete}
      onRedirect={handleRedirect} // For any explicit redirects the component might trigger
      renderLogo={renderLogsLogo} // <-- Pass the function
    />
  );
}
