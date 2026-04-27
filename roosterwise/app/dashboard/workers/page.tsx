'use client';

import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { WorkerForm } from '@/components/WorkerForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  paymentMethodType: 'bank_account' | 'debit_card';
  createdAt: number;
}

export default function WorkersPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
        loadWorkers(sessionData.restaurantId);
      } catch (err) {
        router.push('/login');
      }
    }

    loadData();
  }, [router]);

  async function loadWorkers(restaurantId: string) {
    try {
      setIsLoadingWorkers(true);
      const response = await fetch(`/api/workers?restaurantId=${restaurantId}`);
      if (!response.ok) throw new Error('Failed to load workers');

      const data = await response.json();
      setWorkers(data.workers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workers');
    } finally {
      setIsLoadingWorkers(false);
    }
  }

  async function deleteWorker(workerId: string) {
    if (!confirm('Are you sure you want to delete this worker?')) return;

    try {
      const response = await fetch(`/api/workers/${workerId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: session.restaurantId }),
      });

      if (!response.ok) throw new Error('Failed to delete worker');

      setWorkers(workers.filter(w => w.id !== workerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete worker');
    }
  }

  if (!session) {
    return null; // Loading
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Workers</h1>
              <p className="text-gray-600 mt-2">Manage restaurant workers and their payment methods</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              {showForm ? '✕ Close' : '+ Add Worker'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mb-6">
            {error}
          </div>
        )}

        {/* Add Worker Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6">Add New Worker</h2>
            <WorkerForm
              restaurantId={session.restaurantId}
              onSuccess={() => {
                setShowForm(false);
                loadWorkers(session.restaurantId);
              }}
            />
          </div>
        )}

        {/* Workers List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {isLoadingWorkers ? (
            <div className="p-8 text-center text-gray-600">Loading workers...</div>
          ) : workers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-4">No workers added yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-primary hover:underline"
              >
                Add your first worker
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Payment Method</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker) => (
                    <tr key={worker.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{worker.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{worker.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{worker.phone}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          worker.paymentMethodType === 'bank_account'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {worker.paymentMethodType === 'bank_account' ? 'Bank Account' : 'Debit Card'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => deleteWorker(worker.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
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
