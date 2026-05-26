import Link from 'next/link';
import { SignupForm } from '@/components/SignupForm';
import { branding } from '@/lib/branding';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://logo.clearbit.com/coinbase.com"
              height={24}
              width={24}
              alt=""
              className="object-contain"
            />
            <span
              className="text-xl font-extrabold tracking-tight"
              style={{ letterSpacing: '-0.03em', color: '#0052FF' }}
            >
              {branding.productName}
            </span>
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -right-24 h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-[20rem] w-[20rem] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              New {branding.payerSingular.toLowerCase()}
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-balance leading-[1.02] text-foreground">
              Open your{' '}
              <span className="text-primary">console.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
              Create an {branding.payerSingular.toLowerCase()} in under two minutes. We&apos;ll set up
              your {branding.walletName}, ready to fund and trade.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Same-day onboarding, sandbox-safe
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Buy and sell BTC, ETH, SOL, USDC
              </li>
              <li className="flex items-center gap-3">
                <Check />
                {branding.payoutVerb} to {branding.payeePlural.toLowerCase()} — bank or card
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-7 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Create your {branding.payerSingular.toLowerCase()}</h2>
              <p className="text-base text-muted-foreground mt-1">
                Tell us a bit about yourself.
              </p>
            </div>
            <SignupForm />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-bold tracking-widest">
                  Already onboarded?
                </span>
              </div>
            </div>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-xl border border-border h-11 px-5 text-sm font-bold text-foreground transition-colors hover:bg-card hover:border-primary/50"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-muted-foreground">
          Sandbox environment — no real money is moved.
        </div>
      </footer>
    </main>
  );
}

function Check() {
  return (
    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary">
      <svg
        className="h-3 w-3 text-primary-foreground"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M2.5 6.5L5 9l4.5-5.5" />
      </svg>
    </span>
  );
}
