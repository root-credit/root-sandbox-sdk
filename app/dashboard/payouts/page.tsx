'use client';

import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { TipPayoutForm } from '@/components/TipPayoutForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface Worker {
  id: string;
  name: string;
}

export default function PayoutsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const sessionResponse = await fetch('/api/session');
        if (!sessionResponse.ok) {
          router.push('/login');
          return;
        }
        const sessionData = await sessionResponse.json();
        setSession(sessionData);
        loadWorkers(sessionData.restaurantId);
      } catch (err) {
        router.push('/login');
      }
    }

    loadData();
  }, [router]);

  async function loadWorkers(restaurantId: string) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workers?restaurantId=${restaurantId}`);
      if (!response.ok) throw new Error('Failed to load workers');

      const data = await response.json();
      setWorkers(data.workers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workers');
    } finally {
      setIsLoading(false);
    }
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.adminEmail} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-primary hover:underline text-sm mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Tip Payouts</h1>
          <p className="text-gray-600 mt-2">Process end-of-day tips in 5 seconds</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mb-6">
            {error}
          </div>
        )}

        {/* Main Payout Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          {isLoading ? (
            <div className="text-center text-gray-600">Loading workers...</div>
          ) : (
            <TipPayoutForm
              restaurantId={session.restaurantId}
              workers={workers}
              onSuccess={() => setRefreshTrigger(refreshTrigger + 1)}
            />
          )}
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">How It Works</h3>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Enter end-of-day tip amounts for your workers</li>
              <li>Click &quot;Process Payouts Now&quot;</li>
              <li>Tips are instantly sent to worker bank accounts/cards</li>
              <li>Transaction history is saved automatically</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-3">Quick Tips</h3>
            <ul className="text-sm text-green-800 space-y-2 list-disc list-inside">
              <li>Payouts process in ~5 seconds per worker</li>
              <li>Worker payment methods must be linked first</li>
              <li>Funds come from your bank account link</li>
              <li>Check transaction history anytime</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
