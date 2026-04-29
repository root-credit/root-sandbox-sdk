import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { BankAccountForm } from '@/components/BankAccountForm';
import { getCurrentSession } from '@/lib/session';
import { getPayer } from '@/lib/redis';
import { branding } from '@/lib/branding';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';

export default async function PayerSettingsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  const payer = await getPayer(session.payerId);

  if (!payer) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 lg:px-10 py-12">
        <div className="mb-10">
          <Crumbs />
          <h1 className="font-display text-4xl md:text-5xl tracking-tightest mt-3">
            {branding.payerSingular}
          </h1>
          <p className="text-neutral-500 mt-2 max-w-md">
            Your house profile and the funding source behind every payout.
          </p>
        </div>

        <Card className="mb-8 gap-0 bg-surface py-0 shadow-sm-custom ring-neutral-200">
          <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-neutral-200 pb-6">
            <div>
              <p className="text-eyebrow mb-1">Profile</p>
              <h2 className="font-display text-xl tracking-tightest">
                {branding.payerSingular} information
              </h2>
            </div>
            {payer.bankAccountToken && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-success/20 bg-success-soft text-success shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Bank linked
              </span>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <Field label={`${branding.payerSingular} name`} value={payer.payerName} />
              <Field label="Email address" value={payer.payerEmail} mono />
              <Field label="Phone number" value={payer.phone} mono />
              <Field label="Root payer ID" value={payer.rootPayerId} mono small />
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 bg-surface py-0 shadow-sm-custom ring-neutral-200">
          <CardHeader className="border-b border-neutral-200 pb-6">
            <p className="text-eyebrow mb-1">Funding</p>
            <h2 className="font-display text-xl tracking-tightest mb-2">
              Bank account for ACH transfers
            </h2>
            <p className="text-sm text-neutral-500 max-w-xl font-normal">
              Link your {branding.payerPossessive} bank account to enable ACH debit pulls for funding
              your {branding.productName} subaccount.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <BankAccountForm payerId={session.payerId} />

            <div className="mt-8 rounded-lg border border-neutral-200 bg-surface-2 p-5">
              <p className="text-eyebrow mb-2">Why link your bank account?</p>
              <ul className="text-sm text-neutral-600 space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="mt-2 w-1 h-1 rounded-full bg-gold flex-none" />
                  Fund your {branding.productName} subaccount via ACH debit
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
      <span className="text-ink">{branding.payerSingular}</span>
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
