import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';
import { branding } from '@/lib/branding';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-extrabold">
              <CoinbaseIcon />
            </div>
            <span className="text-lg font-extrabold tracking-tight">{branding.productName}</span>
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-md px-6 py-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Sign in to {branding.productName}</h1>
            <p className="text-muted-foreground mt-2">Enter your email to access your account.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-7 shadow-xl">
            <LoginForm />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-bold tracking-widest">New to {branding.productName}?</span>
              </div>
            </div>
            <Link
              href="/signup"
              className="flex w-full items-center justify-center rounded-full border border-border h-11 px-5 text-sm font-bold transition-colors hover:bg-secondary hover:border-primary"
            >
              Create an account
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Sandbox environment — no real money is moved.
          </p>
        </div>
      </section>
    </main>
  );
}

function CoinbaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4ZM12 16.5C9.51 16.5 7.5 14.49 7.5 12C7.5 9.51 9.51 7.5 12 7.5C14.49 7.5 16.5 9.51 16.5 12C16.5 14.49 14.49 16.5 12 16.5Z" fill="white" />
    </svg>
  );
}
