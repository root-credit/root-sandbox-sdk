'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { PayeeForm } from '@/components/PayeeForm';
import { branding } from '@/lib/branding';
import { useSession } from '@/lib/hooks/useSession';
import { usePayees } from '@/lib/hooks/usePayees';
import { useRemovePayee } from '@/lib/hooks/useCreatePayee';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PayeesPage() {
  const router = useRouter();
  const { session } = useSession();
  const payerId = session?.payerId ?? null;
  const { payees, isLoading, error: loadError, refresh, setPayees } = usePayees(payerId);
  const { removePayee } = useRemovePayee();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session === undefined) router.push('/login');
  }, [session, router]);

  useEffect(() => {
    if (loadError) setError(loadError);
  }, [loadError]);

  async function handleDelete(payeeId: string) {
    if (!payerId) return;
    if (!confirm(`Are you sure you want to delete this ${branding.payeeSingular.toLowerCase()}?`)) return;
    try {
      await removePayee(payerId, payeeId);
      setPayees(payees.filter((p) => p.id !== payeeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 py-12">
        <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <Crumbs />
            <h1 className="font-display text-4xl md:text-5xl tracking-tightest mt-3">
              {branding.payeePlural}
            </h1>
            <p className="text-neutral-500 mt-2 max-w-md">
              Manage the people you pay and the payout rail attached to each.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-smooth shadow-sm-custom ${
              showForm
                ? 'bg-neutral-100 text-ink border border-neutral-200 hover:bg-neutral-200'
                : 'bg-ink text-white hover:bg-ink-soft'
            }`}
          >
            {showForm ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                </svg>
                Close
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                Add {branding.payeeSingular.toLowerCase()}
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 bg-error-soft border border-error/20 rounded-md text-error text-sm mb-6">
            {error}
          </div>
        )}

        {showForm && (
          <Card className="mb-8 gap-0 bg-surface py-0 shadow-sm-custom ring-neutral-200">
            <CardHeader className="border-b border-neutral-200 pb-6">
              <p className="text-eyebrow mb-1">New record</p>
              <h2 className="font-display text-2xl tracking-tightest mb-0">
                Add a {branding.payeeSingular.toLowerCase()}
              </h2>
            </CardHeader>
            <CardContent className="pt-6">
              <PayeeForm
                payerId={session.payerId}
                onSuccess={() => {
                  setShowForm(false);
                  refresh();
                }}
              />
            </CardContent>
          </Card>
        )}

        <Card className="gap-0 overflow-hidden bg-surface py-0 shadow-sm-custom ring-neutral-200">
          <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-neutral-500">
              Loading {branding.payeePlural.toLowerCase()}…
            </div>
          ) : payees.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="font-display text-xl tracking-tightest">
                No {branding.payeePlural.toLowerCase()} yet
              </h3>
              <p className="text-neutral-500 mt-2 mb-6 text-sm">
                Add your first {branding.payeeSingular.toLowerCase()} to start running {branding.payoutNounPlural.toLowerCase()}.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-ink text-white text-sm font-medium hover:bg-ink-soft transition-smooth"
              >
                Add your first {branding.payeeSingular.toLowerCase()}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] tracking-[0.14em] uppercase text-neutral-500 bg-neutral-100/60 border-b border-neutral-200">
                    <th className="px-6 py-3 text-left font-medium">Name</th>
                    <th className="px-6 py-3 text-left font-medium">Email</th>
                    <th className="px-6 py-3 text-left font-medium">Phone</th>
                    <th className="px-6 py-3 text-left font-medium">Rail</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payees.map((payee) => (
                    <tr
                      key={payee.id}
                      className="border-b border-neutral-150 last:border-b-0 hover:bg-neutral-50/60 transition-smooth"
                    >
                      <td className="px-6 py-4 text-sm font-medium">{payee.name}</td>
                      <td className="px-6 py-4 text-sm text-neutral-500 font-mono-tab">
                        {payee.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500 font-mono-tab">
                        {payee.phone}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <RailBadge type={payee.paymentMethodType} />
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => handleDelete(payee.id)}
                          className="text-neutral-500 hover:text-error font-medium transition-smooth"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </CardContent>
        </Card>
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
      <span className="text-ink">{branding.payeePlural}</span>
    </nav>
  );
}

function RailBadge({ type }: { type: 'bank_account' | 'debit_card' }) {
  const isBank = type === 'bank_account';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] tracking-[0.05em] font-medium border ${
        isBank
          ? 'bg-info-soft border-info/20 text-info'
          : 'bg-success-soft border-success/20 text-success'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isBank ? 'bg-info' : 'bg-success'}`} />
      {isBank ? 'Bank account' : 'Debit card'}
    </span>
  );
}
