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
              'radial-gradient(ellipse at 80% -10%, rgba(6,182,212,0.12), transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(8,145,178,0.10), transparent 60%), #0F172A',
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
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/10 text-cyan-400 font-display border border-white/15">
            {monogram}
          </span>
          <span className="font-display text-lg tracking-tightest">{branding.productName}</span>
        </Link>

        <div className="max-w-md">
          <p className="text-[11px] tracking-[0.18em] uppercase text-white/50 mb-5">
            Enterprise Console
          </p>
          <h2 className="font-display text-4xl xl:text-5xl tracking-tightest leading-[1.05] text-balance">
            Workforce operations command center.
          </h2>
          <p className="mt-5 text-white/60 leading-relaxed">
            Sign in with your enterprise credentials. {branding.productName} connects you to integrated payroll, employee management, and operational dashboards.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <Stat label="Organizations" value="12K+" />
            <Stat label="Employees managed" value="2.3M" accent />
          </div>
        </div>

        <p className="text-[11px] tracking-[0.18em] uppercase text-white/40">
          Powered by Root &middot; Bank-grade security &middot; SOC 2 Certified
        </p>
      </aside>

      <main className="flex flex-col">
        <div className="lg:hidden border-b border-neutral-200 bg-surface px-6 py-5">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-ink text-cyan-500 font-display border border-neutral-200">
              {monogram}
            </span>
            <span className="font-display text-lg tracking-tightest">{branding.productName}</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-20">
          <div className="w-full max-w-md">
            <p className="text-eyebrow mb-3">Sign in</p>
            <h1 className="font-display text-4xl tracking-tightest mb-3">Enterprise login</h1>
            <p className="text-sm text-neutral-500 leading-relaxed mb-10">
              Sign in with your enterprise credentials. Access your {branding.payerSingular.toLowerCase()} account and workforce management dashboard.
            </p>

            <LoginForm />

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-[11px] tracking-[0.18em] uppercase text-neutral-400">
                New organization?
              </span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <Link
              href="/signup"
              className="block w-full text-center px-4 py-3 rounded-md border border-neutral-300 hover:border-ink hover:bg-neutral-50 transition-smooth text-sm font-medium"
            >
              Set up a {branding.productName} account
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
          accent ? 'text-cyan-400' : 'text-white'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
