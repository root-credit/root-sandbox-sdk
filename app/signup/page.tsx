import Link from 'next/link';
import { SignupForm } from '@/components/SignupForm';
import { branding } from '@/lib/branding';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-extrabold">
              V
            </div>
            <span className="text-xl font-extrabold tracking-tight text-primary">
              {branding.productName}
            </span>
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -right-24 h-[24rem] w-[24rem] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-[20rem] w-[20rem] rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              Get started
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-balance leading-[1.02]">
              Join{' '}
              <span className="text-primary">
                {branding.productName}.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
              Create your account in under two minutes and start sending money to friends and family.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Free to sign up
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Send money to anyone
              </li>
              <li className="flex items-center gap-3">
                <Check />
                {branding.payoutVerb} to your bank or card
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-7 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold tracking-tight">Create your account</h2>
              <p className="text-base text-muted-foreground mt-1">
                Tell us a bit about yourself.
              </p>
            </div>
            <SignupForm />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-bold tracking-widest">
                  Already have an account?
                </span>
              </div>
            </div>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-full border-2 border-primary h-11 px-5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Log in
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
