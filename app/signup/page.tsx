import Link from 'next/link';
import { SignupForm } from '@/components/SignupForm';
import { branding } from '@/lib/branding';

export default function SignupPage() {
  const monogram = branding.productName.charAt(0);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] bg-background">
      <aside className="relative hidden lg:flex flex-col justify-between bg-ink text-white p-12 overflow-hidden lg:order-2">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 20% -10%, rgba(212,160,23,0.22), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(180,83,9,0.18), transparent 60%), #0A0A0A',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <Link href="/" className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/10 text-gold-bright font-display border border-white/15">
            {monogram}
          </span>
          <span className="font-display text-lg tracking-tightest">{branding.productName}</span>
        </Link>

        <div className="max-w-md">
          <p className="text-[11px] tracking-[0.18em] uppercase text-white/50 mb-5">
            New account
          </p>
          <h2 className="font-display text-4xl xl:text-5xl tracking-tightest leading-[1.05] text-balance">
            Open a console for <em className="not-italic text-gold-bright">your house.</em>
          </h2>
          <p className="mt-5 text-white/60 leading-relaxed">
            Spin up an operator account in under two minutes. We&apos;ll provision your Root
            payer, your {branding.merchantSingular.toLowerCase()} subaccount, and a clean ledger —
            wired to the team you add next.
          </p>

          <ul className="mt-10 space-y-3 text-sm text-white/70">
            <Bullet>Same-day onboarding, sandbox-safe</Bullet>
            <Bullet>Bank or debit card payouts per {branding.payeeSingular.toLowerCase()}</Bullet>
            <Bullet>One ledger, every payout, every time</Bullet>
          </ul>
        </div>

        <p className="text-[11px] tracking-[0.18em] uppercase text-white/40">
          Powered by Root &middot; Bank-grade security
        </p>
      </aside>

      <main className="flex flex-col lg:order-1">
        <div className="lg:hidden border-b border-neutral-200 bg-surface px-6 py-5">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-ink text-gold-bright font-display border border-neutral-200">
              {monogram}
            </span>
            <span className="font-display text-lg tracking-tightest">{branding.productName}</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-20">
          <div className="w-full max-w-md">
            <p className="text-eyebrow mb-3">Get started</p>
            <h1 className="font-display text-4xl tracking-tightest mb-3">Create your account</h1>
            <p className="text-sm text-neutral-500 leading-relaxed mb-10">
              Tell us about your {branding.merchantSingular.toLowerCase()}. We&apos;ll set up your
              operator console and provision the payment rails behind it.
            </p>

            <SignupForm />

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-[11px] tracking-[0.18em] uppercase text-neutral-400">
                Already onboarded?
              </span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <Link
              href="/login"
              className="block w-full text-center px-4 py-3 rounded-md border border-neutral-300 hover:border-ink hover:bg-neutral-50 transition-smooth text-sm font-medium"
            >
              Sign in to an existing console
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        className="mt-0.5 flex-none text-gold-bright"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="8" r="6.5" />
        <path d="M5.5 8.2l1.8 1.8 3.2-3.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </li>
  );
}
