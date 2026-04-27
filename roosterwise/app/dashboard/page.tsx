import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { getCurrentSession } from '@/lib/session';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.adminEmail} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage your restaurant, workers, and tip payouts</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Restaurant Settings Card */}
          <Link href="/dashboard/restaurant">
            <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚙️</div>
              <h3 className="text-lg font-semibold mb-2">Restaurant Settings</h3>
              <p className="text-gray-600 text-sm mb-4">Manage restaurant profile and bank account</p>
              <div className="text-primary font-semibold text-sm">View & Manage →</div>
            </div>
          </Link>

          {/* Workers Card */}
          <Link href="/dashboard/workers">
            <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👥</div>
              <h3 className="text-lg font-semibold mb-2">Workers</h3>
              <p className="text-gray-600 text-sm mb-4">Add and manage worker information</p>
              <div className="text-primary font-semibold text-sm">View & Manage →</div>
            </div>
          </Link>

          {/* Payouts Card */}
          <Link href="/dashboard/payouts">
            <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💰</div>
              <h3 className="text-lg font-semibold mb-2">Tip Payouts</h3>
              <p className="text-gray-600 text-sm mb-4">Disburse end-of-day tips instantly</p>
              <div className="text-primary font-semibold text-sm">View & Manage →</div>
            </div>
          </Link>

          {/* Transaction History Card */}
          <Link href="/dashboard/transactions">
            <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
              <p className="text-gray-600 text-sm mb-4">View all payout transactions</p>
              <div className="text-primary font-semibold text-sm">View & Manage →</div>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-gray-50 rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-gray-600 mt-2">Active Workers</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">$0.00</div>
              <p className="text-gray-600 mt-2">Total Paid Out</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-gray-600 mt-2">Transactions</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
