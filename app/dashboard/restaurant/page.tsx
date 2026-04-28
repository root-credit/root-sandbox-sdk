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

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 lg:px-10 py-12">
        {/* Header */}
        <div className="mb-10">
          <Crumbs />
          <h1 className="font-display text-4xl md:text-5xl tracking-tightest mt-3">
            Restaurant
          </h1>
          <p className="text-neutral-500 mt-2 max-w-md">
            Your house profile and the funding source behind every payout.
          </p>
        </div>

        {/* Restaurant Info */}
        <section className="bg-surface border border-neutral-200 rounded-lg p-8 mb-8 shadow-sm-custom">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-eyebrow mb-1">Profile</p>
              <h2 className="font-display text-xl tracking-tightest">Restaurant information</h2>
            </div>
            {restaurant.bankAccountToken && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-success/20 bg-success-soft text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Bank linked
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <Field label="Restaurant name" value={restaurant.restaurantName} />
            <Field label="Email address" value={restaurant.adminEmail} mono />
            <Field label="Phone number" value={restaurant.phone} mono />
            <Field label="Root customer ID" value={restaurant.rootCustomerId} mono small />
          </div>
        </section>

        {/* Bank Account Section */}
        <section className="bg-surface border border-neutral-200 rounded-lg p-8 shadow-sm-custom">
          <p className="text-eyebrow mb-1">Funding</p>
          <h2 className="font-display text-xl tracking-tightest mb-2">
            Bank account for ACH transfers
          </h2>
          <p className="text-sm text-neutral-500 mb-6 max-w-xl">
            Link your restaurant&apos;s bank account to enable ACH debit pulls for funding
            your Roosterwise subaccount.
          </p>

          <BankAccountForm restaurantId={session.restaurantId} />

          <div className="mt-8 rounded-lg border border-neutral-200 bg-surface-2 p-5">
            <p className="text-eyebrow mb-2">Why link your bank account?</p>
            <ul className="text-sm text-neutral-600 space-y-1.5 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1 h-1 rounded-full bg-gold flex-none" />
                Fund your Roosterwise subaccount via ACH debit
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1 h-1 rounded-full bg-gold flex-none" />
                Fast and secure transfers
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1 h-1 rounded-full bg-gold flex-none" />
                Support for checking and savings accounts
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1 h-1 rounded-full bg-gold flex-none" />
                Direct integration with Root&apos;s payment infrastructure
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

function Crumbs() {
  return (
    <nav className="text-[11px] tracking-[0.18em] uppercase text-neutral-400 flex items-center gap-2">
      <Link href="/dashboard" className="hover:text-ink transition-smooth">
        Console
      </Link>
      <span className="text-neutral-300">/</span>
      <span className="text-ink">Restaurant</span>
    </nav>
  );
}

function Field({
  label,
  value,
  mono,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div>
      <div className="text-eyebrow mb-1.5">{label}</div>
      <div
        className={`${mono ? 'font-mono-tab' : 'font-medium'} ${
          small ? 'text-xs break-all text-neutral-500' : 'text-base text-foreground'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
