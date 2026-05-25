import Link from 'next/link';
import { SignupForm } from '@/components/SignupForm';
import { branding } from '@/lib/branding';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <img 
              src="https://logo.clearbit.com/wise.com" 
              height={28}
              width={28}
              alt="Wise"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'inline';
              }}
              className="h-7 w-auto"
            />
            <span style={{ display: 'none' }} className="text-lg font-semibold text-[#9FE870]">
              {branding.productName}
            </span>
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center bg-background">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance leading-[1.1] text-foreground">
              Open your {branding.productName} account
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
              Create an account in under two minutes. We&apos;ll set up your {branding.walletName}, 
              ready to fund and send money abroad.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Free to open, no minimum balance
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Send money to 80+ countries
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Always the real exchange rate
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-background p-7 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Register</h2>
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
                <span className="bg-background px-2 text-muted-foreground font-medium tracking-widest">
                  Already have an account?
                </span>
              </div>
            </div>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-full border-2 border-foreground h-11 px-5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
            >
              Log in instead
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
