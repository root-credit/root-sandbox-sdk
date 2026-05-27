import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';
import { branding } from '@/lib/branding';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.03em', color: '#1A1A1A' }}>
              {branding.productName}
            </span>
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center relative overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              {branding.payerSingular} sign-in
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-balance leading-[1.02]">
              Welcome{' '}
              <span className="relative inline-block">
                <span className="relative z-10">back.</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-primary/30 -z-0" aria-hidden />
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
              Sign in with the email you used when you opened your {branding.productName} account.
              Your {branding.walletName} and savings are waiting.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                No monthly fees or minimums
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Get paid up to 2 days early
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Earn 2.00% APY on savings
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-7 shadow-xl">
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
              Open a {branding.productName} account
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t bg-background">
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
