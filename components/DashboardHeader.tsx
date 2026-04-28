'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DashboardHeader({ email }: { email: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      document.cookie = 'session=; path=/; max-age=0';
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-primary">Roosterwise</div>
        
        <div className="flex items-center gap-6">
          <span className="text-gray-600 text-sm">{email}</span>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
}
