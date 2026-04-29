import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';
import { branding } from '@/lib/branding';

export default function LoginPage() {
  const monogram = branding.productName.charAt(0);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] bg-background">
      <aside className="relative hidden lg:flex flex-col justify-between bg-ink text-white p-12 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 80% -10%, rgba(212,160,23,0.22), transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(180,83,9,0.18), transparent 60%), #0A0A0A',
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
            Operator console
          </p>
          <h2 className="font-display text-4xl xl:text-5xl tracking-tightest leading-[1.05] text-balance">
            Welcome back to <em className="not-italic text-gold-bright">the house.</em>
          </h2>
          <p className="mt-5 text-white/60 leading-relaxed">
            Sign in with the email you used at signup. {branding.productName} routes you to your{' '}
            {branding.payerPossessive} console — {branding.payeePlural.toLowerCase()}, payouts, treasury,
            all in one place.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <Stat label="Median payout" value="4.2s" />
            <Stat label="Settled tonight" value="$1,482" accent />
          </div>
        </div>

        <p className="text-[11px] tracking-[0.18em] uppercase text-white/40">
          Powered by Root &middot; Bank-grade security
        </p>
      </aside>

      <main className="flex flex-col">
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
            <p className="text-eyebrow mb-3">Sign in</p>
            <h1 className="font-display text-4xl tracking-tightest mb-3">Operator login</h1>
            <p className="text-sm text-neutral-500 leading-relaxed mb-10">
              Sign in with the email used at signup. Each email maps to a single{' '}
              {branding.payerSingular.toLowerCase()} account in your console.
            </p>

            <LoginForm />

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-[11px] tracking-[0.18em] uppercase text-neutral-400">
                New here?
              </span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <Link
              href="/signup"
              className="block w-full text-center px-4 py-3 rounded-md border border-neutral-300 hover:border-ink hover:bg-neutral-50 transition-smooth text-sm font-medium"
            >
              Create a {branding.productName} account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur p-4">
      <div className="text-[10px] tracking-[0.18em] uppercase text-white/50">{label}</div>
      <div
        className={`font-display text-2xl mt-1.5 tracking-tightest ${
          accent ? 'text-gold-bright' : 'text-white'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
