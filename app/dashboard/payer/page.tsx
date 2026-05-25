import { redirect } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { DashboardShell } from '@/components/DashboardShell';
import { BankAccountForm } from '@/components/BankAccountForm';
import { PayerSubaccountSection } from '@/components/PayerSubaccountSection';
import { getCurrentSession } from '@/lib/session';
import { getPayer } from '@/lib/redis';
import { branding } from '@/lib/branding';
import { Badge } from '@/components/ui/badge';

export default async function AccountSettingsPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const payer = await getPayer(session.payerId);
  if (!payer) redirect('/login');

  return (
    <DashboardShell email={session.payerEmail}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{branding.payerSingular}</h1>
          <p className="text-muted-foreground mt-1">
            Your profile, linked bank account, and {branding.walletName}.
          </p>
        </div>
        {payer.bankAccountToken && (
          <Badge variant="success" className="font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {branding.funderShortLabel} linked
          </Badge>
        )}
      </div>

      {/* Profile */}
      <section className="rounded-lg border border-border bg-background mb-6">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">
            Account information
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your personal details for this {branding.productName} account.
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
          <ProfileField label="Full name" value={payer.payerName} />
          <ProfileField label="Email address" value={payer.payerEmail} />
          <ProfileField label="Phone number" value={payer.phone} />
          <ProfileField label="Account ID" value={payer.rootPayerId} small />
        </div>
      </section>

      {/* Bank account */}
      <section className="rounded-lg border border-border bg-background mb-6">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">{branding.funderLabel}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Link your bank account to fund your {branding.walletName} and receive withdrawals.
          </p>
        </div>
        <div className="p-6 flex flex-col gap-6">
          <BankAccountForm payerId={session.payerId} />

          <div className="rounded-lg bg-[#F4F4F4] p-5">
            <p className="text-xs font-medium text-primary mb-3">
              Why link a bank account?
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-foreground">
              {[
                `Fund your ${branding.walletName} via ACH`,
                'Withdraw your balance anytime',
                'Secure and encrypted connection',
                'Works with checking and savings accounts',
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
    </DashboardShell>
  );
}

function ProfileField({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">
        {label}
      </p>
      <p
        className={`font-medium ${
          small ? 'text-xs break-all text-muted-foreground' : 'text-base text-foreground'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
