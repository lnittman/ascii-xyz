'use client';

import { useAuth } from '@repo/auth/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SignIn as CustomSignInComponent } from '@/components/auth/signin';
import { LogsAnimation } from '@/lib/ascii';

export default function SignInPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  const handleSignInComplete = () => {
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

  return (
    <CustomSignInComponent
      onSignInComplete={handleSignInComplete}
      onRedirect={handleRedirect}
      renderLogo={renderLogsLogo}
    />
  );
}
