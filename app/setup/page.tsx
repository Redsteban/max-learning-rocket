'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SetupPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to registration wizard
    router.push('/register');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Setting up your account...</p>
      </div>
    </div>
  );
}