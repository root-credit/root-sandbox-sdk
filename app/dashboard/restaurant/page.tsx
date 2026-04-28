import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { BankAccountForm } from '@/components/BankAccountForm';
import { getCurrentSession } from '@/lib/session';
import { getRestaurant } from '@/lib/redis';
import Link from 'next/link';

export default async function RestaurantSettingsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  const restaurant = await getRestaurant(session.restaurantId);

  if (!restaurant) {
    redirect('/login');
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
          <h1 className="text-3xl font-bold">Restaurant Settings</h1>
          <p className="text-gray-600 mt-2">Manage your restaurant profile and bank account</p>
        </div>

        {/* Restaurant Info Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Restaurant Information</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Restaurant Name</label>
              <p className="text-lg font-semibold mt-1">{restaurant.restaurantName}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600">Email Address</label>
              <p className="text-lg font-semibold mt-1">{restaurant.adminEmail}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600">Phone Number</label>
              <p className="text-lg font-semibold mt-1">{restaurant.phone}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600">Root Customer ID</label>
              <p className="text-sm font-mono mt-1 text-gray-700 break-all">{restaurant.rootCustomerId}</p>
            </div>

            {restaurant.bankAccountToken && (
              <div className="bg-green-50 border border-green-200 rounded p-4 mt-4">
                <p className="text-sm text-green-800">
                  ✓ Bank account linked and ready for payouts
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bank Account Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-6">Bank Account for ACH Transfers</h2>
          <p className="text-gray-600 mb-6">
            Link your restaurant&apos;s bank account to enable ACH debit pulls for funding your Roosterwise subaccount.
          </p>

          <BankAccountForm restaurantId={session.restaurantId} />

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Why link your bank account?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Fund your Roosterwise subaccount via ACH debit</li>
              <li>• Fast and secure transfers</li>
              <li>• Support for checking and savings accounts</li>
              <li>• Direct integration with Root&apos;s payment infrastructure</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
