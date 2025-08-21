'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { SignIn as CustomSignInComponent } from '@/components/auth/signin';
import { LogsAnimation } from '@repo/ascii';

export default function SignInPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  // Effect to handle redirection after successful sign-in
  useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  const handleSignInComplete = () => {
    // router.push('/'); // Optionally, can also redirect here
  };

  // The onRedirect prop for the component might not be strictly necessary
  // if onSignInComplete and the page's useEffect handle all redirection cases.
  // It's kept for flexibility if the component needs to suggest a redirect path.
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

  // If user is already signed in and auth is loaded, they will be redirected by the useEffect.
  // We can still render the sign-in component, or a message, or null.
  // Rendering the component might be fine as Clerk itself might handle showing a signed-in state or redirecting.
  // if (isSignedIn) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen w-full">
  //       <div>Already signed in. Redirecting...</div>
  //     </div>
  //   );
  // }

  return (
    <CustomSignInComponent
      // appName="arbor" // appName comes from atom, renderLogo will display it
      onSignInComplete={handleSignInComplete}
      onRedirect={handleRedirect}
      renderLogo={renderLogsLogo}
    />
  );
}
