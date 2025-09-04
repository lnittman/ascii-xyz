'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function SignUpRedirectPage() {
  useEffect(() => {
    redirect('/signin');
  }, []);

  return null;
}

