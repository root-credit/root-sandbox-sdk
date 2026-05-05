import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  CheckCircle2,
  CreditCard,
  Landmark,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { EmployeePaymentMethodForm } from '@/components/EmployeePaymentMethodForm';
import { EmployeePaystubsSection } from '@/components/EmployeePaystubsSection';
import {
  getMyEmployeeProfile,
  getMyPaystubs,
  signOutEmployee,
} from '@/lib/employee-actions';
import { Badge } from '@/components/ui/badge';
import { branding } from '@/lib/branding';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `My tips · ${branding.productName}`,
};

export default async function EmployeeDashboardPage() {
  const profile = await getMyEmployeeProfile();
  if (!profile) redirect('/employee/login');

  const { payee, employerName, hasPaymentMethod } = profile;
  const paystubs = await getMyPaystubs();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b-2 bg-card">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-black tracking-tight">
                {branding.productName.charAt(0)}
              </span>
            </div>
            <span className="font-black tracking-tight text-lg">
              {branding.productName}
            </span>
          </Link>
          <form
            action={async () => {
              'use server';
              await signOutEmployee();
              redirect('/employee/login');
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-6 lg:px-10 py-8">
        {/* Hero */}
        <section className="rounded-3xl border-2 bg-secondary p-8 md:p-10 mb-8 relative overflow-hidden">
          <div
            className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-foreground mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
              My tips
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-balance leading-[1.05] max-w-3xl">
              Welcome back, {payee.name.split(' ')[0]}.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-2xl leading-relaxed">
              You&apos;re part of <strong className="text-foreground">{employerName}</strong>&apos;s
              crew on {branding.productName}. Manage where your tips land below.
            </p>
          </div>
        </section>

        {/* Status row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatusCard
            label="Payout method"
            value={hasPaymentMethod ? 'Set up' : 'Not set up'}
            icon={
              hasPaymentMethod ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )
            }
            tone={hasPaymentMethod ? 'success' : 'warn'}
          />
          <StatusCard
            label="Method type"
            value={
              !hasPaymentMethod
                ? '—'
                : payee.paymentMethodType === 'bank_account'
                  ? 'Bank account'
                  : 'Debit card'
            }
            icon={
              payee.paymentMethodType === 'debit_card' ? (
                <CreditCard className="h-4 w-4" />
              ) : (
                <Landmark className="h-4 w-4" />
              )
            }
          />
          <StatusCard
            label={branding.payerSingular}
            value={employerName}
            icon={<ShieldCheck className="h-4 w-4" />}
          />
        </section>

        {/* Tip history (live-updating client island) */}
        <EmployeePaystubsSection
          initialData={paystubs}
          employerName={employerName}
        />

        {/* Profile + form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile */}
          <section className="rounded-2xl border-2 bg-card p-6 lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Your details
            </p>
            <h2 className="text-xl font-black tracking-tight mb-4">
              {payee.name}
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-none" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Email
                  </p>
                  <p className="font-mono text-xs break-all">{payee.email}</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-none" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Phone
                  </p>
                  <p className="font-mono text-xs">{payee.phone || '—'}</p>
                </div>
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Your sign-in email
              </p>
              <p className="text-xs leading-relaxed text-foreground">
                If you need to update your name, email, or phone, ask{' '}
                <strong>{employerName}</strong> to make the change in their
                console.
              </p>
            </div>
          </section>

          {/* Payment method */}
          <section className="rounded-2xl border-2 bg-card p-6 lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                  Tip payouts
                </p>
                <h2 className="text-xl font-black tracking-tight">
                  {hasPaymentMethod
                    ? 'Update where tips land'
                    : 'Choose where tips land'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-md leading-relaxed">
                  Pick how you want to be paid. Bank accounts use ACH or instant
                  bank rails; debit cards receive instant pushes.
                </p>
              </div>
              {hasPaymentMethod ? (
                <Badge variant="success" className="font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Method on file
                </Badge>
              ) : (
                <Badge variant="outline" className="font-bold border-dashed">
                  Pending
                </Badge>
              )}
            </div>

            <EmployeePaymentMethodForm hasExisting={hasPaymentMethod} />
          </section>
        </div>

        <p className="mt-8 text-xs text-muted-foreground text-center max-w-xl mx-auto leading-relaxed">
          Payments are processed by Root through {branding.productName}. Your
          bank or card details are sent directly to Root and never stored in the{' '}
          {branding.productName} app.
        </p>
      </main>
    </div>
  );
}

function StatusCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: 'success' | 'warn';
}) {
  return (
    <div className="rounded-2xl border-2 bg-card p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={`text-xl font-black tracking-tight ${
          tone === 'warn'
            ? 'text-foreground'
            : tone === 'success'
              ? 'text-primary'
              : 'text-foreground'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
