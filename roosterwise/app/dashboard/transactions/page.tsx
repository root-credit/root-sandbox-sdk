'use client';

import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface Transaction {
  id: string;
  workerName: string;
  workerEmail: string;
  amount: number;
  status: string;
  createdAt: number;
  completedAt: number;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
        loadTransactions(sessionData.restaurantId);
      } catch (err) {
        router.push('/login');
      }
    }

    loadData();
  }, [router]);

  async function loadTransactions(restaurantId: string) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/payouts?restaurantId=${restaurantId}`);
      if (!response.ok) throw new Error('Failed to load transactions');

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }

  if (!session) {
    return null;
  }

  const totalPaidOut = transactions.reduce((sum, t) => sum + t.amount, 0);
  const successfulTransactions = transactions.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.adminEmail} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-primary hover:underline text-sm mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-gray-600 mt-2">All tip payouts processed through Roosterwise</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600 text-sm">Total Paid Out</p>
            <p className="text-3xl font-bold text-primary mt-2">
              ${(totalPaidOut / 100).toFixed(2)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600 text-sm">Successful Transactions</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {successfulTransactions}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600 text-sm">Total Transactions</p>
            <p className="text-3xl font-bold text-primary mt-2">
              {transactions.length}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-600">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-4">No transactions yet</p>
              <Link
                href="/dashboard/payouts"
                className="text-primary hover:underline"
              >
                Process your first payout
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Worker</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{transaction.workerName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.workerEmail}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        ${(transaction.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status === 'completed' ? '✓ Completed' : transaction.status === 'pending' ? '⏳ Pending' : '✕ Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
