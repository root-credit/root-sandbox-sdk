import Link from 'next/link';
import { SignupForm } from '@/components/SignupForm';
import { branding } from '@/lib/branding';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
              {branding.productName.charAt(0)}
            </div>
            <span className="font-semibold tracking-tight">{branding.productName}</span>
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              New account
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.1]">
              Open your console.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
              Spin up an operator account in under two minutes. We&apos;ll provision your Root
              payer, your {branding.payerSingular.toLowerCase()} subaccount, and a clean ledger —
              wired to the team you add next.
            </p>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-none" />
                Same-day onboarding, sandbox-safe
              </li>
              <li className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-none" />
                Bank or debit card payouts per {branding.payeeSingular.toLowerCase()}
              </li>
              <li className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-none" />
                One ledger, every payout, every time
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="font-semibold tracking-tight text-lg">Create your account</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tell us about your {branding.payerSingular.toLowerCase()}.
              </p>
            </div>
            <SignupForm />
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Already onboarded?</span>
              </div>
            </div>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Sign in to an existing console
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted-foreground">
          Sandbox environment — no real money is moved.
        </div>
      </footer>
    </main>
  );
}
