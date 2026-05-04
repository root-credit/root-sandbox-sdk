import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { BankAccountForm } from '@/components/BankAccountForm';
import { PayerSubaccountSection } from '@/components/PayerSubaccountSection';
import { getCurrentSession } from '@/lib/session';
import { getPayer } from '@/lib/redis';
import { branding } from '@/lib/branding';
import { Badge } from '@/components/ui/badge';

export default async function PayerSettingsPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const payer = await getPayer(session.payerId);
  if (!payer) redirect('/login');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-5xl w-full px-6 lg:px-10 py-8">
        <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
          <Link href="/dashboard" className="hover:text-foreground transition-colors font-semibold">
            Console
          </Link>
          <span>/</span>
          <span className="text-foreground font-bold">{branding.payerSingular}</span>
        </nav>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">{branding.payerSingular}</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Your profile, your {branding.funderShortLabel.toLowerCase()}, and the{' '}
              {branding.productName} wallet behind every shift you staff.
            </p>
          </div>
          {payer.bankAccountToken && (
            <Badge variant="success" className="font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {branding.funderShortLabel} linked
            </Badge>
          )}
        </div>

        {/* Profile */}
        <section className="rounded-2xl border-2 bg-card mb-6">
          <div className="border-b-2 px-6 py-5">
            <h2 className="text-xl font-extrabold tracking-tight">
              {branding.payerSingular} information
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              The details we use across your console.
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
            <ProfileField label={`${branding.payerSingular} name`} value={payer.payerName} />
            <ProfileField label="Email address" value={payer.payerEmail} mono />
            <ProfileField label="Phone number" value={payer.phone} mono />
            <ProfileField label="Root payer ID" value={payer.rootPayerId} mono small />
          </div>
        </section>

        {/* Bank account */}
        <section className="rounded-2xl border-2 bg-card mb-6">
          <div className="border-b-2 px-6 py-5">
            <h2 className="text-xl font-extrabold tracking-tight">{branding.funderLabel}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Link your {branding.payerPossessive} bank to fund your {branding.productName}{' '}
              wallet via ACH.
            </p>
          </div>
          <div className="p-6 flex flex-col gap-6">
            <BankAccountForm payerId={session.payerId} />

            <div className="rounded-xl bg-secondary p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                Why link a {branding.funderShortLabel.toLowerCase()}?
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-foreground">
                {[
                  `Fund your ${branding.productName} wallet via ACH debit`,
                  'Fast and secure transfers',
                  'Support for checking and savings accounts',
                  'Direct integration with Root infrastructure',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-none" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Wallet (subaccount) */}
        <PayerSubaccountSection
          payerId={session.payerId}
          payerName={payer.payerName}
          subaccountId={payer.subaccountId}
          hasLinkedBank={Boolean(payer.bankAccountToken)}
        />
      </main>
    </div>
  );
}

function ProfileField({
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
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </p>
      <p
        className={`${mono ? 'font-mono' : 'font-bold'} ${
          small ? 'text-xs break-all text-muted-foreground' : 'text-base'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
