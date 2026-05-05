import Link from 'next/link';
import { SignupForm } from '@/components/SignupForm';
import { branding } from '@/lib/branding';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-black">
              {branding.productName.charAt(0)}
            </span>
            <span className="text-lg font-extrabold tracking-tight">{branding.productName}</span>
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center bg-secondary">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              New {branding.payerSingular.toLowerCase()}
            </span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-balance leading-[1.02]">
              Open your <span className="text-primary">console.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
              Onboard your {branding.payerSingular.toLowerCase()} in under two minutes. We&apos;ll
              spin up your {branding.productName} wallet, ready to fund and start paying out
              tips tonight.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Same-day onboarding, sandbox-safe
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Add unlimited {branding.payeePlural.toLowerCase()} — front and back of house
              </li>
              <li className="flex items-center gap-3">
                <Check />
                {branding.payoutVerb} to bank or debit card — your crew picks
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border-2 bg-card p-7 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight">
                Create your {branding.payerSingular.toLowerCase()} account
              </h2>
              <p className="text-base text-muted-foreground mt-1">
                Tell us a bit about your business.
              </p>
            </div>
            <SignupForm />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-bold tracking-widest">
                  Already onboarded?
                </span>
              </div>
            </div>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-full border-2 border-foreground h-11 px-5 text-sm font-bold transition-colors hover:bg-foreground hover:text-background"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card">
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
