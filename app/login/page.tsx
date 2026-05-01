import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';
import { branding } from '@/lib/branding';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Mark className="h-8 w-8 text-primary" />
            <span className="text-xl font-extrabold tracking-tight text-primary">
              {branding.productName.toLowerCase()}
            </span>
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -right-24 h-[24rem] w-[24rem] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-[20rem] w-[20rem] rounded-full bg-accent/30 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              {branding.payerSingular} sign-in
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-balance leading-[1.02]">
              Welcome{' '}
              <span className="relative inline-block">
                <span className="relative z-10">back.</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-primary -z-0" aria-hidden />
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
              Sign in with the email you used when you opened your {branding.payerSingular.toLowerCase()}.
              Your {branding.productName} wallet, hosted homes, and trips are waiting.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                One wallet for hosting and traveling
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Bank-grade security on every transfer
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Full activity ledger on every move
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border-2 bg-card p-7 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold tracking-tight">Sign in</h2>
              <p className="text-base text-muted-foreground mt-1">
                Enter your email to continue.
              </p>
            </div>
            <LoginForm />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-bold tracking-widest">
                  New here?
                </span>
              </div>
            </div>
            <Link
              href="/signup"
              className="flex w-full items-center justify-center rounded-full border-2 border-foreground h-11 px-5 text-sm font-bold transition-colors hover:bg-foreground hover:text-background"
            >
              Open a {branding.productName} {branding.payerSingular.toLowerCase()}
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

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
      <path d="M16 2c2.5 0 4.6 1.7 5.5 4 .5 1.4 1.1 2.7 1.7 4 1.4 2.9 3 5.6 4.4 8.5 1 2 1.4 4.2.6 6.4-1 2.7-3.4 4.4-6.3 4.6-2.6.2-4.7-1-6.4-2.8-1.7 1.8-3.8 3-6.4 2.8-2.9-.2-5.3-1.9-6.3-4.6-.8-2.2-.4-4.4.6-6.4 1.4-2.9 3-5.6 4.4-8.5.6-1.3 1.2-2.6 1.7-4C11.4 3.7 13.5 2 16 2Zm0 4.4c-1.2 0-2 .9-2.5 2.1-.5 1.3-1 2.5-1.7 3.7-1.4 2.7-2.9 5.3-4.2 8-.6 1.2-.7 2.4-.2 3.6.6 1.5 2 2.4 3.7 2.4 1.6 0 3-.7 4.3-2-.6-.8-1.1-1.7-1.6-2.6-.7-1.4-.4-3 .8-3.9 1.2-1 3-.9 4.1.2 1.1 1.1 1.2 2.9.2 4.1-.5.6-.9 1.3-1.4 2-.1.1-.1.2 0 .3 1.3 1.2 2.7 1.9 4.3 1.9 1.7 0 3.1-.9 3.7-2.4.5-1.2.4-2.4-.2-3.6-1.3-2.7-2.8-5.3-4.2-8-.7-1.2-1.2-2.4-1.7-3.7-.5-1.2-1.3-2.1-2.5-2.1Z" />
    </svg>
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
