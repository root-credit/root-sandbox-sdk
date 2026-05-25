import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';
import { branding } from '@/lib/branding';
import { WiseLogo } from '@/components/WiseLogo';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <WiseLogo size={28} />
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center bg-background">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance leading-[1.1] text-foreground">
              Welcome back
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
              Log in to your {branding.productName} account to send money abroad, 
              check your {branding.walletName}, and manage your transfers.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Send to 80+ countries
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Real exchange rate, low fees
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Track every transfer
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-background p-7 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Log in</h2>
              <p className="text-base text-muted-foreground mt-1">
                Enter your email to continue.
              </p>
            </div>
            <LoginForm />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium tracking-widest">
                  New to {branding.productName}?
                </span>
              </div>
            </div>
            <Link
              href="/signup"
              className="flex w-full items-center justify-center rounded-full border-2 border-foreground h-11 px-5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
            >
              Register for free
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
