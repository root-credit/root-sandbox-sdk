import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { BankAccountForm } from '@/components/BankAccountForm';
import { getCurrentSession } from '@/lib/session';
import { getPayer } from '@/lib/redis';
import { branding } from '@/lib/branding';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

      <main className="flex-1 mx-auto max-w-5xl w-full px-6 lg:px-10 py-8">
        <div className="mb-8">
          <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Console</Link>
            <span>/</span>
            <span className="text-foreground">{branding.payerSingular}</span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight">{branding.payerSingular}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your organization profile and the funding source behind every payout.
          </p>
        </div>

        {/* Profile card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>{branding.payerSingular} information</CardTitle>
              <CardDescription className="mt-1">Your operator account details.</CardDescription>
            </div>
            {payer.bankAccountToken && (
              <Badge variant="success" className="shrink-0">Bank linked</Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
              <ProfileField label={`${branding.payerSingular} name`} value={payer.payerName} />
              <ProfileField label="Email address" value={payer.payerEmail} mono />
              <ProfileField label="Phone number" value={payer.phone} mono />
              <ProfileField label="Root payer ID" value={payer.rootPayerId} mono small />
            </div>
          </CardContent>
        </Card>

        {/* Bank account card */}
        <Card>
          <CardHeader>
            <CardTitle>Bank account</CardTitle>
            <CardDescription>
              Link your {branding.payerPossessive} bank account to enable ACH debit pulls for
              funding your {branding.productName} subaccount.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <BankAccountForm payerId={session.payerId} />

            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
                Why link your bank account?
              </p>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {[
                  `Fund your ${branding.productName} subaccount via ACH debit`,
                  'Fast and secure transfers',
                  'Support for checking and savings accounts',
                  `Direct integration with Root's payment infrastructure`,
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 rounded-full bg-primary flex-none" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
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
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <p
        className={`${mono ? 'font-mono' : 'font-medium'} ${
          small ? 'text-xs break-all text-muted-foreground' : 'text-sm'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
