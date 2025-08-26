'use client';

import { useAuth } from '@repo/auth/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SignUp as CustomSignUpComponent } from '@/components/auth/signup';
import { LogsAnimation } from '@/lib/ascii';

export default function SignUpPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    
    if (isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSignUpComplete = () => {
    // Handled by useEffect
  };

  const handleRedirect = (path: string) => {
    router.push(path);
  };

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

  return (
    <CustomSignUpComponent
      onSignUpComplete={handleSignUpComplete}
      onRedirect={handleRedirect}
      renderLogo={renderLogsLogo}
    />
  );
}
